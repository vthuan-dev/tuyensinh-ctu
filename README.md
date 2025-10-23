# Hệ Thống Quản Lý Tư Vấn Tuyển Sinh - Backend

Backend API cho hệ thống quản lý tư vấn tuyển sinh sử dụng Node.js, Express.js, TypeScript và MongoDB.

## 🚀 Công Nghệ Sử Dụng

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB với Mongoose ODM
- **Authentication:** JWT
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm hoặc pnpm

## 🛠️ Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd admissions-consulting-backend
```

### 2. Cài Đặt Dependencies
```bash
npm install
# hoặc
pnpm install
```

### 3. Cấu Hình Environment
```bash
cp env.example .env
```

**Lưu ý:** Nếu gặp lỗi `Cannot find module '@/config'`, hãy chạy:
```bash
npm install tsconfig-paths
```

Chỉnh sửa file `.env` với các thông tin của bạn:
```env
MONGODB_URI=mongodb://localhost:27017/admissions-consulting
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
PORT=3000
NODE_ENV=development
```

### 4. Khởi Động MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn.

### 5. Chạy Ứng Dụng

#### Development Mode
```bash
npm run dev
# hoặc
pnpm dev
```

#### Production Mode
```bash
npm run build
npm start
```

## 📖 API Documentation

Sau khi chạy server, bạn có thể truy cập Swagger UI để test API:

- **Swagger UI:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health

Swagger UI cung cấp giao diện trực quan để:
- Xem tất cả API endpoints
- Test API trực tiếp từ browser
- Xem request/response schemas
- Thử nghiệm authentication

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Làm mới token

### Student Management
- `GET /api/students` - Lấy danh sách học viên (có phân trang và lọc)
- `GET /api/students/:id` - Lấy thông tin học viên theo ID
- `POST /api/students` - Tạo học viên mới
- `PUT /api/students/:id` - Cập nhật thông tin học viên
- `DELETE /api/students/:id` - Xóa học viên

### Course Management
- `GET /api/courses` - Lấy danh sách khóa học (có phân trang và lọc)
- `GET /api/courses/:id` - Lấy thông tin khóa học theo ID
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id` - Cập nhật khóa học
- `DELETE /api/courses/:id` - Xóa khóa học
- `GET /api/course-categories` - Lấy danh mục khóa học

### Consultation Sessions
- `GET /api/consultation-sessions` - Lấy danh sách phiên tư vấn (có phân trang và lọc)
- `GET /api/consultation-sessions/:id` - Lấy thông tin phiên tư vấn theo ID
- `POST /api/consultation-sessions` - Tạo phiên tư vấn mới
- `PUT /api/consultation-sessions/:id` - Cập nhật phiên tư vấn
- `DELETE /api/consultation-sessions/:id` - Xóa phiên tư vấn

### KPI Management
- `GET /api/kpi-definitions` - Lấy danh sách định nghĩa KPI
- `GET /api/kpi-definitions/:id` - Lấy định nghĩa KPI theo ID
- `POST /api/kpi-definitions` - Tạo định nghĩa KPI mới
- `PUT /api/kpi-definitions/:id` - Cập nhật định nghĩa KPI
- `DELETE /api/kpi-definitions/:id` - Xóa định nghĩa KPI
- `GET /api/counselor-kpi-targets` - Lấy mục tiêu KPI tư vấn viên
- `GET /api/counselor-kpi-targets/:id` - Lấy mục tiêu KPI theo ID
- `POST /api/counselor-kpi-targets` - Tạo mục tiêu KPI mới
- `PUT /api/counselor-kpi-targets/:id` - Cập nhật mục tiêu KPI
- `DELETE /api/counselor-kpi-targets/:id` - Xóa mục tiêu KPI

### File Operations
- `POST /api/upload` - Upload file
- `GET /api/export/students/excel` - Xuất danh sách học viên ra Excel
- `GET /api/export/courses/excel` - Xuất danh sách khóa học ra Excel
- `GET /api/export/consultation-sessions/excel` - Xuất danh sách phiên tư vấn ra Excel

## 🔧 Cấu Trúc Dự Án

```
src/
├── config/           # Cấu hình database và app
├── controllers/      # API Controllers
├── middlewares/      # Middleware functions
├── models/          # Mongoose Models
├── services/        # Business Logic
├── utils/           # Utility functions
└── main.ts          # Entry point
```

## 🗄️ Database Schema

### Collections Chính:
- **users** - Người dùng hệ thống
- **students** - Học viên
- **courses** - Khóa học
- **consultation_sessions** - Phiên tư vấn
- **student_enrollments** - Đăng ký khóa học
- **course_categories** - Danh mục khóa học
- **kpi_definitions** - Định nghĩa KPI
- **counselor_kpi_targets** - Mục tiêu KPI tư vấn viên
- **student_interested_courses** - Khóa học quan tâm
- **student_status_history** - Lịch sử trạng thái học viên
- **counselor_specializations** - Chuyên môn tư vấn viên

## 🔐 Bảo Mật

- JWT Authentication
- Password hashing với bcrypt
- Input validation với Joi
- Rate limiting
- CORS protection
- Helmet security headers

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging với Morgan
- Error handling và logging

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build TypeScript
- `npm start` - Chạy production server
- `npm test` - Chạy tests

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
