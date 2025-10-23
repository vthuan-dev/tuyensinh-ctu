import mongoose, { Document, Schema } from 'mongoose';

export interface ICounselorKpiTarget extends Document {
  counselor_id: mongoose.Types.ObjectId;
  kpi_id: mongoose.Types.ObjectId;
  target_value: number;
  start_date: Date;
  end_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CounselorKpiTargetSchema = new Schema<ICounselorKpiTarget>({
  counselor_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kpi_id: {
    type: Schema.Types.ObjectId,
    ref: 'KpiDefinition',
    required: true
  },
  target_value: {
    type: Number,
    required: true,
    min: 0
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: ICounselorKpiTarget, value: Date) {
        return value > this.start_date;
      },
      message: 'End date must be after start date'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
CounselorKpiTargetSchema.index({ counselor_id: 1 });
CounselorKpiTargetSchema.index({ kpi_id: 1 });
CounselorKpiTargetSchema.index({ start_date: 1, end_date: 1 });

export default mongoose.model<ICounselorKpiTarget>('CounselorKpiTarget', CounselorKpiTargetSchema);
