import { FilterQuery } from 'mongoose';
import Goal, { IGoal } from '../models/goal.model';

export type GoalFilters = {
  walletId?: string;
  userId?: string;
  activeOnly?: boolean;
};

export type GoalInput = {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  walletId?: string;
  userId?: string;
  deadline?: string | Date;
};

export class GoalService {
  async listGoals(filters: GoalFilters = {}) {
    const query = this.buildFilters(filters);
    return Goal.find(query).sort({ deadline: 1 });
  }

  async createGoal(payload: GoalInput) {
    return Goal.create({
      ...payload,
      deadline: payload.deadline ? new Date(payload.deadline) : undefined,
    });
  }

  async updateGoal(id: string, payload: Partial<GoalInput>) {
    return Goal.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(payload.deadline ? { deadline: new Date(payload.deadline) } : {}),
      },
      { new: true }
    );
  }

  async deleteGoal(id: string) {
    await Goal.findByIdAndDelete(id);
  }

  async adjustProgress(id: string, amountDelta: number) {
    return Goal.findByIdAndUpdate(
      id,
      {
        $inc: { currentAmount: amountDelta },
      },
      { new: true }
    );
  }

  private buildFilters(filters: GoalFilters): FilterQuery<IGoal> {
    const query: FilterQuery<IGoal> = {};

    if (filters.walletId) {
      query.walletId = filters.walletId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.activeOnly) {
      query.targetAmount = { $gt: 0 } as any;
      query.$expr = {
        $lt: ['$currentAmount', '$targetAmount'],
      } as any;
    }

    return query;
  }
}
