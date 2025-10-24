import request from 'supertest';
import app from '../main';
import { connectDB } from '../config/database';
import User from '../models/User.model';
import Student from '../models/Student.model';

describe('New Features Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test/ });
    await Student.deleteMany({ email: /test/ });
  });

  describe('Admin Features', () => {
    test('GET /api/admin/statistics should return system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.source_statistics).toBeDefined();
      expect(response.body.data.counselor_performance).toBeDefined();
    });

    test('POST /api/admin/reports/generate should create a report', async () => {
      const reportData = {
        report_type: 'statistics',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        file_format: 'excel'
      };

      const response = await request(app)
        .post('/api/admin/reports/generate')
        .send(reportData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report_id).toBeDefined();
    });
  });

  describe('Notification Features', () => {
    test('POST /api/notifications should send a notification', async () => {
      const notificationData = {
        recipient_ids: ['507f1f77bcf86cd799439011'],
        recipient_type: 'student',
        notification_type: 'email',
        title: 'Test Notification',
        content: 'This is a test notification'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
    });

    test('POST /api/notifications/bulk should send bulk notifications', async () => {
      const bulkData = {
        recipient_type: 'student',
        notification_type: 'email',
        title: 'Bulk Test Notification',
        content: 'This is a bulk test notification',
        filters: {
          status: 'Lead'
        }
      };

      const response = await request(app)
        .post('/api/notifications/bulk')
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Schedule Features', () => {
    test('POST /api/schedules should create a schedule', async () => {
      const scheduleData = {
        counselor_id: '507f1f77bcf86cd799439011',
        date: '2024-12-31',
        start_time: '09:00',
        end_time: '17:00',
        max_appointments: 10
      };

      const response = await request(app)
        .post('/api/schedules')
        .send(scheduleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.counselor_id).toBe(scheduleData.counselor_id);
    });

    test('GET /api/schedules should return schedules', async () => {
      const response = await request(app)
        .get('/api/schedules')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Student Features', () => {
    test('GET /api/public/courses should return public courses', async () => {
      const response = await request(app)
        .get('/api/public/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    test('POST /api/public/consultation/register should register consultation', async () => {
      const consultationData = {
        student_name: 'Test Student',
        email: 'test@example.com',
        phone_number: '0123456789',
        gender: 'male',
        date_of_birth: '2000-01-01',
        current_education_level: 'THPT',
        city: 'Ho Chi Minh City',
        source: 'Website',
        notification_consent: 'Agree'
      };

      const response = await request(app)
        .post('/api/public/consultation/register')
        .send(consultationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.student_id).toBeDefined();
    });
  });

  describe('OCR Features', () => {
    test('POST /api/ocr/process should process OCR document', async () => {
      const ocrData = {
        file_path: '/path/to/test/file.jpg',
        original_filename: 'test.jpg',
        file_type: 'image',
        file_size: 1024000
      };

      const response = await request(app)
        .post('/api/ocr/process')
        .send(ocrData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document_id).toBeDefined();
    });

    test('GET /api/ocr/documents should return OCR documents', async () => {
      const response = await request(app)
        .get('/api/ocr/documents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });
  });
});
