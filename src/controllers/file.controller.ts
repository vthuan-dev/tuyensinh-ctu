import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import Student from '@/models/Student.model';
import Course from '@/models/Course.model';
import ConsultationSession from '@/models/ConsultationSession.model';
import { config } from '@/config';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.uploadPath;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow only specific file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and Excel files are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: fileFilter
});

// Upload file
export const uploadFile = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        }
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }
  }
];

// Export students to Excel
export const exportStudentsToExcel = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, status, counselor_id } = req.query;

    const query: any = {};

    // Date range filter
    if (start_date || end_date) {
      query.createdAt = {};
      if (start_date) {
        query.createdAt.$gte = new Date(start_date as string);
      }
      if (end_date) {
        query.createdAt.$lte = new Date(end_date as string);
      }
    }

    // Status filter
    if (status) {
      query.current_status = status;
    }

    // Counselor filter
    if (counselor_id) {
      query.assigned_counselor_id = counselor_id;
    }

    const students = await Student.find(query)
      .populate('assigned_counselor_id', 'full_name email')
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = students.map(student => ({
      'Tên học viên': student.student_name,
      'Email': student.email,
      'Số điện thoại': student.phone_number,
      'Giới tính': student.gender,
      'Ngày sinh': student.date_of_birth.toLocaleDateString('vi-VN'),
      'Trình độ học vấn': student.current_education_level,
      'Trường cấp 3': student.high_school_name || '',
      'Thành phố': student.city,
      'Nguồn tiếp cận': student.source,
      'Trạng thái': student.current_status,
      'Tư vấn viên': student.assigned_counselor_id ? 
        (student.assigned_counselor_id as any).full_name : '',
      'Ngày tạo': student.createdAt.toLocaleDateString('vi-VN')
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Tên học viên
      { wch: 30 }, // Email
      { wch: 15 }, // Số điện thoại
      { wch: 10 }, // Giới tính
      { wch: 15 }, // Ngày sinh
      { wch: 20 }, // Trình độ học vấn
      { wch: 30 }, // Trường cấp 3
      { wch: 20 }, // Thành phố
      { wch: 20 }, // Nguồn tiếp cận
      { wch: 15 }, // Trạng thái
      { wch: 25 }, // Tư vấn viên
      { wch: 15 }  // Ngày tạo
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học viên');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const filename = `danh-sach-hoc-vien-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export students to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
};

// Export courses to Excel
export const exportCoursesToExcel = async (req: Request, res: Response) => {
  try {
    const { is_active, program_type, category_id } = req.query;

    const query: any = {};

    // Active filter
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
    }

    // Program type filter
    if (program_type) {
      query.program_type = program_type;
    }

    // Category filter
    if (category_id) {
      query.category_id = category_id;
    }

    const courses = await Course.find(query)
      .populate('category_id', 'name')
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = courses.map(course => ({
      'Tên khóa học': course.name,
      'Mô tả': course.description,
      'Thời gian': course.duration_text,
      'Giá': course.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      'Danh mục': course.category_id ? (course.category_id as any).name : '',
      'Loại chương trình': course.program_type,
      'Trạng thái': course.is_active ? 'Hoạt động' : 'Không hoạt động',
      'Ngày tạo': course.createdAt.toLocaleDateString('vi-VN')
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 30 }, // Tên khóa học
      { wch: 50 }, // Mô tả
      { wch: 20 }, // Thời gian
      { wch: 20 }, // Giá
      { wch: 25 }, // Danh mục
      { wch: 20 }, // Loại chương trình
      { wch: 15 }, // Trạng thái
      { wch: 15 }  // Ngày tạo
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách khóa học');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const filename = `danh-sach-khoa-hoc-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export courses to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
};

// Export consultation sessions to Excel
export const exportConsultationSessionsToExcel = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, counselor_id, session_status } = req.query;

    const query: any = {};

    // Date range filter
    if (start_date || end_date) {
      query.session_date = {};
      if (start_date) {
        query.session_date.$gte = new Date(start_date as string);
      }
      if (end_date) {
        query.session_date.$lte = new Date(end_date as string);
      }
    }

    // Counselor filter
    if (counselor_id) {
      query.counselor_id = counselor_id;
    }

    // Status filter
    if (session_status) {
      query.session_status = session_status;
    }

    const sessions = await ConsultationSession.find(query)
      .populate('counselor_id', 'full_name email')
      .populate('student_id', 'student_name email phone_number')
      .sort({ session_date: -1 });

    // Prepare data for Excel
    const excelData = sessions.map(session => ({
      'Tư vấn viên': session.counselor_id ? (session.counselor_id as any).full_name : '',
      'Học viên': session.student_id ? (session.student_id as any).student_name : '',
      'Email học viên': session.student_id ? (session.student_id as any).email : '',
      'Số điện thoại': session.student_id ? (session.student_id as any).phone_number : '',
      'Ngày phiên tư vấn': session.session_date.toLocaleDateString('vi-VN'),
      'Thời gian (phút)': session.duration_minutes,
      'Loại phiên': session.session_type,
      'Trạng thái': session.session_status,
      'Ghi chú': session.notes || '',
      'Ngày tạo': session.createdAt.toLocaleDateString('vi-VN')
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Tư vấn viên
      { wch: 25 }, // Học viên
      { wch: 30 }, // Email học viên
      { wch: 15 }, // Số điện thoại
      { wch: 20 }, // Ngày phiên tư vấn
      { wch: 15 }, // Thời gian (phút)
      { wch: 20 }, // Loại phiên
      { wch: 15 }, // Trạng thái
      { wch: 50 }, // Ghi chú
      { wch: 15 }  // Ngày tạo
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách phiên tư vấn');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const filename = `danh-sach-phien-tu-van-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export consultation sessions to Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
};
