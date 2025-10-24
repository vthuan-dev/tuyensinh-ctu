# Hướng dẫn sử dụng các tính năng mới

## Tổng quan

Dự án đã được mở rộng với các tính năng mới theo danh sách Use Case đã cung cấp:

### 1. Admin Features (A1-A4)
- **A1 - Thống kê & báo cáo tổng**: API `/api/admin/statistics`
- **A2 - Quản lý cấu hình hệ thống**: Model `SystemConfig`
- **A3 - Giám sát quy trình tư vấn**: API `/api/admin/reports`
- **A4 - Xuất báo cáo định kỳ**: API `/api/admin/reports/generate`

### 2. Counselor Features (C1-C7)
- **C1 - Đăng nhập hệ thống**: API `/api/auth/login`
- **C2 - Quản lý thông tin học viên**: API `/api/students/*`
- **C3 - Quản lý lịch hẹn tư vấn**: API `/api/schedules/*`, `/api/appointments/*`
- **C4 - Quản lý lịch sử tư vấn**: API `/api/consultation-sessions/*`
- **C5 - Gửi Email/SMS tự động**: API `/api/notifications/*`
- **C6 - Thống kê tư vấn cá nhân**: API `/api/admin/statistics?counselor_id=...`
- **C7 - Đồng bộ học viên đã đăng ký**: API `/api/ocr/documents/*/create-student`

### 3. Student Features (S1-S3)
- **S1 - Xem danh sách khóa học**: API `/api/public/courses/*`
- **S2 - Đăng ký tư vấn trực tuyến**: API `/api/public/consultation/register`
- **S3 - Nhận Email/SMS xác nhận**: Tự động qua notification system

### 4. System/OCR Features (SYS1-SYS5)
- **SYS1 - OCR phiếu tư vấn**: API `/api/ocr/process`
- **SYS2 - Làm sạch & chuẩn hóa dữ liệu**: API `/api/ocr/documents/*/verify`
- **SYS3 - Nhập liệu linh hoạt**: API `/api/ocr/documents/*/create-student`
- **SYS4 - Trực quan hóa & phân tích dữ liệu**: API `/api/admin/statistics`
- **SYS5 - Đồng bộ dữ liệu sang hệ thống đào tạo**: API `/api/ocr/documents/*/create-student`

## Models mới

### 1. Notification.model.ts
Quản lý thông báo email, SMS và system notifications.

### 2. Schedule.model.ts
Quản lý lịch làm việc của counselor.

### 3. Appointment.model.ts
Quản lý lịch hẹn tư vấn.

### 4. SystemConfig.model.ts
Quản lý cấu hình hệ thống.

### 5. Report.model.ts
Quản lý báo cáo và thống kê.

### 6. OCRDocument.model.ts
Quản lý tài liệu OCR và dữ liệu được trích xuất.

## Controllers mới

### 1. admin.controller.ts
- `getStatistics()`: Lấy thống kê tổng quan
- `generateReport()`: Tạo báo cáo
- `getReports()`: Lấy danh sách báo cáo
- `downloadReport()`: Tải xuống báo cáo

### 2. notification.controller.ts
- `sendNotification()`: Gửi thông báo đơn lẻ
- `sendBulkNotification()`: Gửi thông báo hàng loạt
- `getNotifications()`: Lấy danh sách thông báo
- `updateNotificationStatus()`: Cập nhật trạng thái thông báo

### 3. schedule.controller.ts
- `createSchedule()`: Tạo lịch làm việc
- `getSchedules()`: Lấy danh sách lịch làm việc
- `createAppointment()`: Đặt lịch hẹn
- `getAppointments()`: Lấy danh sách lịch hẹn
- `updateAppointment()`: Cập nhật lịch hẹn

### 4. ocr.controller.ts
- `processOCR()`: Xử lý OCR từ file
- `getOCRDocuments()`: Lấy danh sách tài liệu OCR
- `verifyOCRData()`: Xác minh dữ liệu OCR
- `createStudentFromOCR()`: Tạo học viên từ dữ liệu OCR

### 5. student-features.controller.ts
- `getPublicCourses()`: Lấy danh sách khóa học công khai
- `getPublicCourseById()`: Lấy chi tiết khóa học
- `registerOnlineConsultation()`: Đăng ký tư vấn trực tuyến
- `checkConsultationStatus()`: Kiểm tra trạng thái đăng ký

## Services mới

### 1. email.service.ts
Xử lý gửi email với các template có sẵn.

### 2. sms.service.ts
Xử lý gửi SMS qua Twilio.

### 3. ocr.service.ts
Xử lý OCR từ hình ảnh và PDF (cần cài đặt dependencies).

### 4. queue.service.ts
Xử lý queue và background jobs.

### 5. report.service.ts
Tạo báo cáo Excel và PDF.

## Dependencies mới

Các dependencies đã được thêm vào `package.json`:

```json
{
  "nodemailer": "^6.9.7",
  "twilio": "^4.19.0",
  "puppeteer": "^21.6.1",
  "tesseract.js": "^5.0.2",
  "pdf-parse": "^1.1.1",
  "sharp": "^0.33.0",
  "bull": "^4.12.2",
  "redis": "^4.6.10",
  "node-cron": "^3.0.3"
}
```

## Biến môi trường mới

Cập nhật file `.env` với các biến mới:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourcompany.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OCR Configuration
OCR_LANGUAGE=vie+eng
OCR_CONFIDENCE_THRESHOLD=0.6
```

## Cài đặt và chạy

1. Cài đặt dependencies mới:
```bash
npm install
```

2. Cấu hình Redis (cho queue system):
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# Tải Redis từ https://redis.io/download
```

3. Cấu hình email (Gmail):
- Tạo App Password trong Google Account
- Cập nhật `EMAIL_USER` và `EMAIL_PASSWORD`

4. Cấu hình SMS (Twilio):
- Đăng ký tài khoản Twilio
- Lấy Account SID và Auth Token
- Cập nhật các biến Twilio

5. Chạy ứng dụng:
```bash
npm run dev
```

## API Documentation

Truy cập Swagger UI tại: `http://localhost:3000/api-docs`

## Lưu ý

- Các tính năng OCR cần cài đặt thêm dependencies và cấu hình
- Queue system cần Redis để hoạt động
- Email và SMS cần cấu hình đúng credentials
- Các tính năng báo cáo cần Puppeteer để tạo PDF
