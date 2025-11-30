import { FilterQuery } from 'mongoose';
import Budget, { IBudget } from '../models/budget.model';
import Expense from '../models/expense.model';

export type BudgetFilters = {
  walletId?: string;
  userId?: string;
  categories?: string[];
  activeOn?: string | Date;
};

export type BudgetInput = {
  name: string;
  category: string;
  limit: number;
  walletId?: string;
  userId?: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  notes?: string;
};

export class BudgetService {
  async listBudgets(filters: BudgetFilters = {}) {
    const query = this.buildFilters(filters);
    return Budget.find(query).sort({ periodStart: -1 });
  }

  async listBudgetsWithUsage(filters: BudgetFilters = {}) {
    const budgets = await this.listBudgets(filters);
    return Promise.all(
      budgets.map(async (budget: IBudget) => {
        const usage = await this.calculateUsage(budget);
        return {
          budget,
          spent: usage,
          remaining: Math.max(0, budget.limit - usage),
          utilization: budget.limit > 0 ? (usage / budget.limit) * 100 : 0,
        };
      })
    );
  }

  async createBudget(payload: BudgetInput) {
    return Budget.create({
      ...payload,
      periodStart: new Date(payload.periodStart),
      periodEnd: new Date(payload.periodEnd),
    });
  }

  async updateBudget(id: string, payload: Partial<BudgetInput>) {
    return Budget.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(payload.periodStart ? { periodStart: new Date(payload.periodStart) } : {}),
        ...(payload.periodEnd ? { periodEnd: new Date(payload.periodEnd) } : {}),
      },
      { new: true }
    );
  }

  async deleteBudget(id: string) {
    await Budget.findByIdAndDelete(id);
  }

  private buildFilters(filters: BudgetFilters): FilterQuery<IBudget> {
    const query: FilterQuery<IBudget> = {};

    if (filters.walletId) {
      query.walletId = filters.walletId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories } as any;
    }

    if (filters.activeOn) {
      const activeDate = new Date(filters.activeOn);
      query.periodStart = { $lte: activeDate } as any;
      query.periodEnd = { $gte: activeDate } as any;
    }

    return query;
  }

  private async calculateUsage(budget: IBudget) {
    const [result] = await Expense.aggregate([
      {
        $match: {
          ...(budget.walletId ? { walletId: budget.walletId } : {}),
          ...(budget.userId ? { userId: budget.userId } : {}),
          category: budget.category,
          date: {
            $gte: budget.periodStart,
            $lte: budget.periodEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result?.total ?? 0;
  }
}
