import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  config_key: string;
  config_value: any;
  config_type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  category: 'notification' | 'schedule' | 'kpi' | 'system' | 'email' | 'sms';
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  updated_by: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>({
  config_key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  config_value: {
    type: Schema.Types.Mixed,
    required: true
  },
  config_type: {
    type: String,
    required: true,
    enum: ['string', 'number', 'boolean', 'object', 'array']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['notification', 'schedule', 'kpi', 'system', 'email', 'sms']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
SystemConfigSchema.index({ config_key: 1 });
SystemConfigSchema.index({ category: 1 });
SystemConfigSchema.index({ is_active: 1 });

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
