import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentInterestedCourse extends Document {
  student_id: mongoose.Types.ObjectId;
  course_id: mongoose.Types.ObjectId;
  interest_date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentInterestedCourseSchema = new Schema<IStudentInterestedCourse>({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  interest_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
StudentInterestedCourseSchema.index({ student_id: 1 });
StudentInterestedCourseSchema.index({ course_id: 1 });
StudentInterestedCourseSchema.index({ interest_date: -1 });

// Compound index to prevent duplicate interests
StudentInterestedCourseSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

export default mongoose.model<IStudentInterestedCourse>('StudentInterestedCourse', StudentInterestedCourseSchema);
