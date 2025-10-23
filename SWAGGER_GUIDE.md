# 📖 Hướng Dẫn Sử Dụng Swagger UI

## 🚀 Truy Cập Swagger UI

Sau khi chạy server, truy cập: **http://localhost:3000/api-docs**

## 🔧 Cài Đặt Dependencies

```bash
npm install
# hoặc
pnpm install
```

## 📋 Các Tính Năng Swagger UI

### 1. **Xem API Documentation**
- Tất cả endpoints được nhóm theo tags
- Mô tả chi tiết cho từng API
- Request/Response schemas
- Example data

### 2. **Test API Trực Tiếp**
- Click "Try it out" trên bất kỳ endpoint nào
- Điền thông tin request
- Click "Execute" để gửi request
- Xem response ngay lập tức

### 3. **Authentication**
- Click nút "Authorize" ở góc trên bên phải
- Nhập JWT token: `Bearer your_jwt_token_here`
- Token sẽ được sử dụng cho tất cả protected endpoints

## 🎯 Các API Endpoints Chính

### Authentication
- **POST /api/auth/register** - Đăng ký tài khoản
- **POST /api/auth/login** - Đăng nhập
- **POST /api/auth/refresh-token** - Làm mới token

### Student Management
- **GET /api/students** - Lấy danh sách học viên (có pagination & filtering)
- **GET /api/students/:id** - Lấy thông tin học viên theo ID
- **POST /api/students** - Tạo học viên mới
- **PUT /api/students/:id** - Cập nhật học viên
- **DELETE /api/students/:id** - Xóa học viên

### Course Management
- **GET /api/courses** - Lấy danh sách khóa học
- **GET /api/course-categories** - Lấy danh mục khóa học
- **POST /api/courses** - Tạo khóa học mới

### Consultation Sessions
- **GET /api/consultation-sessions** - Lấy danh sách phiên tư vấn
- **POST /api/consultation-sessions** - Tạo phiên tư vấn mới

### KPI Management
- **GET /api/kpi-definitions** - Lấy định nghĩa KPI
- **GET /api/counselor-kpi-targets** - Lấy mục tiêu KPI

### File Operations
- **POST /api/upload** - Upload file
- **GET /api/export/students/excel** - Xuất danh sách học viên ra Excel

## 🔐 Hướng Dẫn Test Authentication

### Bước 1: Đăng ký tài khoản
```json
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "password123",
  "full_name": "Admin User",
  "user_type": "admin"
}
```

### Bước 2: Đăng nhập
```json
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Bước 3: Copy access_token từ response
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Bước 4: Authorize trong Swagger UI
- Click "Authorize" button
- Nhập: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click "Authorize"

## 📊 Test Data Examples

### Tạo học viên mới
```json
POST /api/students
{
  "student_name": "Nguyễn Văn A",
  "email": "student@example.com",
  "phone_number": "0123456789",
  "gender": "male",
  "date_of_birth": "2000-01-01",
  "current_education_level": "THPT",
  "city": "Hà Nội",
  "source": "Website",
  "notification_consent": "Agree"
}
```

### Tạo khóa học mới
```json
POST /api/courses
{
  "category_id": "category_id_here",
  "name": "Lập trình Web",
  "description": "Khóa học lập trình web từ cơ bản đến nâng cao",
  "duration_text": "6 tháng",
  "price": 5000000,
  "program_type": "Aptech"
}
```

## 🛠️ Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra token có đúng format `Bearer token` không
- Kiểm tra token có hết hạn không
- Thử đăng nhập lại để lấy token mới

### Lỗi 400 Bad Request
- Kiểm tra request body có đúng schema không
- Kiểm tra required fields
- Kiểm tra data types

### Lỗi 500 Internal Server Error
- Kiểm tra MongoDB có chạy không
- Kiểm tra connection string trong .env
- Xem logs trong console

## 📝 Tips

1. **Sử dụng Examples**: Mỗi endpoint có example data, copy và modify theo nhu cầu
2. **Test từng bước**: Bắt đầu với authentication, sau đó test các endpoints khác
3. **Check Response**: Luôn kiểm tra response để hiểu cấu trúc data
4. **Use Filters**: Sử dụng query parameters để filter data
5. **Pagination**: Test pagination với page và limit parameters
