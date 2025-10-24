import { Request, Response } from 'express';
import Joi from 'joi';
import Notification from '@/models/Notification.model';
import Student from '@/models/Student.model';
import User from '@/models/User.model';
import { validateRequest } from '@/middlewares/validation.middleware';

// Validation schemas
const sendNotificationSchema = Joi.object({
  recipient_ids: Joi.array().items(Joi.string()).min(1).required(),
  recipient_type: Joi.string().valid('student', 'counselor', 'admin').required(),
  notification_type: Joi.string().valid('email', 'sms', 'system').required(),
  title: Joi.string().max(200).required(),
  content: Joi.string().max(2000).required(),
  scheduled_at: Joi.date().optional(),
  metadata: Joi.object().optional()
});

const bulkNotificationSchema = Joi.object({
  recipient_type: Joi.string().valid('student', 'counselor', 'admin').required(),
  notification_type: Joi.string().valid('email', 'sms', 'system').required(),
  title: Joi.string().max(200).required(),
  content: Joi.string().max(2000).required(),
  filters: Joi.object({
    status: Joi.string().optional(),
    source: Joi.string().optional(),
    counselor_id: Joi.string().optional(),
    created_after: Joi.date().optional(),
    created_before: Joi.date().optional()
  }).optional(),
  scheduled_at: Joi.date().optional()
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Gửi thông báo
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_ids
 *               - recipient_type
 *               - notification_type
 *               - title
 *               - content
 *             properties:
 *               recipient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               recipient_type:
 *                 type: string
 *                 enum: [student, counselor, admin]
 *               notification_type:
 *                 type: string
 *                 enum: [email, sms, system]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Thông báo được gửi thành công
 */
export const sendNotification = [
  validateRequest(sendNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const { recipient_ids, recipient_type, notification_type, title, content, scheduled_at, metadata } = req.body;

      const notifications = recipient_ids.map((recipient_id: string) => ({
        recipient_id,
        recipient_type,
        notification_type,
        title,
        content,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
        metadata
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      // TODO: Implement actual notification sending logic
      // This would involve:
      // 1. Email service integration
      // 2. SMS service integration
      // 3. System notification handling
      // 4. Queue processing for scheduled notifications

      res.json({
        success: true,
        message: 'Notifications sent successfully',
        data: {
          notification_ids: createdNotifications.map(n => n._id),
          count: createdNotifications.length
        }
      });
      return;
    } catch (error) {
      console.error('Send notification error:', error);
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
 * /api/notifications/bulk:
 *   post:
 *     summary: Gửi thông báo hàng loạt với bộ lọc
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_type
 *               - notification_type
 *               - title
 *               - content
 *             properties:
 *               recipient_type:
 *                 type: string
 *                 enum: [student, counselor, admin]
 *               notification_type:
 *                 type: string
 *                 enum: [email, sms, system]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               filters:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   source:
 *                     type: string
 *                   counselor_id:
 *                     type: string
 *                   created_after:
 *                     type: string
 *                     format: date
 *                   created_before:
 *                     type: string
 *                     format: date
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Thông báo hàng loạt được gửi thành công
 */
export const sendBulkNotification = [
  validateRequest(bulkNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const { recipient_type, notification_type, title, content, filters, scheduled_at } = req.body;

      // Build filter query based on recipient type
      let recipientQuery: any = {};
      
      if (recipient_type === 'student') {
        recipientQuery = { ...filters };
      } else if (recipient_type === 'counselor') {
        recipientQuery = { user_type: 'counselor', ...filters };
      } else if (recipient_type === 'admin') {
        recipientQuery = { user_type: 'admin', ...filters };
      }

      // Get recipients based on type and filters
      let recipients: any[] = [];
      if (recipient_type === 'student') {
        recipients = await Student.find(recipientQuery).select('_id');
      } else {
        recipients = await User.find(recipientQuery).select('_id');
      }

      if (recipients.length === 0) {
        return res.json({
          success: true,
          message: 'No recipients found matching the criteria',
          data: { count: 0 }
        });
      }

      // Create notifications
      const notifications = recipients.map(recipient => ({
        recipient_id: recipient._id,
        recipient_type,
        notification_type,
        title,
        content,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
        metadata: { bulk_send: true }
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      res.json({
        success: true,
        message: 'Bulk notifications sent successfully',
        data: {
          notification_ids: createdNotifications.map(n => n._id),
          count: createdNotifications.length
        }
      });
      return;
    } catch (error) {
      console.error('Send bulk notification error:', error);
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
 * /api/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo
 *     tags: [Notifications]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed, delivered]
 *       - in: query
 *         name: notification_type
 *         schema:
 *           type: string
 *           enum: [email, sms, system]
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const notificationType = req.query.notification_type as string;

    const filter: any = {};
    if (status) filter.status = status;
    if (notificationType) filter.notification_type = notificationType;

    const notifications = await Notification.find(filter)
      .populate('recipient_id', 'full_name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      }
    });
    return;
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};

/**
 * @swagger
 * /api/notifications/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái thông báo
 *     tags: [Notifications]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed, delivered]
 *               error_message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trạng thái được cập nhật thành công
 */
export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, error_message } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        status,
        error_message,
        sent_at: status === 'sent' || status === 'delivered' ? new Date() : undefined
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification status updated successfully',
      data: notification
    });
    return;
  } catch (error) {
    console.error('Update notification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    return;
  }
};
