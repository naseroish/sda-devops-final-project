import { FilterQuery } from 'mongoose';
import Expense, { IExpense } from '../models/expense.model';
import redis from '../config/redis';

export type ExpenseFilters = {
  walletId?: string;
  userId?: string;
  categories?: string[];
  tags?: string[];
  search?: string;
  from?: string | Date;
  to?: string | Date;
  limit?: number;
  sort?: 'asc' | 'desc';
};

export type CreateExpenseInput = {
  name: string;
  amount: number;
  category: string;
  date?: string | Date;
  currency?: string;
  note?: string;
  tags?: string[];
  walletId?: string;
  userId?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  averagePerDay: number;
  distinctCategories: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    percentage: number;
    count: number;
    average: number;
  }>;
  trend: Array<{ date: string; total: number }>;
  topCategory?: {
    category: string;
    total: number;
    percentage: number;
  };
  topExpense?: {
    name: string;
    amount: number;
    category: string;
    date: Date;
  };
  anomalies: Array<{ id: string; name: string; amount: number; category: string; date: Date }>;
}

export class ExpenseService {
  async getExpenses(filters: ExpenseFilters = {}) {
    const query = this.buildFilters(filters);
    const sortDirection = filters.sort === 'asc' ? 1 : -1;
    const limit = filters.limit ? Math.min(filters.limit, 500) : undefined;

    return Expense.find(query)
      .sort({ date: sortDirection, createdAt: sortDirection })
      .limit(limit ?? 0);
  }

  async createExpense(payload: CreateExpenseInput) {
    const normalizedTags = payload.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
    const expense = await Expense.create({
      ...payload,
      date: payload.date ? new Date(payload.date) : new Date(),
      currency: (payload.currency ?? 'USD').toUpperCase(),
      tags: normalizedTags,
    });
    await this.invalidateCaches();
    return expense;
  }

  async updateExpense(id: string, payload: UpdateExpenseInput) {
    const normalizedPayload: UpdateExpenseInput = {
      ...payload,
      ...(payload.currency ? { currency: payload.currency.toUpperCase() } : {}),
      ...(payload.tags
        ? { tags: payload.tags.map((tag) => tag.trim()).filter(Boolean) }
        : {}),
    };
    const expense = await Expense.findByIdAndUpdate(
      id,
      {
        ...normalizedPayload,
        ...(payload.date ? { date: new Date(payload.date) } : {}),
      },
      { new: true }
    );
    await this.invalidateCaches();
    return expense;
  }

  async deleteExpense(id: string) {
    await Expense.findByIdAndDelete(id);
    await this.invalidateCaches();
  }

  async getSummary(filters: ExpenseFilters = {}): Promise<ExpenseSummary> {
    const cacheKey = this.buildCacheKey('summary', filters);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const match = this.buildFilters(filters);

    const [totals] = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' },
        },
      },
    ]);

    const categoryAggregation = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const trend = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categoryBreakdown = categoryAggregation.map((entry) => ({
      category: entry._id,
      total: entry.total,
      count: entry.count,
      average: entry.average,
      percentage: totals && totals.totalAmount > 0 ? (entry.total / totals.totalAmount) * 100 : 0,
    }));

    const topExpenseDoc = await Expense.find(match)
      .sort({ amount: -1 })
      .limit(1);

    const breakdownMap = new Map(
      categoryBreakdown.map((entry) => [entry.category, entry])
    );

    const anomalyCandidates = await Expense.find(match)
      .sort({ amount: -1 })
      .limit(25)
      .lean();

    const anomalies = anomalyCandidates
      .filter((expense) => {
        const breakdown = breakdownMap.get(expense.category);
        if (!breakdown || breakdown.average === 0) {
          return false;
        }
        const threshold = breakdown.average * 1.5;
        return expense.amount >= threshold;
      })
      .slice(0, 5)
      .map((expense) => ({
        id: expense._id.toString(),
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      }));

    const totalAmount = totals?.totalAmount ?? 0;
    const totalCount = totals?.totalCount ?? 0;
    const daySpan = this.calculateDaySpan(filters, totals?.minDate, totals?.maxDate);

    const summary: ExpenseSummary = {
      totalAmount,
      totalCount,
      averagePerDay: daySpan > 0 ? totalAmount / daySpan : 0,
      distinctCategories: categoryBreakdown.length,
      categoryBreakdown,
      trend: trend.map((entry) => ({ date: entry._id, total: entry.total })),
      topCategory: categoryBreakdown[0]
        ? {
            category: categoryBreakdown[0].category,
            total: categoryBreakdown[0].total,
            percentage: categoryBreakdown[0].percentage,
          }
        : undefined,
      topExpense: topExpenseDoc[0]
        ? {
            name: topExpenseDoc[0].name,
            amount: topExpenseDoc[0].amount,
            category: topExpenseDoc[0].category,
            date: topExpenseDoc[0].date,
          }
        : undefined,
      anomalies,
    };

    await redis.set(cacheKey, JSON.stringify(summary), 'EX', 60);
    return summary;
  }

  private buildFilters(filters: ExpenseFilters): FilterQuery<IExpense> {
    const query: FilterQuery<IExpense> = {};

    if (filters.walletId) {
      query.walletId = filters.walletId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories } as any;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags } as any;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { note: { $regex: filters.search, $options: 'i' } },
      ] as any;
    }

    if (filters.from || filters.to) {
      const dateRange: { $gte?: Date; $lte?: Date } = {};
      if (filters.from) {
        dateRange.$gte = new Date(filters.from);
      }
      if (filters.to) {
        dateRange.$lte = new Date(filters.to);
      }
      query.date = dateRange as any;
    }

    return query;
  }

  private calculateDaySpan(filters: ExpenseFilters, minDate?: Date, maxDate?: Date) {
    const from = filters.from ? new Date(filters.from) : minDate;
    const to = filters.to ? new Date(filters.to) : maxDate;

    if (!from || !to) {
      return 0;
    }

    const diff = Math.abs(to.getTime() - from.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  private buildCacheKey(prefix: string, filters: ExpenseFilters) {
    const normalized = {
      ...filters,
      categories: filters.categories?.sort(),
      tags: filters.tags?.sort(),
    };
    return `${prefix}:${JSON.stringify(normalized)}`;
  }

  private async invalidateCaches() {
    const keys = await redis.keys('summary:*');
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
