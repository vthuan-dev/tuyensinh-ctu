import { Request, Response } from 'express';
import Joi from 'joi';
import Schedule from '@/models/Schedule.model';
import Appointment from '@/models/Appointment.model';
import User from '@/models/User.model';
import Student from '@/models/Student.model';
import { validateRequest } from '@/middlewares/validation.middleware';

// Validation schemas
const createScheduleSchema = Joi.object({
  counselor_id: Joi.string().required(),
  date: Joi.date().required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  max_appointments: Joi.number().min(0).max(50).default(10),
  break_duration_minutes: Joi.number().min(0).max(120).default(0),
  notes: Joi.string().max(500).optional()
});

const createAppointmentSchema = Joi.object({
  student_id: Joi.string().required(),
  counselor_id: Joi.string().required(),
  schedule_id: Joi.string().required(),
  appointment_date: Joi.date().required(),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  appointment_type: Joi.string().valid('phone', 'online', 'in_person').required(),
  notes: Joi.string().max(1000).optional()
});

const updateAppointmentSchema = Joi.object({
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show').optional(),
  notes: Joi.string().max(1000).optional()
});

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Tạo lịch làm việc cho counselor
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - counselor_id
 *               - date
 *               - start_time
 *               - end_time
 *             properties:
 *               counselor_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               end_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               max_appointments:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 50
 *               break_duration_minutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 120
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lịch làm việc được tạo thành công
 */
export const createSchedule = [
  validateRequest(createScheduleSchema),
  async (req: Request, res: Response) => {
    try {
      const { counselor_id, date, start_time, end_time, max_appointments, break_duration_minutes, notes } = req.body;

      // Check if counselor exists
      const counselor = await User.findById(counselor_id);
      if (!counselor || counselor.user_type !== 'counselor') {
        return res.status(400).json({
          success: false,
          message: 'Invalid counselor ID'
        });
      }

      // Check for existing schedule on the same date
      const existingSchedule = await Schedule.findOne({
        counselor_id,
        date: new Date(date)
      });

      if (existingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Schedule already exists for this counselor on this date'
        });
      }

      const schedule = new Schedule({
        counselor_id,
        date: new Date(date),
        start_time,
        end_time,
        max_appointments,
        break_duration_minutes,
        notes
      });

      await schedule.save();

      res.status(201).json({
        success: true,
        message: 'Schedule created successfully',
        data: schedule
      });
      return;
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
      return;
    }
  }
];

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Lấy danh sách lịch làm việc
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: counselor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc
 */
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { counselor_id, date, start_date, end_date } = req.query;

    const filter: any = {};
    if (counselor_id) filter.counselor_id = counselor_id;
    if (date) filter.date = new Date(date as string);
    if (start_date && end_date) {
      filter.date = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string)
      };
    }

    const schedules = await Schedule.find(filter)
      .populate('counselor_id', 'full_name email')
      .sort({ date: 1, start_time: 1 });

    res.json({
      success: true,
      data: schedules
    });
    return;
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Đặt lịch hẹn tư vấn
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - counselor_id
 *               - schedule_id
 *               - appointment_date
 *               - start_time
 *               - end_time
 *               - appointment_type
 *             properties:
 *               student_id:
 *                 type: string
 *               counselor_id:
 *                 type: string
 *               schedule_id:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               end_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               appointment_type:
 *                 type: string
 *                 enum: [phone, online, in_person]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lịch hẹn được đặt thành công
 */
export const createAppointment = [
  validateRequest(createAppointmentSchema),
  async (req: Request, res: Response) => {
    try {
      const { student_id, counselor_id, schedule_id, appointment_date, start_time, end_time, appointment_type, notes } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Check if student exists
      const student = await Student.findById(student_id);
      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if counselor exists
      const counselor = await User.findById(counselor_id);
      if (!counselor || counselor.user_type !== 'counselor') {
        return res.status(400).json({
          success: false,
          message: 'Invalid counselor ID'
        });
      }

      // Check if schedule exists and is available
      const schedule = await Schedule.findById(schedule_id);
      if (!schedule) {
        return res.status(400).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      if (!schedule.is_available) {
        return res.status(400).json({
          success: false,
          message: 'Schedule is not available'
        });
      }

      if (schedule.current_appointments >= schedule.max_appointments) {
        return res.status(400).json({
          success: false,
          message: 'Schedule is fully booked'
        });
      }

      // Check for time conflicts
      const conflictingAppointment = await Appointment.findOne({
        counselor_id,
        appointment_date: new Date(appointment_date),
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
          {
            start_time: { $lt: end_time },
            end_time: { $gt: start_time }
          }
        ]
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is already booked'
        });
      }

      const appointment = new Appointment({
        student_id,
        counselor_id,
        schedule_id,
        appointment_date: new Date(appointment_date),
        start_time,
        end_time,
        appointment_type,
        notes,
        created_by: userId
      });

      await appointment.save();

      // Update schedule current appointments count
      await Schedule.findByIdAndUpdate(schedule_id, {
        $inc: { current_appointments: 1 }
      });

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });
      return;
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
      return;
    }
  }
];

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Lấy danh sách lịch hẹn
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: counselor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, confirmed, completed, cancelled, no_show]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { counselor_id, student_id, status, date } = req.query;

    const filter: any = {};
    if (counselor_id) filter.counselor_id = counselor_id;
    if (student_id) filter.student_id = student_id;
    if (status) filter.status = status;
    if (date) filter.appointment_date = new Date(date as string);

    const appointments = await Appointment.find(filter)
      .populate('student_id', 'student_name email phone_number')
      .populate('counselor_id', 'full_name email')
      .populate('created_by', 'full_name')
      .sort({ appointment_date: 1, start_time: 1 });

    res.json({
      success: true,
      data: appointments
    });
    return;
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Cập nhật lịch hẹn
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, completed, cancelled, no_show]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lịch hẹn được cập nhật thành công
 */
export const updateAppointment = [
  validateRequest(updateAppointmentSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status, notes },
        { new: true }
      ).populate('student_id', 'student_name email')
       .populate('counselor_id', 'full_name email');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment
      });
      return;
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
      return;
    }
  }
];
