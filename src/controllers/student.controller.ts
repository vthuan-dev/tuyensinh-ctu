import { Request, Response } from 'express';
import Joi from 'joi';
import Student from '@/models/Student.model';
import StudentStatusHistory from '@/models/StudentStatusHistory.model';
import { validateRequest, validateQuery, validateParams } from '@/middlewares/validation.middleware';
import { AuthRequest } from '@/middlewares/auth.middleware';

// Validation schemas
const createStudentSchema = Joi.object({
  student_name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  zalo_phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  link_facebook: Joi.string().uri().optional(),
  date_of_birth: Joi.date().max('now').required(),
  current_education_level: Joi.string().valid('THPT', 'SinhVien', 'Other').required(),
  high_school_name: Joi.string().max(200).optional(),
  city: Joi.string().max(100).required(),
  source: Joi.string().valid('Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event').required(),
  notification_consent: Joi.string().valid('Agree', 'Disagree', 'Other').required(),
  assigned_counselor_id: Joi.string().optional()
});

const updateStudentSchema = Joi.object({
  student_name: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  phone_number: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  zalo_phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  link_facebook: Joi.string().uri().optional(),
  date_of_birth: Joi.date().max('now').optional(),
  current_education_level: Joi.string().valid('THPT', 'SinhVien', 'Other').optional(),
  high_school_name: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  source: Joi.string().valid('Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event').optional(),
  notification_consent: Joi.string().valid('Agree', 'Disagree', 'Other').optional(),
  current_status: Joi.string().valid('Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived').optional(),
  assigned_counselor_id: Joi.string().optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived').optional(),
  source: Joi.string().optional(),
  counselor_id: Joi.string().optional(),
  sort: Joi.string().valid('createdAt', 'student_name', 'email', 'current_status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().required()
});

// Get all students with pagination and filtering
export const getStudents = [
  validateQuery(querySchema),
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        source,
        counselor_id,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;

      const query: any = {};

      // Search filter
      if (search) {
        query.$or = [
          { student_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone_number: { $regex: search, $options: 'i' } }
        ];
      }

      // Status filter
      if (status) {
        query.current_status = status;
      }

      // Source filter
      if (source) {
        query.source = source;
      }

      // Counselor filter
      if (counselor_id) {
        query.assigned_counselor_id = counselor_id;
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const students = await Student.find(query)
        .populate('assigned_counselor_id', 'full_name email user_type')
        .sort(sortObj)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Student.countDocuments(query);

      res.json({
        success: true,
        data: {
          students,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(total / Number(limit)),
            total_items: total,
            items_per_page: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Get student by ID
export const getStudentById = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id)
        .populate('assigned_counselor_id', 'full_name email user_type');

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      console.error('Get student by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Create new student
export const createStudent = [
  validateRequest(createStudentSchema),
  async (req: Request, res: Response) => {
    try {
      const studentData = req.body;

      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [
          { email: studentData.email },
          { phone_number: studentData.phone_number }
        ]
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student already exists with this email or phone number'
        });
      }

      const student = new Student(studentData);
      await student.save();

      await student.populate('assigned_counselor_id', 'full_name email user_type');

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Update student
export const updateStudent = [
  validateParams(paramsSchema),
  validateRequest(updateStudentSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Track status change
      if (updateData.current_status && updateData.current_status !== student.current_status) {
        const statusHistory = new StudentStatusHistory({
          student_id: student._id,
          old_status: student.current_status,
          new_status: updateData.current_status,
          changed_by_user_id: req.user?._id
        });
        await statusHistory.save();
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assigned_counselor_id', 'full_name email user_type');

      res.json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
      });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Delete student
export const deleteStudent = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      await Student.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];
