import mongoose, { Document, Schema } from 'mongoose';

export interface ICounselorSpecialization extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CounselorSpecializationSchema = new Schema<ICounselorSpecialization>({
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
CounselorSpecializationSchema.index({ name: 1 });

export default mongoose.model<ICounselorSpecialization>('CounselorSpecialization', CounselorSpecializationSchema);
