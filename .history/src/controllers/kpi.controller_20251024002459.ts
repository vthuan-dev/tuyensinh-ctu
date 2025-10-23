import { Request, Response } from 'express';
import Joi from 'joi';
import KpiDefinition from '@/models/KpiDefinition.model';
import CounselorKpiTarget from '@/models/CounselorKpiTarget.model';
import { validateRequest, validateQuery, validateParams } from '@/middlewares/validation.middleware';

// Validation schemas
const createKpiDefinitionSchema = Joi.object({
  name: Joi.string().max(100).required(),
  unit: Joi.string().max(50).required()
});

const updateKpiDefinitionSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  unit: Joi.string().max(50).optional()
});

const createCounselorKpiTargetSchema = Joi.object({
  counselor_id: Joi.string().required(),
  kpi_id: Joi.string().required(),
  target_value: Joi.number().min(0).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().greater(Joi.ref('start_date')).required()
});

const updateCounselorKpiTargetSchema = Joi.object({
  counselor_id: Joi.string().optional(),
  kpi_id: Joi.string().optional(),
  target_value: Joi.number().min(0).optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional()
});

const querySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  counselor_id: Joi.string().optional(),
  kpi_id: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  sort: Joi.string().valid('createdAt', 'start_date', 'end_date', 'target_value').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const paramsSchema = Joi.object({
  id: Joi.string().required()
});

// KPI Definitions

// Get all KPI definitions
export const getKpiDefinitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const kpiDefinitions = await KpiDefinition.find().sort({ name: 1 });

    res.json({
      success: true,
      data: kpiDefinitions
    });
  } catch (error) {
    console.error('Get KPI definitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get KPI definition by ID
export const getKpiDefinitionById = [
  validateParams(paramsSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const kpiDefinition = await KpiDefinition.findById(id);

      if (!kpiDefinition) {
        res.status(404).json({
          success: false,
          message: 'KPI definition not found'
        });
        return;
      }

      res.json({
        success: true,
        data: kpiDefinition
      });
    } catch (error) {
      console.error('Get KPI definition by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Create new KPI definition
export const createKpiDefinition = [
  validateRequest(createKpiDefinitionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const kpiData = req.body;

      const kpiDefinition = new KpiDefinition(kpiData);
      await kpiDefinition.save();

      res.status(201).json({
        success: true,
        message: 'KPI definition created successfully',
        data: kpiDefinition
      });
    } catch (error) {
      console.error('Create KPI definition error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Update KPI definition
export const updateKpiDefinition = [
  validateParams(paramsSchema),
  validateRequest(updateKpiDefinitionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const kpiDefinition = await KpiDefinition.findById(id);
      if (!kpiDefinition) {
        res.status(404).json({
          success: false,
          message: 'KPI definition not found'
        });
        return;
      }

      const updatedKpiDefinition = await KpiDefinition.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'KPI definition updated successfully',
        data: updatedKpiDefinition
      });
    } catch (error) {
      console.error('Update KPI definition error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Delete KPI definition
export const deleteKpiDefinition = [
  validateParams(paramsSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const kpiDefinition = await KpiDefinition.findById(id);
      if (!kpiDefinition) {
        res.status(404).json({
          success: false,
          message: 'KPI definition not found'
        });
        return;
      }

      await KpiDefinition.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'KPI definition deleted successfully'
      });
    } catch (error) {
      console.error('Delete KPI definition error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Counselor KPI Targets

// Get all counselor KPI targets with pagination and filtering
export const getCounselorKpiTargets = [
  validateQuery(querySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        counselor_id,
        kpi_id,
        start_date,
        end_date,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;

      const query: any = {};

      // Counselor filter
      if (counselor_id) {
        query.counselor_id = counselor_id;
      }

      // KPI filter
      if (kpi_id) {
        query.kpi_id = kpi_id;
      }

      // Date range filter
      if (start_date || end_date) {
        if (start_date) {
          query.start_date = { $gte: new Date(start_date as string) };
        }
        if (end_date) {
          query.end_date = { $lte: new Date(end_date as string) };
        }
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj: any = {};
      sortObj[sort as string] = sortOrder;

      const targets = await CounselorKpiTarget.find(query)
        .populate('counselor_id', 'full_name email user_type')
        .populate('kpi_id', 'name unit')
        .sort(sortObj)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await CounselorKpiTarget.countDocuments(query);

      res.json({
        success: true,
        data: {
          targets,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(total / Number(limit)),
            total_items: total,
            items_per_page: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get counselor KPI targets error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Get counselor KPI target by ID
export const getCounselorKpiTargetById = [
  validateParams(paramsSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const target = await CounselorKpiTarget.findById(id)
        .populate('counselor_id', 'full_name email user_type')
        .populate('kpi_id', 'name unit');

      if (!target) {
        res.status(404).json({
          success: false,
          message: 'Counselor KPI target not found'
        });
        return;
      }

      res.json({
        success: true,
        data: target
      });
    } catch (error) {
      console.error('Get counselor KPI target by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Create new counselor KPI target
export const createCounselorKpiTarget = [
  validateRequest(createCounselorKpiTargetSchema),
  async (req: Request, res: Response) => {
    try {
      const targetData = req.body;

      // Check if counselor exists
      const counselor = await import('@/models/User.model').then(m => m.default.findById(targetData.counselor_id));
      if (!counselor) {
        return res.status(400).json({
          success: false,
          message: 'Counselor not found'
        });
      }

      // Check if KPI definition exists
      const kpiDefinition = await KpiDefinition.findById(targetData.kpi_id);
      if (!kpiDefinition) {
        return res.status(400).json({
          success: false,
          message: 'KPI definition not found'
        });
      }

      const target = new CounselorKpiTarget(targetData);
      await target.save();

      await target.populate('counselor_id', 'full_name email user_type');
      await target.populate('kpi_id', 'name unit');

      res.status(201).json({
        success: true,
        message: 'Counselor KPI target created successfully',
        data: target
      });
    } catch (error) {
      console.error('Create counselor KPI target error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Update counselor KPI target
export const updateCounselorKpiTarget = [
  validateParams(paramsSchema),
  validateRequest(updateCounselorKpiTargetSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const target = await CounselorKpiTarget.findById(id);
      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Counselor KPI target not found'
        });
      }

      // Check if counselor exists (if updating counselor_id)
      if (updateData.counselor_id) {
        const counselor = await import('@/models/User.model').then(m => m.default.findById(updateData.counselor_id));
        if (!counselor) {
          return res.status(400).json({
            success: false,
            message: 'Counselor not found'
          });
        }
      }

      // Check if KPI definition exists (if updating kpi_id)
      if (updateData.kpi_id) {
        const kpiDefinition = await KpiDefinition.findById(updateData.kpi_id);
        if (!kpiDefinition) {
          return res.status(400).json({
            success: false,
            message: 'KPI definition not found'
          });
        }
      }

      const updatedTarget = await CounselorKpiTarget.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('counselor_id', 'full_name email user_type')
        .populate('kpi_id', 'name unit');

      res.json({
        success: true,
        message: 'Counselor KPI target updated successfully',
        data: updatedTarget
      });
    } catch (error) {
      console.error('Update counselor KPI target error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Delete counselor KPI target
export const deleteCounselorKpiTarget = [
  validateParams(paramsSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const target = await CounselorKpiTarget.findById(id);
      if (!target) {
        return res.status(404).json({
          success: false,
          message: 'Counselor KPI target not found'
        });
      }

      await CounselorKpiTarget.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Counselor KPI target deleted successfully'
      });
    } catch (error) {
      console.error('Delete counselor KPI target error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];
