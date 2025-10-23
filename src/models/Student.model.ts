import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  student_name: string;
  email: string;
  phone_number: string;
  gender: 'male' | 'female' | 'other';
  zalo_phone?: string;
  link_facebook?: string;
  date_of_birth: Date;
  current_education_level: 'THPT' | 'SinhVien' | 'Other';
  high_school_name?: string;
  city: string;
  source: 'Mail' | 'Fanpage' | 'Zalo' | 'Website' | 'Friend' | 'SMS' | 'Banderole' | 'Poster' | 'Brochure' | 'Google' | 'Brand' | 'Event';
  notification_consent: 'Agree' | 'Disagree' | 'Other';
  current_status: 'Lead' | 'Engaging' | 'Registered' | 'Dropped Out' | 'Archived';
  assigned_counselor_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  student_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone_number: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  zalo_phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Please enter a valid Zalo phone number']
  },
  link_facebook: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?facebook\.com\/.+/, 'Please enter a valid Facebook link']
  },
  date_of_birth: {
    type: Date,
    required: true,
    validate: {
      validator: function(value: Date) {
        return value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  current_education_level: {
    type: String,
    required: true,
    enum: ['THPT', 'SinhVien', 'Other']
  },
  high_school_name: {
    type: String,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  source: {
    type: String,
    required: true,
    enum: ['Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event']
  },
  notification_consent: {
    type: String,
    required: true,
    enum: ['Agree', 'Disagree', 'Other']
  },
  current_status: {
    type: String,
    required: true,
    enum: ['Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived'],
    default: 'Lead'
  },
  assigned_counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
StudentSchema.index({ email: 1 });
StudentSchema.index({ phone_number: 1 });
StudentSchema.index({ current_status: 1 });
StudentSchema.index({ assigned_counselor_id: 1 });
StudentSchema.index({ source: 1 });
StudentSchema.index({ createdAt: -1 });

export default mongoose.model<IStudent>('Student', StudentSchema);
