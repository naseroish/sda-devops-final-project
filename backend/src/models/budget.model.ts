import { Schema, model, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  name: string;
  category: string;
  limit: number;
  walletId?: Types.ObjectId;
  userId?: Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ walletId: 1, periodStart: 1, periodEnd: 1 });
budgetSchema.index({ userId: 1, periodStart: 1, periodEnd: 1 });

export const Budget = model<IBudget>('Budget', budgetSchema);

export default Budget;
