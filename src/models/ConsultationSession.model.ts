import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultationSession extends Document {
  counselor_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  session_date: Date;
  duration_minutes: number;
  notes: string;
  session_type: 'Phone Call' | 'Online Meeting' | 'In-Person' | 'Email' | 'Chat';
  session_status: 'Scheduled' | 'Completed' | 'Canceled' | 'No Show';
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSessionSchema = new Schema<IConsultationSession>({
  counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  session_date: {
    type: Date,
    required: true
  },
  duration_minutes: {
    type: Number,
    required: true,
    min: 0,
    max: 1440 // Max 24 hours
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  session_type: {
    type: String,
    required: true,
    enum: ['Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat']
  },
  session_status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Completed', 'Canceled', 'No Show'],
    default: 'Scheduled'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
ConsultationSessionSchema.index({ counselor_id: 1 });
ConsultationSessionSchema.index({ student_id: 1 });
ConsultationSessionSchema.index({ session_date: 1 });
ConsultationSessionSchema.index({ session_status: 1 });
ConsultationSessionSchema.index({ session_type: 1 });

export default mongoose.model<IConsultationSession>('ConsultationSession', ConsultationSessionSchema);
