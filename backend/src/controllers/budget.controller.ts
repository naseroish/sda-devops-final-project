import { Request, Response } from 'express';
import { BudgetService, BudgetFilters } from '../services/budget.service';

const budgetService = new BudgetService();

export const listBudgets = async (req: Request, res: Response) => {
  try {
    const { includeUsage, ...filters } = req.query as { includeUsage?: boolean } & BudgetFilters;

    const budgets = includeUsage
      ? await budgetService.listBudgetsWithUsage(filters)
      : await budgetService.listBudgets(filters);

    res.json(budgets);
  } catch (error) {
    console.error('Failed to list budgets:', error);
    res.status(500).json({ error: 'Failed to list budgets' });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    const budget = await budgetService.createBudget(req.body);
    res.status(201).json(budget);
  } catch (error) {
    console.error('Failed to create budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const budget = await budgetService.updateBudget(req.params.id, req.body);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    console.error('Failed to update budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    await budgetService.deleteBudget(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
