import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseCategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseCategorySchema = new Schema<ICourseCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
CourseCategorySchema.index({ name: 1 });

export default mongoose.model<ICourseCategory>('CourseCategory', CourseCategorySchema);
