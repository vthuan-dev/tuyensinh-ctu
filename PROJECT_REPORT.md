# BÁO CÁO DỰ ÁN: HỆ THỐNG QUẢN LÝ TƯ VẤN TUYỂN SINH

## 📋 TỔNG QUAN DỰ ÁN

**Tên dự án:** Admissions Consulting Module  
**Mục đích:** Hệ thống quản lý tư vấn tuyển sinh cho trường đại học/trung tâm đào tạo  
**Công nghệ:** Node.js + Express.js + MongoDB + Next.js  
**Kiến trúc:** Monorepo với Nx workspace  

## 🎯 MỤC TIÊU NGHIỆP VỤ

### 1. Quản lý học viên (Student Management)
- **Thu thập thông tin học viên:** Tên, email, số điện thoại, Zalo, Facebook, ngày sinh, giới tính
- **Theo dõi trạng thái:** Lead → Engaging → Registered → Dropped Out/Archived
- **Quản lý nguồn tiếp cận:** Mail, Fanpage, Zalo, Website, Friend, SMS, Banderole, Poster, Brochure, Google, Brand, Event
- **Lưu trữ thông tin học vấn:** Trình độ hiện tại (THPT/SinhVien/Other), tên trường cấp 3
- **Quản lý đồng ý thông báo:** Agree/Disagree/Other

### 2. Quản lý tư vấn viên (Counselor Management)
- **Phân quyền người dùng:** Admin, Counselor, Manager
- **Quản lý chuyên môn:** Chuyên ngành tư vấn viên
- **Theo dõi KPI:** Mục tiêu và hiệu suất tư vấn viên
- **Quản lý lịch làm việc:** Ngày tuyển dụng, trạng thái (active/inactive/on_leave)

### 3. Quản lý khóa học (Course Management)
- **Danh mục khóa học:** Aptech, Arena, Short-term + Steam
- **Thông tin khóa học:** Tên, mô tả, thời gian, giá, trạng thái active
- **Quản lý sự quan tâm:** Học viên quan tâm khóa học nào
- **Quản lý đăng ký:** Học viên đăng ký khóa học với phí và trạng thái thanh toán

### 4. Quản lý phiên tư vấn (Consultation Sessions)
- **Lên lịch tư vấn:** Ngày, giờ, loại phiên (Phone Call, Online Meeting, In-Person, Email, Chat)
- **Theo dõi trạng thái:** Scheduled, Completed, Canceled, No Show
- **Ghi chú tư vấn:** Nội dung, kết quả, thời gian
- **Liên kết với enrollment:** Phiên tư vấn dẫn đến đăng ký khóa học

### 5. Báo cáo và thống kê (Analytics & Reporting)
- **Dashboard tổng quan:** Số liệu học viên, tư vấn viên, khóa học
- **Biểu đồ hiệu suất:** KPI tư vấn viên, tỷ lệ chuyển đổi
- **Xuất báo cáo:** Excel với dữ liệu chi tiết
- **Theo dõi xu hướng:** Phân tích nguồn học viên, hiệu quả tư vấn

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Backend (Node.js + Express.js + TypeScript)
```
org/apps/api/
├── src/
│   ├── controllers/          # API Controllers
│   │   ├── auth.controller.ts
│   │   ├── student.controller.ts
│   │   ├── user.controller.ts
│   │   ├── course.controller.ts
│   │   ├── consultation-session.controller.ts
│   │   ├── consulting-information-management.controller.ts
│   │   ├── counselor-kpi-target.controller.ts
│   │   ├── counselor-specialization.controller.ts
│   │   ├── course-category.controller.ts
│   │   ├── kpi-definition.controller.ts
│   │   ├── student-enrollment.controller.ts
│   │   ├── student-status-history.controller.ts
│   │   ├── sendexcel.controller.ts
│   │   └── uploadfile.controller.ts
│   ├── models/             # Mongoose Models
│   │   ├── User.model.ts
│   │   ├── Student.model.ts
│   │   ├── Course.model.ts
│   │   ├── ConsultationSession.model.ts
│   │   ├── StudentEnrollment.model.ts
│   │   └── ...
│   ├── services/            # Business Logic
│   ├── middlewares/         # Authentication, CORS
│   ├── config/             # Database config
│   │   └── database.ts     # MongoDB connection
│   └── main.ts             # Application entry point
├── package.json
└── .env
```

### Frontend (reatcjs)
```
org/web/
├── src/
│   ├── app/              # App Router
│   │   ├── (admin)/     # Admin routes
│   │   │   ├── dashboard/
│   │   │   ├── history/
│   │   │   ├── register/
│   │   │   └── report/
│   │   ├── (user)/      # User routes
│   │   │   ├── form/
│   │   │   └── home/
│   │   ├── login/
│   │   ├── auth/register/
│   │   └── course/
│   ├── components/      # React Components
│   ├── hooks/          # Custom Hooks
│   ├── services/       # API Services
│   ├── lib/           # Utilities
│   └── style/         # CSS Styles
└── package.json
```

