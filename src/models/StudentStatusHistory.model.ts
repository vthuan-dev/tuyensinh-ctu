import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentStatusHistory extends Document {
  student_id: mongoose.Types.ObjectId;
  old_status: string;
  new_status: string;
  change_date: Date;
  changed_by_user_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentStatusHistorySchema = new Schema<IStudentStatusHistory>({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  old_status: {
    type: String,
    required: true,
    trim: true
  },
  new_status: {
    type: String,
    required: true,
    trim: true
  },
  change_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  changed_by_user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
StudentStatusHistorySchema.index({ student_id: 1 });
StudentStatusHistorySchema.index({ change_date: -1 });
StudentStatusHistorySchema.index({ changed_by_user_id: 1 });

export default mongoose.model<IStudentStatusHistory>('StudentStatusHistory', StudentStatusHistorySchema);
