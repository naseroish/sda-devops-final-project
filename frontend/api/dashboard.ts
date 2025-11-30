'use client'

import apiClient from './apiclient'
import {
  Budget,
  BudgetPayload,
  BudgetWithUsage,
  Goal,
  GoalPayload,
  Wallet,
} from '@/types/dashboard'

export const fetchBudgetsAPI = (params?: { walletId?: string; userId?: string; categories?: string[]; activeOn?: string }) =>
  apiClient.get<BudgetWithUsage[]>('/budgets', {
    params: {
      ...params,
      categories: params?.categories?.join(','),
      includeUsage: 'true',
    },
  })

export const fetchGoalsAPI = (params?: { walletId?: string; userId?: string; activeOnly?: boolean }) =>
  apiClient.get<Goal[]>('/goals', {
    params: {
      ...params,
      activeOnly: params?.activeOnly ? 'true' : undefined,
    },
  })

export const fetchWalletsAPI = (params?: { ownerId?: string }) =>
  apiClient.get<Wallet[]>('/wallets', { params })

export const createBudgetAPI = (payload: BudgetPayload) =>
  apiClient.post<Budget>('/budgets', payload)

export const updateBudgetAPI = (id: string, payload: Partial<BudgetPayload>) =>
  apiClient.put<Budget>(`/budgets/${id}`, payload)

export const deleteBudgetAPI = (id: string) => apiClient.delete<void>(`/budgets/${id}`)

export const createGoalAPI = (payload: GoalPayload) =>
  apiClient.post<Goal>('/goals', payload)

export const updateGoalAPI = (id: string, payload: Partial<GoalPayload>) =>
  apiClient.put<Goal>(`/goals/${id}`, payload)

export const deleteGoalAPI = (id: string) => apiClient.delete<void>(`/goals/${id}`)
