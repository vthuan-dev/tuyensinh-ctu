import nodemailer from 'nodemailer';
import { config } from '@/config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.emailFrom,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendBulkEmails(recipients: Array<{email: string, name?: string}>, subject: string, html: string, text?: string): Promise<{success: number, failed: number}> {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const personalizedHtml = html.replace(/{{name}}/g, recipient.name || '');
      const personalizedText = text?.replace(/{{name}}/g, recipient.name || '');
      
      const result = await this.sendEmail(recipient.email, subject, personalizedHtml, personalizedText);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  generateAppointmentConfirmationTemplate(studentName: string, appointmentDate: string, appointmentTime: string, counselorName: string, appointmentType: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác nhận lịch hẹn tư vấn</h2>
        <p>Xin chào <strong>${studentName}</strong>,</p>
        <p>Chúng tôi xác nhận lịch hẹn tư vấn của bạn:</p>
        <ul>
          <li><strong>Ngày:</strong> ${appointmentDate}</li>
          <li><strong>Giờ:</strong> ${appointmentTime}</li>
          <li><strong>Hình thức:</strong> ${appointmentType}</li>
          <li><strong>Tư vấn viên:</strong> ${counselorName}</li>
        </ul>
        <p>Vui lòng liên hệ với chúng tôi nếu bạn cần thay đổi lịch hẹn.</p>
        <p>Trân trọng,<br>Đội ngũ tư vấn tuyển sinh</p>
      </div>
    `;
  }

  generateCourseNotificationTemplate(studentName: string, courseName: string, courseDescription: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Khóa học mới: ${courseName}</h2>
        <p>Xin chào <strong>${studentName}</strong>,</p>
        <p>Chúng tôi xin thông báo về khóa học mới có thể phù hợp với bạn:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${courseName}</h3>
          <p>${courseDescription}</p>
        </div>
        <p>Để biết thêm thông tin chi tiết, vui lòng liên hệ với chúng tôi.</p>
        <p>Trân trọng,<br>Đội ngũ tư vấn tuyển sinh</p>
      </div>
    `;
  }
}

export default new EmailService();