## 🗄️ CƠ SỞ DỮ LIỆU (MongoDB)

### Các Collections chính:

1. **users** - Người dùng hệ thống
   ```javascript
   {
     _id: ObjectId,
     email: String,
     password_hash: String,
     full_name: String,
     user_type: String, // 'admin', 'counselor', 'manager'
     is_main_consultant: Boolean,
     kpi_group_id: ObjectId,
     employment_date: Date,
     status: String, // 'active', 'inactive', 'on_leave'
     program_type: String,
     createdAt: Date,
     updatedAt: Date
   }
   ```

2. **students** - Học viên
   ```javascript
   {
     _id: ObjectId,
     student_name: String,
     email: String,
     phone_number: String,
     gender: String,
     zalo_phone: String,
     link_facebook: String,
     date_of_birth: Date,
     current_education_level: String, // 'THPT', 'SinhVien', 'Other'
     high_school_name: String,
     city: String,
     source: String, // 'Mail', 'Fanpage', 'Zalo', etc.
     notification_consent: String, // 'Agree', 'Disagree', 'Other'
     current_status: String, // 'Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived'
     assigned_counselor_id: ObjectId,
     createdAt: Date,
     updatedAt: Date
   }
   ```

3. **courses** - Khóa học
   ```javascript
   {
     _id: ObjectId,
     category_id: ObjectId,
     name: String,
     description: String,
     duration_text: String,
     price: Number,
     is_active: Boolean,
     program_type: String,
     createdAt: Date,
     updatedAt: Date
   }
   ```

4. **consultation_sessions** - Phiên tư vấn
   ```javascript
   {
     _id: ObjectId,
     counselor_id: ObjectId,
     student_id: ObjectId,
     session_date: Date,
     duration_minutes: Number,
     notes: String,
     session_type: String, // 'Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat'
     session_status: String, // 'Scheduled', 'Completed', 'Canceled', 'No Show'
     createdAt: Date,
     updatedAt: Date
   }
   ```

5. **student_enrollments** - Đăng ký khóa học
   ```javascript
   {
     _id: ObjectId,
     student_id: ObjectId,
     course_id: ObjectId,
     enrollment_date: Date,
     fee_paid: Number,
     payment_status: String,
     counselor_id: ObjectId,
     consultation_session_id: ObjectId,
     createdAt: Date,
     updatedAt: Date
   }
   ```

6. **counselor_kpi_targets** - Mục tiêu KPI tư vấn viên
   ```javascript
   {
     _id: ObjectId,
     counselor_id: ObjectId,
     kpi_id: ObjectId,
     target_value: Number,
     start_date: Date,
     end_date: Date,
     createdAt: Date,
     updatedAt: Date
   }
   ```

7. **kpi_definitions** - Định nghĩa KPI
   ```javascript
   {
     _id: ObjectId,
     name: String,
     unit: String,
     createdAt: Date,
     updatedAt: Date
   }
   ```

8. **course_categories** - Danh mục khóa học
   ```javascript
   {
     _id: ObjectId,
     name: String,
     description: String,
     createdAt: Date,
     updatedAt: Date
   }
   ```

9. **student_interested_courses** - Khóa học quan tâm
   ```javascript
   {
     _id: ObjectId,
     student_id: ObjectId,
     course_id: ObjectId,
     interest_date: Date,
     notes: String,
     createdAt: Date,
     updatedAt: Date
   }
   ```

10. **student_status_history** - Lịch sử trạng thái học viên
    ```javascript
    {
      _id: ObjectId,
      student_id: ObjectId,
      old_status: String,
      new_status: String,
      change_date: Date,
      changed_by_user_id: ObjectId,
      createdAt: Date,
      updatedAt: Date
    }
    ```

11. **counselor_specializations** - Chuyên môn tư vấn viên
    ```javascript
    {
      _id: ObjectId,
      name: String,
      description: String,
      createdAt: Date,
      updatedAt: Date
    }
    ```

## 🔧 API ENDPOINTS

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh-token` - Làm mới token

### Student Management
- `GET /api/students` - Lấy danh sách học viên
- `POST /api/students` - Tạo học viên mới
- `PUT /api/students/:id` - Cập nhật học viên
- `DELETE /api/students/:id` - Xóa học viên

### Course Management
- `GET /api/courses` - Lấy danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id` - Cập nhật khóa học
- `GET /api/course-categories` - Lấy danh mục khóa học

