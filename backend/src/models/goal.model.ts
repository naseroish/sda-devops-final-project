import { Schema, model, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  walletId?: Types.ObjectId;
  userId?: Types.ObjectId;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
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
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ walletId: 1, deadline: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

export const Goal = model<IGoal>('Goal', goalSchema);

export default Goal;
