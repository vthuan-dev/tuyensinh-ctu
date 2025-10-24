import mongoose, { Document, Schema } from 'mongoose';

export interface IOCRDocument extends Document {
  original_filename: string;
  file_path: string;
  file_type: 'image' | 'pdf';
  file_size: number;
  upload_by: mongoose.Types.ObjectId;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  error_message?: string;
  processed_at?: Date;
  student_data?: {
    name?: string;
    email?: string;
    phone?: string;
    course_interest?: string;
    source?: string;
  };
  is_verified: boolean;
  verified_by?: mongoose.Types.ObjectId;
  verified_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OCRDocumentSchema = new Schema<IOCRDocument>({
  original_filename: {
    type: String,
    required: true,
    trim: true
  },
  file_path: {
    type: String,
    required: true,
    trim: true
  },
  file_type: {
    type: String,
    required: true,
    enum: ['image', 'pdf']
  },
  file_size: {
    type: Number,
    required: true,
    min: 0
  },
  upload_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processing_status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  extracted_data: {
    type: Schema.Types.Mixed
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1
  },
  error_message: {
    type: String,
    trim: true
  },
  processed_at: {
    type: Date
  },
  student_data: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    course_interest: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      trim: true
    }
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verified_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_at: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
OCRDocumentSchema.index({ upload_by: 1 });
OCRDocumentSchema.index({ processing_status: 1 });
OCRDocumentSchema.index({ is_verified: 1 });
OCRDocumentSchema.index({ createdAt: -1 });

export default mongoose.model<IOCRDocument>('OCRDocument', OCRDocumentSchema);
