import Wallet, { IWallet, IWalletMember } from '../models/wallet.model';

export type WalletInput = {
  name: string;
  ownerId: string;
  members?: IWalletMember[];
  currency?: string;
};

export class WalletService {
  async listWallets(ownerId?: string) {
    const query = ownerId ? { ownerId } : {};
    return Wallet.find(query).sort({ createdAt: -1 });
  }

  async getWallet(id: string) {
    return Wallet.findById(id);
  }

  async createWallet(payload: WalletInput) {
    return Wallet.create({
      ...payload,
      members: payload.members ?? [],
    });
  }

  async updateWallet(id: string, payload: Partial<WalletInput>) {
    return Wallet.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(payload.members ? { members: payload.members } : {}),
      },
      { new: true }
    );
  }

  async deleteWallet(id: string) {
    await Wallet.findByIdAndDelete(id);
  }

  async addMember(id: string, member: IWalletMember) {
    return Wallet.findByIdAndUpdate(
      id,
      { $addToSet: { members: member } },
      { new: true }
    );
  }

  async removeMember(id: string, userId: string) {
    return Wallet.findByIdAndUpdate(
      id,
      { $pull: { members: { userId } } },
      { new: true }
    );
  }
}
