'use client'

import apiClient from './apiclient'
import { Expense, ExpenseSummary } from '@/types/dashboard'

export type ExpenseQueryParams = {
    walletId?: string
    userId?: string
    categories?: string[]
    tags?: string[]
    search?: string
    from?: string
    to?: string
    limit?: number
    sort?: 'asc' | 'desc'
}

export type ExpensePayload = {
    name: string
    amount: number
    category: string
    date?: string
    currency?: string
    note?: string
    tags?: string[]
    walletId?: string
    userId?: string
    isRecurring?: boolean
    receiptUrl?: string
}

const normalizeParams = (params: ExpenseQueryParams = {}) => ({
    ...params,
    categories: params.categories?.join(','),
    tags: params.tags?.join(','),
})

export const fetchExpensesAPI = (params?: ExpenseQueryParams) =>
    apiClient.get<Expense[]>('/expenses', { params: normalizeParams(params) })

export const fetchExpenseSummaryAPI = (params?: ExpenseQueryParams) =>
    apiClient.get<ExpenseSummary>('/expenses/summary', { params: normalizeParams(params) })

export const addExpensesAPI = (payload: ExpensePayload) =>
    apiClient.post<Expense>('/expenses', payload)

export const updateExpenseAPI = (id: string, payload: Partial<ExpensePayload>) =>
    apiClient.put<Expense>(`/expenses/${id}`, payload)

export const deleteExpenseAPI = (id: string) =>
    apiClient.delete<void>(`/expenses/${id}`)
