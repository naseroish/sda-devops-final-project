import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  name: string;
  amount: number;
  category: string;
  date: Date;
  currency: string;
  note?: string;
  tags: string[];
  walletId?: Types.ObjectId;
  userId?: Types.ObjectId;
  isRecurring: boolean;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ walletId: 1, date: -1 });
expenseSchema.index({ userId: 1, date: -1 });

const Expense = model<IExpense>('Expense', expenseSchema);

export default Expense;
