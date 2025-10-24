import twilio from 'twilio';
import { config } from '@/config';

class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: config.twilioPhoneNumber,
        to: to
      });

      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendBulkSMS(recipients: Array<{phone: string, name?: string}>, message: string): Promise<{success: number, failed: number}> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const personalizedMessage = message.replace(/{{name}}/g, recipient.name || '');
      const result = await this.sendSMS(recipient.phone, personalizedMessage);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  generateAppointmentReminderMessage(studentName: string, appointmentDate: string, appointmentTime: string): string {
    return `Xin chào ${studentName}, đây là lời nhắc về lịch hẹn tư vấn của bạn vào ${appointmentDate} lúc ${appointmentTime}. Vui lòng liên hệ nếu cần thay đổi.`;
  }

  generateCourseNotificationMessage(studentName: string, courseName: string): string {
    return `Xin chào ${studentName}, chúng tôi có khóa học mới "${courseName}" có thể phù hợp với bạn. Liên hệ để biết thêm chi tiết.`;
  }
}

export default new SMSService();
