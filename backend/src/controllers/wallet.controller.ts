import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';

const walletService = new WalletService();

export const listWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await walletService.listWallets(req.query.ownerId as string | undefined);
    res.json(wallets);
  } catch (error) {
    console.error('Failed to list wallets:', error);
    res.status(500).json({ error: 'Failed to list wallets' });
  }
};

export const createWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Failed to create wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
};

export const updateWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.updateWallet(req.params.id, req.body);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (error) {
    console.error('Failed to update wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
};

export const deleteWallet = async (req: Request, res: Response) => {
  try {
    await walletService.deleteWallet(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete wallet:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
};

export const addWalletMember = async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.addMember(req.params.id, req.body);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (error) {
    console.error('Failed to add wallet member:', error);
    res.status(500).json({ error: 'Failed to add wallet member' });
  }
};

export const removeWalletMember = async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.removeMember(req.params.id, req.params.userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (error) {
    console.error('Failed to remove wallet member:', error);
    res.status(500).json({ error: 'Failed to remove wallet member' });
  }
};
