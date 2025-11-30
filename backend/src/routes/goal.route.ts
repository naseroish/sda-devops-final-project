import { Router } from 'express';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  adjustGoalProgress,
} from '../controllers/goal.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  goalBodySchema,
  goalQuerySchema,
  goalUpdateSchema,
  goalAdjustSchema,
  idParamSchema,
} from '../validation/goal.schema';

const router = Router();

router.get('/goals', validateQuery(goalQuerySchema), listGoals);
router.post('/goals', validateBody(goalBodySchema), createGoal);
router.put(
  '/goals/:id',
  validateParams(idParamSchema),
  validateBody(goalUpdateSchema),
  updateGoal
);
router.patch(
  '/goals/:id/progress',
  validateParams(idParamSchema),
  validateBody(goalAdjustSchema),
  adjustGoalProgress
);
router.delete('/goals/:id', validateParams(idParamSchema), deleteGoal);

export default router;
