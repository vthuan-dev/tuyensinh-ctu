import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient_id: mongoose.Types.ObjectId;
  recipient_type: 'student' | 'counselor' | 'admin';
  notification_type: 'email' | 'sms' | 'system';
  title: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  scheduled_at?: Date;
  sent_at?: Date;
  delivery_attempts: number;
  error_message?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient_id: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipient_type'
  },
  recipient_type: {
    type: String,
    required: true,
    enum: ['student', 'counselor', 'admin']
  },
  notification_type: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'system']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  },
  scheduled_at: {
    type: Date
  },
  sent_at: {
    type: Date
  },
  delivery_attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  error_message: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
NotificationSchema.index({ recipient_id: 1, recipient_type: 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ notification_type: 1 });
NotificationSchema.index({ scheduled_at: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
