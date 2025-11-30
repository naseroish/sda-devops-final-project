export interface Expense {
  _id: string
  name: string
  amount: number
  category: string
  date: string
  currency: string
  note?: string
  tags: string[]
  walletId?: string
  userId?: string
  isRecurring?: boolean
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseSummary {
  totalAmount: number
  totalCount: number
  averagePerDay: number
  distinctCategories: number
  categoryBreakdown: Array<{
    category: string
    total: number
    percentage: number
    count: number
    average: number
  }>
  trend: Array<{ date: string; total: number }>
  topCategory?: {
    category: string
    total: number
    percentage: number
  }
  topExpense?: {
    name: string
    amount: number
    category: string
    date: string
  }
  anomalies: Array<{ id: string; name: string; amount: number; category: string; date: string }>
}

export interface Budget {
  _id: string
  name: string
  category: string
  limit: number
  walletId?: string
  userId?: string
  periodStart: string
  periodEnd: string
  notes?: string
}

export interface BudgetPayload {
  name: string
  category: string
  limit: number
  periodStart: string
  periodEnd: string
  walletId?: string
  userId?: string
  notes?: string
}

export interface BudgetWithUsage {
  budget: Budget
  spent: number
  remaining: number
  utilization: number
}

export interface Goal {
  _id: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  walletId?: string
  userId?: string
  deadline?: string
}

export interface GoalPayload {
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  walletId?: string
  userId?: string
  deadline?: string
}

export interface WalletMember {
  userId: string
  role: 'owner' | 'editor' | 'viewer'
}

export interface Wallet {
  _id: string
  name: string
  ownerId: string
  members: WalletMember[]
  currency: string
}

export interface DashboardFilters {
  walletId?: string
  from: string
  to: string
  categories: string[]
  search: string
  tags: string[]
  sort: 'asc' | 'desc'
}
