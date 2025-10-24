import { Request, Response } from 'express';
import Joi from 'joi';
import Student from '@/models/Student.model';
import ConsultationSession from '@/models/ConsultationSession.model';
import User from '@/models/User.model';
import Report from '@/models/Report.model';
import { validateRequest, validateQuery } from '@/middlewares/validation.middleware';

// Validation schemas
const statisticsQuerySchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  counselor_id: Joi.string().optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly').default('monthly')
});

const reportGenerationSchema = Joi.object({
  report_type: Joi.string().valid('statistics', 'conversion', 'source', 'campaign', 'counselor_performance', 'student_progress').required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  file_format: Joi.string().valid('excel', 'pdf', 'csv').default('excel')
});

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     summary: Lấy thống kê tổng quan hệ thống
 *     tags: [Admin]
 *     parameters:
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
 *       - in: query
 *         name: counselor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *     responses:
 *       200:
 *         description: Thống kê thành công
 */
export const getStatistics = [
  validateQuery(statisticsQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const { start_date, end_date, counselor_id, period } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (start_date) dateFilter.$gte = new Date(start_date as string);
      if (end_date) dateFilter.$lte = new Date(end_date as string);

      // Build counselor filter
      const counselorFilter = counselor_id ? { counselor_id } : {};

      // Get basic statistics
      const [
        totalStudents,
        totalConsultations,
        totalCounselors,
        newStudentsThisPeriod,
        completedConsultations,
        conversionRate
      ] = await Promise.all([
        Student.countDocuments(),
        ConsultationSession.countDocuments(),
        User.countDocuments({ user_type: 'counselor' }),
        Student.countDocuments(dateFilter.start_date ? { createdAt: dateFilter } : {}),
        ConsultationSession.countDocuments({ 
          ...counselorFilter,
          session_status: 'Completed',
          ...(dateFilter.start_date ? { session_date: dateFilter } : {})
        }),
        // Calculate conversion rate
        (async () => {
          const registeredCount = await Student.countDocuments({ current_status: 'Registered' });
          const totalCount = await Student.countDocuments();
          return registeredCount / Math.max(totalCount, 1) * 100;
        })()
      ]);

      // Get source statistics
      const sourceStats = await Student.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get counselor performance
      const counselorPerformance = await ConsultationSession.aggregate([
        { $match: counselorFilter },
        { $group: { 
          _id: '$counselor_id', 
          totalSessions: { $sum: 1 },
          completedSessions: { 
            $sum: { $cond: [{ $eq: ['$session_status', 'Completed'] }, 1, 0] }
          }
        }},
        { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'counselor'
        }},
        { $unwind: '$counselor' },
        { $project: {
          counselor_name: '$counselor.full_name',
          total_sessions: '$totalSessions',
          completed_sessions: '$completedSessions',
          completion_rate: { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] }
        }}
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            total_students: totalStudents,
            total_consultations: totalConsultations,
            total_counselors: totalCounselors,
            new_students_this_period: newStudentsThisPeriod,
            completed_consultations: completedConsultations,
            conversion_rate: Math.round(conversionRate * 100) / 100
          },
          source_statistics: sourceStats,
          counselor_performance: counselorPerformance
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

/**
 * @swagger
 * /api/admin/reports/generate:
 *   post:
 *     summary: Tạo báo cáo định kỳ
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_type
 *               - start_date
 *               - end_date
 *             properties:
 *               report_type:
 *                 type: string
 *                 enum: [statistics, conversion, source, campaign, counselor_performance, student_progress]
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               file_format:
 *                 type: string
 *                 enum: [excel, pdf, csv]
 *     responses:
 *       200:
 *         description: Báo cáo được tạo thành công
 */
export const generateReport = [
  validateRequest(reportGenerationSchema),
  async (req: Request, res: Response) => {
    try {
      const { report_type, start_date, end_date, file_format } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Create report record
      const report = new Report({
        report_name: `${report_type}_${start_date}_to_${end_date}`,
        report_type,
        report_period: 'custom',
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        generated_by: userId,
        report_data: {},
        file_format,
        status: 'generating'
      });

      await report.save();

      // TODO: Implement actual report generation logic
      // This would involve:
      // 1. Querying data based on report_type
      // 2. Processing and formatting data
      // 3. Generating file (Excel/PDF/CSV)
      // 4. Updating report status

      res.json({
        success: true,
        message: 'Report generation started',
        data: {
          report_id: report._id,
          status: 'generating'
        }
      });
      return;
    } catch (error) {
      console.error('Generate report error:', error);
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
 * /api/admin/reports:
 *   get:
 *     summary: Lấy danh sách báo cáo
 *     tags: [Admin]
 *     parameters:
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
 *       - in: query
 *         name: report_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách báo cáo
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const reportType = req.query.report_type as string;

    const filter: any = {};
    if (reportType) filter.report_type = reportType;

    const reports = await Report.find(filter)
      .populate('generated_by', 'full_name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: Tải xuống báo cáo
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File báo cáo
 */
export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Report is not ready for download'
      });
    }

    // TODO: Implement file download logic
    // This would involve:
    // 1. Reading the file from storage
    // 2. Setting appropriate headers
    // 3. Streaming the file to client
    // 4. Updating download count

    res.json({
      success: true,
      message: 'Download functionality will be implemented'
    });
    return;
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};
