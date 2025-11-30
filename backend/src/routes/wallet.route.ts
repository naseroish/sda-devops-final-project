import { Router } from 'express';
import {
  listWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  addWalletMember,
  removeWalletMember,
} from '../controllers/wallet.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  walletBodySchema,
  walletIdSchema,
  walletMemberParamsSchema,
  walletQuerySchema,
  walletUpdateSchema,
  memberBodySchema,
} from '../validation/wallet.schema';

const router = Router();

router.get('/wallets', validateQuery(walletQuerySchema), listWallets);
router.post('/wallets', validateBody(walletBodySchema), createWallet);
router.put(
  '/wallets/:id',
  validateParams(walletIdSchema),
  validateBody(walletUpdateSchema),
  updateWallet
);
router.delete('/wallets/:id', validateParams(walletIdSchema), deleteWallet);
router.post(
  '/wallets/:id/members',
  validateParams(walletIdSchema),
  validateBody(memberBodySchema),
  addWalletMember
);
router.delete(
  '/wallets/:id/members/:userId',
  validateParams(walletMemberParamsSchema),
  removeWalletMember
);

export default router;
