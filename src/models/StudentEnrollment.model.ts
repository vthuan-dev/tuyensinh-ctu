import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentEnrollment extends Document {
  student_id: mongoose.Types.ObjectId;
  course_id: mongoose.Types.ObjectId;
  enrollment_date: Date;
  fee_paid: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  counselor_id: mongoose.Types.ObjectId;
  consultation_session_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentEnrollmentSchema = new Schema<IStudentEnrollment>({
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
  enrollment_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  fee_paid: {
    type: Number,
    required: true,
    min: 0
  },
  payment_status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultation_session_id: {
    type: Schema.Types.ObjectId,
    ref: 'ConsultationSession'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
StudentEnrollmentSchema.index({ student_id: 1 });
StudentEnrollmentSchema.index({ course_id: 1 });
StudentEnrollmentSchema.index({ counselor_id: 1 });
StudentEnrollmentSchema.index({ enrollment_date: -1 });
StudentEnrollmentSchema.index({ payment_status: 1 });

export default mongoose.model<IStudentEnrollment>('StudentEnrollment', StudentEnrollmentSchema);
