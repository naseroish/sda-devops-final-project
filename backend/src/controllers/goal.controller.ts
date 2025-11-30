import { Request, Response } from 'express';
import { GoalService, GoalFilters } from '../services/goal.service';

const goalService = new GoalService();

export const listGoals = async (req: Request, res: Response) => {
  try {
    const filters = req.query as GoalFilters;
    const goals = await goalService.listGoals(filters);
    res.json(goals);
  } catch (error) {
    console.error('Failed to list goals:', error);
    res.status(500).json({ error: 'Failed to list goals' });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = await goalService.createGoal(req.body);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Failed to create goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const goal = await goalService.updateGoal(req.params.id, req.body);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Failed to update goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    await goalService.deleteGoal(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

export const adjustGoalProgress = async (req: Request, res: Response) => {
  try {
    const { amountDelta } = req.body as { amountDelta: number };
    const goal = await goalService.adjustProgress(req.params.id, amountDelta);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Failed to adjust goal progress:', error);
    res.status(500).json({ error: 'Failed to adjust goal progress' });
  }
};