### Consultation Sessions
- `GET /api/consultation-sessions` - Lấy danh sách phiên tư vấn
- `POST /api/consultation-sessions` - Tạo phiên tư vấn mới
- `PUT /api/consultation-sessions/:id` - Cập nhật phiên tư vấn

### Consulting Information Management
- `GET /api/consulting-information` - Lấy thông tin tư vấn tổng hợp
- `PUT /api/consulting-information/:id` - Cập nhật thông tin tư vấn

### KPI Management
- `GET /api/kpi-definitions` - Lấy định nghĩa KPI
- `GET /api/counselor-kpi-targets` - Lấy mục tiêu KPI tư vấn viên
- `POST /api/counselor-kpi-targets` - Tạo mục tiêu KPI mới

### File Operations
- `POST /api/upload` - Upload file
- `GET /api/export/excel` - Xuất dữ liệu ra Excel

## 🎨 GIAO DIỆN NGƯỜI DÙNG

### Admin Dashboard
- **Trang chủ:** Dashboard với thống kê tổng quan
- **Quản lý học viên:** Bảng dữ liệu với tìm kiếm, lọc, sắp xếp
- **Quản lý tư vấn viên:** Danh sách và thông tin chi tiết
- **Báo cáo:** Biểu đồ và xuất Excel
- **Lịch sử:** Theo dõi thay đổi trạng thái

### User Interface
- **Đăng ký học viên:** Form nhập thông tin
- **Trang chủ:** Thông tin khóa học
- **Đăng nhập/Đăng ký:** Authentication

## 🔐 BẢO MẬT VÀ PHÂN QUYỀN

### Authentication
- JWT-based authentication
- Refresh token mechanism
- Password hashing với bcrypt

### Authorization
- **Admin:** Toàn quyền hệ thống
- **Manager:** Quản lý tư vấn viên và KPI
- **Counselor:** Quản lý học viên được phân công

### Data Security
- Input validation với Joi hoặc Zod schemas
- NoSQL injection prevention với Mongoose
- CORS configuration
- Rate limiting

## 📊 TÍNH NĂNG BÁO CÁO

### Dashboard Metrics
- Tổng số học viên theo trạng thái
- Hiệu suất tư vấn viên
- Tỷ lệ chuyển đổi Lead → Registered
- Phân tích nguồn học viên
- Thống kê khóa học

### Export Features
- Xuất danh sách học viên ra Excel
- Báo cáo KPI tư vấn viên
- Lịch sử phiên tư vấn
- Thống kê đăng ký khóa học

## 🚀 DEPLOYMENT VÀ VẬN HÀNH

### Development
```bash
# Chạy toàn bộ hệ thống
pnpm run start:all

# Chạy riêng backend
pnpm nx serve api

# Chạy riêng frontend
pnpm nx serve web
```

### Production
- Backend: Port 3000
- Frontend: Port 4200
- Database: MongoDB
- File storage: Local filesystem hoặc GridFS

## 📈 ROADMAP PHÁT TRIỂN

### Phase 1 (Hiện tại)
- ✅ Quản lý học viên cơ bản
- ✅ Hệ thống authentication
- ✅ Dashboard admin
- ✅ CRUD operations

### Phase 2 (Tương lai)
- 🔄 Notification system
- 🔄 Email automation
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Integration với CRM khác

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB với Mongoose ODM
- **Authentication:** JWT
- **Validation:** Joi hoặc Zod
- **Documentation:** Swagger/OpenAPI
<!-- 
### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod -->

### DevOps
- **Monorepo:** Nx workspace
- **Package Manager:** pnpm
- **Version Control:** Git
- **Database:** MongoDB (No migrations needed)

## 🔗 MONGODB CONNECTION

### Database Configuration
```typescript
// config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### Environment Variables
```bash
# .env
MONGODB_URI=mongodb://localhost:27017/admissions-consulting
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
```

## 📝 HƯỚNG DẪN SỬ DỤNG CHO DEVELOPER

### Setup Development Environment
1. Clone repository
2. Install dependencies: `pnpm install`
3. Setup MongoDB: Tạo database và connection string
4. Start development: `pnpm run start:all`

### Code Structure Guidelines
- Controllers: Xử lý HTTP requests
- Services: Business logic
- Models: Mongoose schemas
- Middlewares: Authentication, logging
- Utils: Helper functions

### Database Guidelines
- Sử dụng Mongoose ODM
- Schema validation với Mongoose
- Indexes cho performance
- References cho data integrity

### API Guidelines
- RESTful API design
- Consistent response format với jsend
- Error handling
- Input validation
- Documentation với Swagger

---

**Lưu ý:** Đây là báo cáo chi tiết về dự án hệ thống quản lý tư vấn tuyển sinh với MongoDB và Express.js. Sử dụng thông tin này để hiểu rõ yêu cầu và phát triển backend một cách hiệu quả.
