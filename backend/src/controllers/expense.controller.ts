
import { Request, Response } from 'express';
import { ExpenseService, ExpenseFilters } from '../services/expense.service';

const expenseService = new ExpenseService();

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const filters = req.query as unknown as ExpenseFilters;

    const expenses = await expenseService.getExpenses(filters);
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const filters = req.query as unknown as ExpenseFilters;
    const summary = await expenseService.getSummary(filters);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Failed to fetch summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    console.error('Failed to create expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error('Failed to update expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
