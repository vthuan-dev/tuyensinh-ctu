import { Request, Response } from 'express';
import Joi from 'joi';
import Course from '@/models/Course.model';
import Student from '@/models/Student.model';
import Appointment from '@/models/Appointment.model';
import { validateRequest } from '@/middlewares/validation.middleware';

// Validation schemas
const onlineConsultationSchema = Joi.object({
  student_name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  date_of_birth: Joi.date().required(),
  current_education_level: Joi.string().valid('THPT', 'SinhVien', 'Other').required(),
  high_school_name: Joi.string().max(200).optional(),
  city: Joi.string().max(100).required(),
  source: Joi.string().valid('Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event').required(),
  notification_consent: Joi.string().valid('Agree', 'Disagree', 'Other').required(),
  interested_courses: Joi.array().items(Joi.string()).optional(),
  preferred_appointment_date: Joi.date().optional(),
  preferred_appointment_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  appointment_type: Joi.string().valid('phone', 'online', 'in_person').optional(),
  notes: Joi.string().max(1000).optional()
});

/**
 * @swagger
 * /api/public/courses:
 *   get:
 *     summary: Lấy danh sách khóa học công khai
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách khóa học
 */
export const getPublicCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    const filter: any = { is_active: true };
    
    if (category) {
      filter.category_id = category;
    }
    
    if (search) {
      filter.$or = [
        { course_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('category_id', 'category_name')
      .sort({ created_at: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: Math.ceil(total / parseInt(limit as string)),
          total_items: total,
          items_per_page: parseInt(limit as string)
        }
      }
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @swagger
 * /api/public/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết khóa học
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết khóa học
 */
export const getPublicCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('category_id', 'category_name')
      .populate('prerequisite_courses', 'course_name');

    if (!course || !course.is_active) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get public course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @swagger
 * /api/public/consultation/register:
 *   post:
 *     summary: Đăng ký tư vấn trực tuyến
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_name
 *               - email
 *               - phone_number
 *               - gender
 *               - date_of_birth
 *               - current_education_level
 *               - city
 *               - source
 *               - notification_consent
 *             properties:
 *               student_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               current_education_level:
 *                 type: string
 *                 enum: [THPT, SinhVien, Other]
 *               high_school_name:
 *                 type: string
 *               city:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [Mail, Fanpage, Zalo, Website, Friend, SMS, Banderole, Poster, Brochure, Google, Brand, Event]
 *               notification_consent:
 *                 type: string
 *                 enum: [Agree, Disagree, Other]
 *               interested_courses:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferred_appointment_date:
 *                 type: string
 *                 format: date
 *               preferred_appointment_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               appointment_type:
 *                 type: string
 *                 enum: [phone, online, in_person]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký tư vấn thành công
 */
export const registerOnlineConsultation = [
  validateRequest(onlineConsultationSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        student_name,
        email,
        phone_number,
        gender,
        date_of_birth,
        current_education_level,
        high_school_name,
        city,
        source,
        notification_consent,
        interested_courses,
        preferred_appointment_date,
        preferred_appointment_time,
        appointment_type,
        notes
      } = req.body;

      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [
          { email: email },
          { phone_number: phone_number }
        ]
      });

      if (existingStudent) {
        res.status(400).json({
          success: false,
          message: 'Student already exists with this email or phone number'
        });
        return;
      }

      // Create new student
      const student = new Student({
        student_name,
        email,
        phone_number,
        gender,
        date_of_birth: new Date(date_of_birth),
        current_education_level,
        high_school_name,
        city,
        source,
        notification_consent,
        current_status: 'Lead'
      });

      await student.save();

      // Create interested courses if provided
      if (interested_courses && interested_courses.length > 0) {
        // TODO: Create StudentInterestedCourse records
        // This would involve creating records linking the student to interested courses
      }

      // TODO: Create appointment if preferred date/time is provided
      // This would involve:
      // 1. Finding available counselors
      // 2. Creating appointment record
      // 3. Sending confirmation notifications

      // TODO: Send confirmation email/SMS
      // This would involve:
      // 1. Generating confirmation message
      // 2. Sending via email service
      // 3. Sending via SMS service if phone number provided

      res.status(201).json({
        success: true,
        message: 'Consultation registration successful',
        data: {
          student_id: student._id,
          status: 'registered',
          next_steps: 'Our counselor will contact you within 24 hours'
        }
      });
    } catch (error) {
      console.error('Register online consultation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

/**
 * @swagger
 * /api/public/consultation/check-status:
 *   get:
 *     summary: Kiểm tra trạng thái đăng ký tư vấn
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái đăng ký
 */
export const checkConsultationStatus = async (req: Request, res: Response) => {
  try {
    const { email, phone_number } = req.query;

    if (!email && !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required'
      });
    }

    const filter: any = {};
    if (email) filter.email = email;
    if (phone_number) filter.phone_number = phone_number;

    const student = await Student.findOne(filter)
      .populate('assigned_counselor_id', 'full_name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get recent appointments
    const appointments = await Appointment.find({ student_id: student._id })
      .populate('counselor_id', 'full_name email')
      .sort({ appointment_date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.student_name,
          email: student.email,
          phone: student.phone_number,
          status: student.current_status,
          assigned_counselor: student.assigned_counselor_id
        },
        appointments
      }
    });
  } catch (error) {
    console.error('Check consultation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
