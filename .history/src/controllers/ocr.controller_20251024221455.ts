import { Request, Response } from 'express';
import Joi from 'joi';
import OCRDocument from '@/models/OCRDocument.model';
import Student from '@/models/Student.model';
import { validateRequest } from '@/middlewares/validation.middleware';

// Validation schemas
const processOCRSchema = Joi.object({
  file_path: Joi.string().required(),
  original_filename: Joi.string().required(),
  file_type: Joi.string().valid('image', 'pdf').required(),
  file_size: Joi.number().min(0).required()
});

const verifyOCRDataSchema = Joi.object({
  student_data: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    course_interest: Joi.string().optional(),
    source: Joi.string().optional()
  }).required()
});

/**
 * @swagger
 * /api/ocr/process:
 *   post:
 *     summary: Xử lý OCR từ file
 *     tags: [OCR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_path
 *               - original_filename
 *               - file_type
 *               - file_size
 *             properties:
 *               file_path:
 *                 type: string
 *               original_filename:
 *                 type: string
 *               file_type:
 *                 type: string
 *                 enum: [image, pdf]
 *               file_size:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: OCR được xử lý thành công
 */
export const processOCR = [
  validateRequest(processOCRSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { file_path, original_filename, file_type, file_size } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Create OCR document record
      const ocrDocument = new OCRDocument({
        original_filename,
        file_path,
        file_type,
        file_size,
        upload_by: userId,
        processing_status: 'pending'
      });

      await ocrDocument.save();

      // TODO: Implement actual OCR processing
      // This would involve:
      // 1. Calling OCR service (Google Vision API, Tesseract, etc.)
      // 2. Extracting text and structured data
      // 3. Parsing student information
      // 4. Updating document with extracted data

      // Simulate OCR processing
      setTimeout(async () => {
        try {
          const extractedData = {
            student_name: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phone: '0123456789',
            course_interest: 'Lập trình',
            source: 'Website'
          };

          await OCRDocument.findByIdAndUpdate(ocrDocument._id, {
            processing_status: 'completed',
            extracted_data: extractedData,
            confidence_score: 0.85,
            processed_at: new Date()
          });
        } catch (error) {
          await OCRDocument.findByIdAndUpdate(ocrDocument._id, {
            processing_status: 'failed',
            error_message: 'OCR processing failed'
          });
        }
      }, 2000);

      res.json({
        success: true,
        message: 'OCR processing started',
        data: {
          document_id: ocrDocument._id,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Process OCR error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

/**
 * @swagger
 * /api/ocr/documents:
 *   get:
 *     summary: Lấy danh sách tài liệu OCR
 *     tags: [OCR]
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
 *         name: processing_status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Danh sách tài liệu OCR
 */
export const getOCRDocuments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const processingStatus = req.query.processing_status as string;
    const isVerified = req.query.is_verified as string;

    const filter: any = {};
    if (processingStatus) filter.processing_status = processingStatus;
    if (isVerified !== undefined) filter.is_verified = isVerified === 'true';

    const documents = await OCRDocument.find(filter)
      .populate('upload_by', 'full_name email')
      .populate('verified_by', 'full_name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await OCRDocument.countDocuments(filter);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      }
    });
  } catch (error) {
    console.error('Get OCR documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @swagger
 * /api/ocr/documents/{id}/verify:
 *   put:
 *     summary: Xác minh và cập nhật dữ liệu OCR
 *     tags: [OCR]
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
 *               - student_data
 *             properties:
 *               student_data:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   course_interest:
 *                     type: string
 *                   source:
 *                     type: string
 *     responses:
 *       200:
 *         description: Dữ liệu OCR được xác minh thành công
 */
export const verifyOCRData = [
  validateRequest(verifyOCRDataSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { student_data } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const ocrDocument = await OCRDocument.findByIdAndUpdate(
        id,
        {
          student_data,
          is_verified: true,
          verified_by: userId,
          verified_at: new Date()
        },
        { new: true }
      );

      if (!ocrDocument) {
        return res.status(404).json({
          success: false,
          message: 'OCR document not found'
        });
      }

      // TODO: Create student record from verified data
      // This would involve:
      // 1. Creating a new Student record
      // 2. Linking to the OCR document
      // 3. Sending notifications

      res.json({
        success: true,
        message: 'OCR data verified successfully',
        data: ocrDocument
      });
    } catch (error) {
      console.error('Verify OCR data error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

/**
 * @swagger
 * /api/ocr/documents/{id}/create-student:
 *   post:
 *     summary: Tạo học viên từ dữ liệu OCR đã xác minh
 *     tags: [OCR]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Học viên được tạo thành công
 */
export const createStudentFromOCR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const ocrDocument = await OCRDocument.findById(id);
    if (!ocrDocument) {
      return res.status(404).json({
        success: false,
        message: 'OCR document not found'
      });
    }

    if (!ocrDocument.is_verified || !ocrDocument.student_data) {
      return res.status(400).json({
        success: false,
        message: 'OCR data must be verified before creating student'
      });
    }

    const { name, email, phone, course_interest, source } = ocrDocument.student_data;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { email: email },
        { phone_number: phone }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this email or phone number'
      });
    }

    // Create new student
    const student = new Student({
      student_name: name || 'Unknown',
      email: email || '',
      phone_number: phone || '',
      gender: 'other', // Default value
      date_of_birth: new Date('1990-01-01'), // Default value
      current_education_level: 'Other',
      city: 'Unknown',
      source: source || 'OCR',
      notification_consent: 'Agree',
      current_status: 'Lead'
    });

    await student.save();

    res.json({
      success: true,
      message: 'Student created successfully from OCR data',
      data: {
        student_id: student._id,
        ocr_document_id: ocrDocument._id
      }
    });
  } catch (error) {
    console.error('Create student from OCR error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
