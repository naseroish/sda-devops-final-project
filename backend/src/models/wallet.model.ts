import { Schema, model, Document, Types } from 'mongoose';

export interface IWalletMember {
  userId: Types.ObjectId;
  role: 'owner' | 'editor' | 'viewer';
}

export interface IWallet extends Document {
  name: string;
  ownerId: Types.ObjectId;
  members: IWalletMember[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          role: {
            type: String,
            enum: ['owner', 'editor', 'viewer'],
            default: 'viewer',
          },
        },
      ],
      default: [],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.index({ ownerId: 1 });

export const Wallet = model<IWallet>('Wallet', walletSchema);

export default Wallet;
