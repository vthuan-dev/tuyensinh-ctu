import mongoose, { Document, Schema } from 'mongoose';

export interface IKpiDefinition extends Document {
  name: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

const KpiDefinitionSchema = new Schema<IKpiDefinition>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
KpiDefinitionSchema.index({ name: 1 });

export default mongoose.model<IKpiDefinition>('KpiDefinition', KpiDefinitionSchema);
