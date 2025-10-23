import { Request, Response } from 'express';
import Joi from 'joi';
import ConsultationSession from '@/models/ConsultationSession.model';
import { validateRequest, validateQuery, validateParams } from '@/middlewares/validation.middleware';

// Validation schemas
const createConsultationSessionSchema = Joi.object({
  counselor_id: Joi.string().required(),
  student_id: Joi.string().required(),
  session_date: Joi.date().required(),
  duration_minutes: Joi.number().min(0).max(1440).required(),
  notes: Joi.string().max(2000).optional(),
  session_type: Joi.string().valid('Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat').required(),
  session_status: Joi.string().valid('Scheduled', 'Completed', 'Canceled', 'No Show').default('Scheduled')
});

const updateConsultationSessionSchema = Joi.object({
  counselor_id: Joi.string().optional(),
  student_id: Joi.string().optional(),
  session_date: Joi.date().optional(),
  duration_minutes: Joi.number().min(0).max(1440).optional(),
  notes: Joi.string().max(2000).optional(),
  session_type: Joi.string().valid('Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat').optional(),
  session_status: Joi.string().valid('Scheduled', 'Completed', 'Canceled', 'No Show').optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  counselor_id: Joi.string().optional(),
  student_id: Joi.string().optional(),
  session_status: Joi.string().valid('Scheduled', 'Completed', 'Canceled', 'No Show').optional(),
  session_type: Joi.string().valid('Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat').optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  sort: Joi.string().valid('session_date', 'createdAt', 'duration_minutes').default('session_date'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().required()
});

// Get all consultation sessions with pagination and filtering
export const getConsultationSessions = [
  validateQuery(querySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        counselor_id,
        student_id,
        session_status,
        session_type,
        start_date,
        end_date,
        sort = 'session_date',
        order = 'desc'
      } = req.query;

      const query: any = {};

      // Counselor filter
      if (counselor_id) {
        query.counselor_id = counselor_id;
      }

      // Student filter
      if (student_id) {
        query.student_id = student_id;
      }

      // Status filter
      if (session_status) {
        query.session_status = session_status;
      }

      // Type filter
      if (session_type) {
        query.session_type = session_type;
      }

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

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const sessions = await ConsultationSession.find(query)
        .populate('counselor_id', 'full_name email user_type')
        .populate('student_id', 'student_name email phone_number current_status')
        .sort(sortObj)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await ConsultationSession.countDocuments(query);

      res.json({
        success: true,
        data: {
          sessions,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(total / Number(limit)),
            total_items: total,
            items_per_page: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get consultation sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Get consultation session by ID
export const getConsultationSessionById = [
  validateParams(paramsSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const session = await ConsultationSession.findById(id)
        .populate('counselor_id', 'full_name email user_type')
        .populate('student_id', 'student_name email phone_number current_status');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Consultation session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get consultation session by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Create new consultation session
export const createConsultationSession = [
  validateRequest(createConsultationSessionSchema),
  async (req: Request, res: Response) => {
    try {
      const sessionData = req.body;

      const session = new ConsultationSession(sessionData);
      await session.save();

      await session.populate('counselor_id', 'full_name email user_type');
      await session.populate('student_id', 'student_name email phone_number current_status');

      res.status(201).json({
        success: true,
        message: 'Consultation session created successfully',
        data: session
      });
    } catch (error) {
      console.error('Create consultation session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Update consultation session
export const updateConsultationSession = [
  validateParams(paramsSchema),
  validateRequest(updateConsultationSessionSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const session = await ConsultationSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Consultation session not found'
        });
      }

      const updatedSession = await ConsultationSession.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('counselor_id', 'full_name email user_type')
        .populate('student_id', 'student_name email phone_number current_status');

      res.json({
        success: true,
        message: 'Consultation session updated successfully',
        data: updatedSession
      });
    } catch (error) {
      console.error('Update consultation session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Delete consultation session
export const deleteConsultationSession = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const session = await ConsultationSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Consultation session not found'
        });
      }

      await ConsultationSession.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Consultation session deleted successfully'
      });
    } catch (error) {
      console.error('Delete consultation session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];
