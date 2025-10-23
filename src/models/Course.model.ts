import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  category_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  duration_text: string;
  price: number;
  is_active: boolean;
  program_type: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'CourseCategory',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  duration_text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  program_type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
CourseSchema.index({ category_id: 1 });
CourseSchema.index({ is_active: 1 });
CourseSchema.index({ program_type: 1 });
CourseSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<ICourse>('Course', CourseSchema);
