import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  report_name: string;
  report_type: 'statistics' | 'conversion' | 'source' | 'campaign' | 'counselor_performance' | 'student_progress';
  report_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  start_date: Date;
  end_date: Date;
  generated_by: mongoose.Types.ObjectId;
  report_data: Record<string, any>;
  file_path?: string;
  file_format: 'excel' | 'pdf' | 'csv';
  status: 'generating' | 'completed' | 'failed';
  error_message?: string;
  download_count: number;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  report_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  report_type: {
    type: String,
    required: true,
    enum: ['statistics', 'conversion', 'source', 'campaign', 'counselor_performance', 'student_progress']
  },
  report_period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  generated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  report_data: {
    type: Schema.Types.Mixed,
    required: true
  },
  file_path: {
    type: String,
    trim: true
  },
  file_format: {
    type: String,
    required: true,
    enum: ['excel', 'pdf', 'csv']
  },
  status: {
    type: String,
    required: true,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  error_message: {
    type: String,
    trim: true
  },
  download_count: {
    type: Number,
    default: 0,
    min: 0
  },
  is_public: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
ReportSchema.index({ generated_by: 1 });
ReportSchema.index({ report_type: 1 });
ReportSchema.index({ report_period: 1 });
ReportSchema.index({ start_date: 1, end_date: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);
