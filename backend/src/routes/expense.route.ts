import { Router } from 'express';
import {
	getExpenses,
	addExpense,
	updateExpense,
	deleteExpense,
	getExpenseSummary,
} from '../controllers/expense.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
	expenseBodySchema,
	expenseQuerySchema,
	expenseSummaryQuerySchema,
	expenseUpdateSchema,
	idParamSchema,
} from '../validation/expense.schema';

const router = Router();

router.get('/expenses', validateQuery(expenseQuerySchema), getExpenses);
router.get('/expenses/summary', validateQuery(expenseSummaryQuerySchema), getExpenseSummary);
router.post('/expenses', validateBody(expenseBodySchema), addExpense);
router.put(
	'/expenses/:id',
	validateParams(idParamSchema),
	validateBody(expenseUpdateSchema),
	updateExpense
);
router.delete('/expenses/:id', validateParams(idParamSchema), deleteExpense);

export default router;
