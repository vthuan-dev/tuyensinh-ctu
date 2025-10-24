import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  counselor_id: mongoose.Types.ObjectId;
  date: Date;
  start_time: string; // Format: "HH:mm"
  end_time: string; // Format: "HH:mm"
  is_available: boolean;
  max_appointments: number;
  current_appointments: number;
  break_duration_minutes: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
  counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  start_time: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:mm)']
  },
  end_time: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:mm)']
  },
  is_available: {
    type: Boolean,
    default: true
  },
  max_appointments: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  current_appointments: {
    type: Number,
    default: 0,
    min: 0
  },
  break_duration_minutes: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
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
ScheduleSchema.index({ counselor_id: 1, date: 1 });
ScheduleSchema.index({ date: 1 });
ScheduleSchema.index({ is_available: 1 });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
