import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ExpensePayload,
  ExpenseQueryParams,
  addExpensesAPI,
  deleteExpenseAPI,
  fetchExpenseSummaryAPI,
  fetchExpensesAPI,
  updateExpenseAPI,
} from '@/api/expensesapi'
import {
  createBudgetAPI,
  createGoalAPI,
  deleteBudgetAPI,
  deleteGoalAPI,
  fetchBudgetsAPI,
  fetchGoalsAPI,
  fetchWalletsAPI,
  updateBudgetAPI,
  updateGoalAPI,
} from '@/api/dashboard'
import {
  BudgetPayload,
  BudgetWithUsage,
  DashboardFilters,
  Expense,
  ExpenseSummary,
  Goal,
  GoalPayload,
  Wallet,
} from '@/types/dashboard'

const createDefaultFilters = (): DashboardFilters => {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 29)

  return {
    from: from.toISOString(),
    to: now.toISOString(),
    walletId: undefined,
    categories: [],
    tags: [],
    search: '',
    sort: 'desc',
  }
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState(createDefaultFilters)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [budgets, setBudgets] = useState<BudgetWithUsage[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const expenseParams = useMemo<ExpenseQueryParams>(() => ({
    walletId: filters.walletId,
    from: filters.from,
    to: filters.to,
    categories: filters.categories,
    tags: filters.tags,
    search: filters.search,
    sort: filters.sort,
  }), [filters])

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [expensesRes, summaryRes, budgetsRes, goalsRes, walletsRes] = await Promise.all([
        fetchExpensesAPI(expenseParams),
        fetchExpenseSummaryAPI(expenseParams),
        fetchBudgetsAPI({ walletId: filters.walletId, activeOn: filters.to }),
        fetchGoalsAPI({ walletId: filters.walletId, activeOnly: true }),
        fetchWalletsAPI(),
      ])

      setExpenses(expensesRes.data)
      setSummary(summaryRes.data)
      setBudgets(budgetsRes.data)
      setGoals(goalsRes.data)
      setWallets(walletsRes.data)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [expenseParams, filters.to, filters.walletId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refresh = useCallback(() => {
    fetchAll()
  }, [fetchAll])

  const updateFilters = (next: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const createExpense = async (payload: ExpensePayload) => {
    await addExpensesAPI(payload)
    refresh()
  }

  const createBudget = async (payload: BudgetPayload) => {
    await createBudgetAPI(payload)
    refresh()
  }

  const createGoal = async (payload: GoalPayload) => {
    await createGoalAPI(payload)
    refresh()
  }

  const editExpense = async (id: string, payload: Partial<ExpensePayload>) => {
    await updateExpenseAPI(id, payload)
    refresh()
  }

  const removeExpense = async (id: string) => {
    await deleteExpenseAPI(id)
    refresh()
  }

  const editBudget = async (id: string, payload: Partial<BudgetPayload>) => {
    await updateBudgetAPI(id, payload)
    refresh()
  }

  const removeBudget = async (id: string) => {
    await deleteBudgetAPI(id)
    refresh()
  }

  const editGoal = async (id: string, payload: Partial<GoalPayload>) => {
    await updateGoalAPI(id, payload)
    refresh()
  }

  const removeGoal = async (id: string) => {
    await deleteGoalAPI(id)
    refresh()
  }

  return {
    expenses,
    summary,
    budgets,
    goals,
    wallets,
    filters,
    isLoading,
    error,
    refresh,
    updateFilters,
    createExpense,
    createBudget,
    createGoal,
    editExpense,
    removeExpense,
    editBudget,
    removeBudget,
    editGoal,
    removeGoal,
  }
}
