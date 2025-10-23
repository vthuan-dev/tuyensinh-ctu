import { Request, Response } from 'express';
import Joi from 'joi';
import Course from '@/models/Course.model';
import CourseCategory from '@/models/CourseCategory.model';
import { validateRequest, validateQuery, validateParams } from '@/middlewares/validation.middleware';

// Validation schemas
const createCourseSchema = Joi.object({
  category_id: Joi.string().required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).required(),
  duration_text: Joi.string().max(100).required(),
  price: Joi.number().min(0).required(),
  is_active: Joi.boolean().default(true),
  program_type: Joi.string().max(50).required()
});

const updateCourseSchema = Joi.object({
  category_id: Joi.string().optional(),
  name: Joi.string().max(200).optional(),
  description: Joi.string().max(1000).optional(),
  duration_text: Joi.string().max(100).optional(),
  price: Joi.number().min(0).optional(),
  is_active: Joi.boolean().optional(),
  program_type: Joi.string().max(50).optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  category_id: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
  program_type: Joi.string().optional(),
  sort: Joi.string().valid('createdAt', 'name', 'price').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().required()
});

// Get all courses with pagination and filtering
export const getCourses = [
  validateQuery(querySchema),
  async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category_id,
        is_active,
        program_type,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;

      const query: any = {};

      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Category filter
      if (category_id) {
        query.category_id = category_id;
      }

      // Active filter
      if (is_active !== undefined) {
        query.is_active = is_active === 'true';
      }

      // Program type filter
      if (program_type) {
        query.program_type = program_type;
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const courses = await Course.find(query)
        .populate('category_id', 'name description')
        .sort(sortObj)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Course.countDocuments(query);

      return res.json({
        success: true,
        data: {
          courses,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(total / Number(limit)),
            total_items: total,
            items_per_page: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get courses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Get course by ID
export const getCourseById = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const course = await Course.findById(id)
        .populate('category_id', 'name description');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      return res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Get course by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Create new course
export const createCourse = [
  validateRequest(createCourseSchema),
  async (req: Request, res: Response) => {
    try {
      const courseData = req.body;

      // Check if category exists
      const category = await CourseCategory.findById(courseData.category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Course category not found'
        });
      }

      const course = new Course(courseData);
      await course.save();

      await course.populate('category_id', 'name description');

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Create course error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Update course
export const updateCourse = [
  validateParams(paramsSchema),
  validateRequest(updateCourseSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if category exists (if updating category_id)
      if (updateData.category_id) {
        const category = await CourseCategory.findById(updateData.category_id);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Course category not found'
          });
        }
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('category_id', 'name description');

      return res.json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    } catch (error) {
      console.error('Update course error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Delete course
export const deleteCourse = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      await Course.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Delete course error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Get course categories
export const getCourseCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CourseCategory.find().sort({ name: 1 });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get course categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
