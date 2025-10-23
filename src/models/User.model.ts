import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  full_name: string;
  user_type: 'admin' | 'counselor' | 'manager';
  is_main_consultant: boolean;
  kpi_group_id?: mongoose.Types.ObjectId;
  employment_date: Date;
  status: 'active' | 'inactive' | 'on_leave';
  program_type?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: true,
    minlength: 6
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  user_type: {
    type: String,
    required: true,
    enum: ['admin', 'counselor', 'manager'],
    default: 'counselor'
  },
  is_main_consultant: {
    type: Boolean,
    default: false
  },
  kpi_group_id: {
    type: Schema.Types.ObjectId,
    ref: 'KpiGroup'
  },
  employment_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  program_type: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ user_type: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ employment_date: 1 });

export default mongoose.model<IUser>('User', UserSchema);
