import { Router } from 'express';
import {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  budgetBodySchema,
  budgetQuerySchema,
  budgetUpdateSchema,
  idParamSchema,
} from '../validation/budget.schema';

const router = Router();

router.get('/budgets', validateQuery(budgetQuerySchema), listBudgets);
router.post('/budgets', validateBody(budgetBodySchema), createBudget);
router.put(
  '/budgets/:id',
  validateParams(idParamSchema),
  validateBody(budgetUpdateSchema),
  updateBudget
);
router.delete('/budgets/:id', validateParams(idParamSchema), deleteBudget);

export default router;
