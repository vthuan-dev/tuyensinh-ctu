import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  student_id: mongoose.Types.ObjectId;
  counselor_id: mongoose.Types.ObjectId;
  schedule_id: mongoose.Types.ObjectId;
  appointment_date: Date;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  appointment_type: 'phone' | 'online' | 'in_person';
  notes?: string;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  created_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule_id: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  appointment_date: {
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
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  appointment_type: {
    type: String,
    required: true,
    enum: ['phone', 'online', 'in_person']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reminder_sent: {
    type: Boolean,
    default: false
  },
  confirmation_sent: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
AppointmentSchema.index({ student_id: 1 });
AppointmentSchema.index({ counselor_id: 1 });
AppointmentSchema.index({ appointment_date: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ counselor_id: 1, appointment_date: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
