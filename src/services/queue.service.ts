import Bull from 'bull';
import { config } from '@/config';
import emailService from './email.service';
import smsService from './sms.service';
import Notification from '@/models/Notification.model';

class QueueService {
  private emailQueue: Bull.Queue;
  private smsQueue: Bull.Queue;
  private notificationQueue: Bull.Queue;

  constructor() {
    // Initialize queues
    this.emailQueue = new Bull('email queue', {
      redis: {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
      }
    });

    this.smsQueue = new Bull('sms queue', {
      redis: {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
      }
    });

    this.notificationQueue = new Bull('notification queue', {
      redis: {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
      }
    });

    this.setupProcessors();
  }

  private setupProcessors() {
    // Email processor
    this.emailQueue.process('send-email', async (job) => {
      const { to, subject, html, text } = job.data;
      const result = await emailService.sendEmail(to, subject, html, text);
      
      if (result) {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          status: 'sent',
          sent_at: new Date()
        });
      } else {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          status: 'failed',
          error_message: 'Email sending failed'
        });
      }
    });

    // SMS processor
    this.smsQueue.process('send-sms', async (job) => {
      const { to, message } = job.data;
      const result = await smsService.sendSMS(to, message);
      
      if (result) {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          status: 'sent',
          sent_at: new Date()
        });
      } else {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          status: 'failed',
          error_message: 'SMS sending failed'
        });
      }
    });

    // Notification processor
    this.notificationQueue.process('process-notification', async (job) => {
      const { notificationId } = job.data;
      
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      // Check if notification should be sent now
      if (notification.scheduled_at && notification.scheduled_at > new Date()) {
        // Reschedule for later
        await this.scheduleNotification(notification);
        return;
      }

      // Process based on notification type
      switch (notification.notification_type) {
        case 'email':
          await this.emailQueue.add('send-email', {
            to: notification.recipient_id,
            subject: notification.title,
            html: notification.content,
            notificationId: notification._id
          });
          break;
        case 'sms':
          await this.smsQueue.add('send-sms', {
            to: notification.recipient_id,
            message: notification.content,
            notificationId: notification._id
          });
          break;
        case 'system':
          // Handle system notifications (in-app, push notifications, etc.)
          await Notification.findByIdAndUpdate(notification._id, {
            status: 'sent',
            sent_at: new Date()
          });
          break;
      }
    });
  }

  async scheduleNotification(notification: any) {
    const delay = notification.scheduled_at ? 
      notification.scheduled_at.getTime() - Date.now() : 0;

    await this.notificationQueue.add('process-notification', {
      notificationId: notification._id
    }, { delay });
  }

  async scheduleEmail(to: string, subject: string, html: string, text?: string, scheduledAt?: Date) {
    const notification = new Notification({
      recipient_id: to,
      recipient_type: 'student',
      notification_type: 'email',
      title: subject,
      content: html,
      scheduled_at: scheduledAt
    });

    await notification.save();
    await this.scheduleNotification(notification);
  }

  async scheduleSMS(to: string, message: string, scheduledAt?: Date) {
    const notification = new Notification({
      recipient_id: to,
      recipient_type: 'student',
      notification_type: 'sms',
      title: 'SMS Notification',
      content: message,
      scheduled_at: scheduledAt
    });

    await notification.save();
    await this.scheduleNotification(notification);
  }

  async scheduleAppointmentReminder(appointment: any) {
    const reminderTime = new Date(appointment.appointment_date);
    reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

    if (reminderTime > new Date()) {
      await this.scheduleEmail(
        appointment.student_id.email,
        'Nhắc nhở lịch hẹn tư vấn',
        emailService.generateAppointmentConfirmationTemplate(
          appointment.student_id.student_name,
          appointment.appointment_date,
          appointment.start_time,
          appointment.counselor_id.full_name,
          appointment.appointment_type
        ),
        undefined,
        reminderTime
      );
    }
  }

  async scheduleCourseNotification(student: any, course: any) {
    await this.scheduleEmail(
      student.email,
      `Khóa học mới: ${course.course_name}`,
      emailService.generateCourseNotificationTemplate(
        student.student_name,
        course.course_name,
        course.description
      )
    );
  }
}

export default new QueueService();
