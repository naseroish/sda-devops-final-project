"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit3, PlusCircle, Target, Trash2, TrendingUp } from "lucide-react"
import {
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { ExpensePayload } from "@/api/expensesapi"
import {
  BudgetPayload,
  BudgetWithUsage,
  DashboardFilters,
  Expense,
  ExpenseSummary,
  Goal,
  GoalPayload,
  Wallet,
} from "@/types/dashboard"

const CATEGORY_OPTIONS = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Travel",
  "Education",
  "Investments",
  "Gifts",
  "Other",
]

const categoryIcons: Record<string, string> = {
  Housing: "🏠",
  Food: "🍽️",
  Transportation: "🚗",
  Utilities: "⚡",
  Entertainment: "🎮",
  Healthcare: "🩺",
  Shopping: "🛍️",
  Travel: "✈️",
  Education: "📚",
  Investments: "📈",
  Gifts: "🎁",
  Other: "📦",
}

const categoryPalette: Record<string, string> = {
  Housing: "#ef4444",
  Food: "#f97316",
  Transportation: "#3b82f6",
  Utilities: "#22c55e",
  Entertainment: "#a855f7",
  Healthcare: "#06b6d4",
  Shopping: "#ec4899",
  Travel: "#6366f1",
  Education: "#eab308",
  Investments: "#14b8a6",
  Gifts: "#f43f5e",
  Other: "#64748b",
}

const fallbackColors = [
  "#ef4444",
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#06b6d4",
]

const rangePresets = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Year to date", value: "ytd" },
]

const ALL_CATEGORIES_VALUE = "all"
const ALL_WALLETS_VALUE = "all"
const NO_WALLET_VALUE = "none"

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number.isFinite(value) ? value : 0)

const toDateInputValue = (iso?: string) => {
  if (!iso) return ""
  return new Date(iso).toISOString().slice(0, 10)
}

export default function HomePage() {
  const {
    expenses,
    summary,
    budgets,
    goals,
    wallets,
    filters,
    isLoading,
    error,
    updateFilters,
    createExpense,
    editExpense,
    removeExpense,
    createBudget,
    editBudget,
    removeBudget,
    createGoal,
    editGoal,
    removeGoal,
  } = useDashboardData()

  const categoriesData = useMemo(() => summary?.categoryBreakdown ?? [], [summary])

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {}
    categoriesData.forEach((item, index) => {
      colors[item.category] = categoryPalette[item.category] ?? fallbackColors[index % fallbackColors.length]
    })
    return colors
  }, [categoriesData])

  const visibleExpenses = useMemo(() => {
    const query = filters.search?.trim().toLowerCase()
    if (!query) return expenses
    return expenses.filter((expense) =>
      `${expense.name} ${expense.category}`.toLowerCase().includes(query)
    )
  }, [expenses, filters.search])

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>(CATEGORY_OPTIONS)
    categoriesData.forEach((item) => unique.add(item.category))
    return Array.from(unique)
  }, [categoriesData])

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader wallets={wallets} filters={filters} updateFilters={updateFilters} isLoading={isLoading} />

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 font-semibold text-destructive">{error}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid gap-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InsightGrid summary={summary} expensesCount={expenses.length} isLoading={isLoading} />
          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChartCard summary={summary} isLoading={isLoading} />
            <CategoryBreakdownCard
              categoryBreakdown={categoriesData}
              total={summary?.totalAmount || 0}
              categoryColors={categoryColors}
              isLoading={isLoading}
            />
          </div>
          <BudgetGoalOverview
            budgets={budgets}
            goals={goals}
            wallets={wallets}
            onCreateBudget={createBudget}
            onCreateGoal={createGoal}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsPanel
            expenses={visibleExpenses}
            filters={filters}
            updateFilters={updateFilters}
            categories={categoryOptions}
            onCreate={createExpense}
            onEdit={editExpense}
            onDelete={removeExpense}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetsPanel
            budgets={budgets}
            wallets={wallets}
            onCreate={createBudget}
            onEdit={editBudget}
            onDelete={removeBudget}
          />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsPanel
            goals={goals}
            wallets={wallets}
            onCreate={createGoal}
            onEdit={editGoal}
            onDelete={removeGoal}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
type BudgetFormDialogProps = {
  wallets: Wallet[]
  mode: "create" | "edit"
  initialBudget?: BudgetWithUsage
  onSubmit: (payload: BudgetPayload) => Promise<void>
  children?: ReactNode
}

const createBudgetFormState = (budget?: BudgetWithUsage) => {
  const today = new Date()
  const defaultEnd = new Date(today)
  defaultEnd.setDate(defaultEnd.getDate() + 29)
  const entity = budget?.budget

  return {
    name: entity?.name ?? "",
    category: entity?.category ?? "",
    limit: entity ? String(entity.limit) : "",
    walletId: entity?.walletId ?? NO_WALLET_VALUE,
    periodStart: entity?.periodStart ? toDateInputValue(entity.periodStart) : toDateInputValue(today.toISOString()),
    periodEnd: entity?.periodEnd ? toDateInputValue(entity.periodEnd) : toDateInputValue(defaultEnd.toISOString()),
    notes: entity?.notes ?? "",
  }
}

function BudgetFormDialog({ wallets, mode, initialBudget, onSubmit, children }: BudgetFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => createBudgetFormState(initialBudget))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(createBudgetFormState(initialBudget))
    }
  }, [open, initialBudget])

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.limit || !form.periodStart || !form.periodEnd) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name,
        category: form.category,
        limit: Number(form.limit),
        walletId: form.walletId === NO_WALLET_VALUE ? undefined : form.walletId,
        periodStart: new Date(form.periodStart).toISOString(),
        periodEnd: new Date(form.periodEnd).toISOString(),
        notes: form.notes || undefined,
      })
      if (mode === "create") {
        setForm(createBudgetFormState())
      }
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled =
    !form.name || !form.category || !form.limit || !form.periodStart || !form.periodEnd || Number(form.limit) <= 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            {mode === "create" ? "Create budget" : "Edit budget"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create budget" : "Update budget"}</DialogTitle>
          <DialogDescription>Set limits for a category and date range.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                min="0"
                value={form.limit}
                onChange={(event) => setForm({ ...form, limit: event.target.value })}
              />
            </div>
            <div>
              <Label>Wallet</Label>
              <Select value={form.walletId} onValueChange={(value) => setForm({ ...form, walletId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="No wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_WALLET_VALUE}>No wallet</SelectItem>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet._id} value={wallet._id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Period start</Label>
              <Input
                type="date"
                value={form.periodStart}
                onChange={(event) => setForm({ ...form, periodStart: event.target.value })}
              />
            </div>
            <div>
              <Label>Period end</Label>
              <Input
                type="date"
                value={form.periodEnd}
                min={form.periodStart}
                onChange={(event) => setForm({ ...form, periodEnd: event.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional context"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setForm(createBudgetFormState(initialBudget))} disabled={submitting}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || disabled}>
            {submitting ? "Saving..." : mode === "create" ? "Save budget" : "Update budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type BudgetsPanelProps = {
  budgets: BudgetWithUsage[]
  wallets: Wallet[]
  onCreate: (payload: BudgetPayload) => Promise<void>
  onEdit: (id: string, payload: Partial<BudgetPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function BudgetsPanel({ budgets, wallets, onCreate, onEdit, onDelete }: BudgetsPanelProps) {
  return (
    <Card className="shadow-brutal border-4 border-border">
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>Monitor envelopes and tweak them in real time</CardDescription>
        </div>
        <BudgetFormDialog wallets={wallets} mode="create" onSubmit={onCreate}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New budget
          </Button>
        </BudgetFormDialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {budgets.length === 0 ? (
          <p className="text-sm font-semibold text-muted-foreground">No budgets yet. Create one to keep spending in check.</p>
        ) : (
          budgets.map((entry) => {
            const { budget, spent, remaining, utilization } = entry
            const statusColor =
              utilization > 100 ? "bg-destructive" : utilization > 80 ? "bg-amber-500" : "bg-primary"

            return (
              <div key={budget._id} className="rounded-lg border-2 border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase">{budget.name}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{budget.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{formatCurrency(spent)}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{formatCurrency(budget.limit)} limit</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-muted">
                  <div className={`h-full ${statusColor}`} style={{ width: `${Math.min(utilization, 130)}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                  <span>{formatCurrency(remaining)} remaining</span>
                  <span>
                    {new Date(budget.periodStart).toLocaleDateString()} – {new Date(budget.periodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <BudgetFormDialog
                    wallets={wallets}
                    mode="edit"
                    initialBudget={entry}
                    onSubmit={(payload) => onEdit(budget._id, payload)}
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  </BudgetFormDialog>
                  <ConfirmDeleteDialog
                    title="Delete budget"
                    description={`This will remove ${budget.name}.`}
                    onConfirm={() => onDelete(budget._id)}
                  >
                    <Button variant="destructive" size="sm" className="gap-1">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </ConfirmDeleteDialog>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

type GoalsPanelProps = {
  goals: Goal[]
  wallets: Wallet[]
  onCreate: (payload: GoalPayload) => Promise<void>
  onEdit: (id: string, payload: Partial<GoalPayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function GoalsPanel({ goals, wallets, onCreate, onEdit, onDelete }: GoalsPanelProps) {
  return (
    <Card className="shadow-brutal border-4 border-border">
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Goals</CardTitle>
          <CardDescription>Track longer-term targets and savings plans</CardDescription>
        </div>
        <GoalFormDialog wallets={wallets} mode="create" onSubmit={onCreate}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New goal
          </Button>
        </GoalFormDialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-sm font-semibold text-muted-foreground">Define a savings target to populate this view.</p>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            return (
              <div key={goal._id} className="rounded-lg border-2 border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase">{goal.name}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Target {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{progress.toFixed(0)}%</p>
                    <p className="text-xs font-semibold text-muted-foreground">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                  <span>{goal.deadline ? `Due ${new Date(goal.deadline).toLocaleDateString()}` : "No deadline"}</span>
                  <span>{goal.walletId ? wallets.find((wallet) => wallet._id === goal.walletId)?.name ?? "Wallet" : "No wallet"}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <GoalFormDialog
                    wallets={wallets}
                    mode="edit"
                    initialGoal={goal}
                    onSubmit={(payload) => onEdit(goal._id, payload)}
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  </GoalFormDialog>
                  <ConfirmDeleteDialog
                    title="Delete goal"
                    description={`This will remove ${goal.name}.`}
                    onConfirm={() => onDelete(goal._id)}
                  >
                    <Button variant="destructive" size="sm" className="gap-1">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </ConfirmDeleteDialog>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

type DashboardHeaderProps = {
  wallets: Wallet[]
  filters: DashboardFilters
  updateFilters: (next: Partial<DashboardFilters>) => void
  isLoading: boolean
}

function DashboardHeader({ wallets, filters, updateFilters, isLoading }: DashboardHeaderProps) {
  const [preset, setPreset] = useState<string>("30")

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const now = new Date()
    let from = new Date(now)
    if (value === "ytd") {
      from = new Date(now.getFullYear(), 0, 1)
    } else {
      const days = Number(value)
      from.setDate(from.getDate() - (Number.isNaN(days) ? 29 : days - 1))
    }
    updateFilters({ from: from.toISOString(), to: now.toISOString() })
  }

  return (
    <div className="shadow-brutal rounded-2xl border-4 border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="shadow-brutal border-4 border-primary bg-background p-2 transition-transform hover:-translate-y-1"
        >
          <Image src="/app-logo.png" alt="App Logo" width={72} height={72} className="object-contain" priority />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase">Expense Command Center</h1>
          <p className="text-sm font-semibold text-muted-foreground">Track, predict, and optimize your spending journey</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase">Wallet</Label>
          <Select
            value={filters.walletId ?? ALL_WALLETS_VALUE}
            onValueChange={(value) =>
              updateFilters({ walletId: value === ALL_WALLETS_VALUE ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All wallets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_WALLETS_VALUE}>All wallets</SelectItem>
              {wallets.map((wallet) => (
                <SelectItem key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase">Date range</Label>
          <Select value={preset} onValueChange={handlePresetChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rangePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase">From</Label>
          <Input
            type="date"
            value={toDateInputValue(filters.from)}
            onChange={(event) => {
              if (!event.target.value) return
              updateFilters({ from: new Date(event.target.value).toISOString() })
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase">To</Label>
          <Input
            type="date"
            value={toDateInputValue(filters.to)}
            max={toDateInputValue(new Date().toISOString())}
            onChange={(event) => {
              if (!event.target.value) return
              updateFilters({ to: new Date(event.target.value).toISOString() })
            }}
          />
        </div>
      </div>
    </div>
  )
}

function InsightGrid({ summary, expensesCount, isLoading }: { summary: ExpenseSummary | null; expensesCount: number; isLoading: boolean }) {
  const cards = [
    { label: "Total spend", value: summary ? formatCurrency(summary.totalAmount) : "--" },
    { label: "Average per day", value: summary ? formatCurrency(summary.averagePerDay) : "--" },
    { label: "Categories", value: summary ? summary.distinctCategories : "--" },
    { label: "Entries", value: expensesCount },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="shadow-brutal border-4 border-border">
          <CardContent className="p-4">
            <p className="text-xs font-black uppercase text-muted-foreground">{card.label}</p>
            <p className="text-3xl font-black">{isLoading ? "..." : card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TrendChartCard({ summary, isLoading }: { summary: ExpenseSummary | null; isLoading: boolean }) {
  const trend = summary?.trend || []

  return (
    <Card className="shadow-brutal border-4 border-border">
      <CardHeader>
        <CardTitle>Spending trend</CardTitle>
        <CardDescription>Daily totals within the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        {trend.length === 0 ? (
          <div className="py-12 text-center font-semibold text-muted-foreground">
            {isLoading ? "Loading trend..." : "Add expenses to build a trend"}
          </div>
        ) : (
          <ChartContainer className="h-72" config={{ spend: { label: "Spend", color: "#ef4444" } }}>
            <AreaChart data={trend} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
              <XAxis dataKey="date" hide tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis hide tickFormatter={(value) => formatCurrency(value)} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(value) => new Date(value).toLocaleDateString()} />}
              />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fill="#ef44444d" strokeWidth={3} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryBreakdownCard({
  categoryBreakdown,
  total,
  categoryColors,
  isLoading,
}: {
  categoryBreakdown: Array<{ category: string; total: number; percentage: number }>
  total: number
  categoryColors: Record<string, string>
  isLoading: boolean
}) {
  return (
    <Card className="shadow-brutal border-4 border-border">
      <CardHeader>
        <CardTitle>Category breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-3">
          {categoryBreakdown.length === 0 ? (
            <p className="font-semibold text-muted-foreground">
              {isLoading ? "Loading categories..." : "No expenses yet"}
            </p>
          ) : (
            categoryBreakdown.map((category) => (
              <div key={category.category} className="border-2 border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[category.category] || "📊"}</span>
                    <div>
                      <p className="text-sm font-black uppercase">{category.category}</p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="font-black">{formatCurrency(category.total)}</p>
                </div>
                <div className="mt-2 h-2 bg-muted">
                  <div
                    className="h-full"
                    style={{ width: `${category.percentage}%`, background: categoryColors[category.category] }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-center">
          {categoryBreakdown.length > 0 && (
            <div className="w-full max-w-[240px]">
              <ChartContainer className="h-64" config={{}}>
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.category} fill={categoryColors[entry.category]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          )}
          {categoryBreakdown.length === 0 && <span className="text-muted-foreground">{isLoading ? "Preparing chart" : "Add data"}</span>}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs font-semibold text-muted-foreground">Tracking {categoryBreakdown.length} categories • Total {formatCurrency(total)}</p>
      </CardFooter>
    </Card>
  )
}

type BudgetGoalOverviewProps = {
  budgets: BudgetWithUsage[]
  goals: Goal[]
  wallets: Wallet[]
  isLoading: boolean
  onCreateBudget: (payload: BudgetPayload) => Promise<void>
  onCreateGoal: (payload: GoalPayload) => Promise<void>
}

function BudgetGoalOverview({ budgets, goals, wallets, isLoading, onCreateBudget, onCreateGoal }: BudgetGoalOverviewProps) {
  const budgetChartData = useMemo(
    () =>
      budgets.slice(0, 6).map(({ budget, spent }) => ({
        name: budget.name,
        spent,
        limit: budget.limit,
        remaining: Math.max(budget.limit - spent, 0),
      })),
    [budgets]
  )

  const goalChartData = useMemo(
    () =>
      goals.slice(0, 6).map((goal) => ({
        name: goal.name,
        progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        target: goal.targetAmount,
      })),
    [goals]
  )

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="shadow-brutal border-4 border-border xl:col-span-3">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5" /> Budget health
            </CardTitle>
            <CardDescription>Top envelopes with utilization and burn rate</CardDescription>
          </div>
          <BudgetFormDialog wallets={wallets} mode="create" onSubmit={onCreateBudget}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New budget
            </Button>
          </BudgetFormDialog>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {budgets.length === 0 ? (
              <p className="text-sm font-semibold text-muted-foreground">
                {isLoading ? "Loading budgets..." : "Create a budget to get started"}
              </p>
            ) : (
              budgets.slice(0, 4).map(({ budget, utilization, remaining, spent }) => (
                <div key={budget._id} className="border-2 border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase">{budget.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{budget.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">{formatCurrency(spent)}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{formatCurrency(remaining)} left</p>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-muted">
                    <div
                      className={`h-full ${utilization > 100 ? "bg-destructive" : utilization > 80 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(utilization, 130)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-lg border border-dashed p-3">
            {budgetChartData.length === 0 ? (
              <p className="text-center font-semibold text-muted-foreground">No utilization data yet</p>
            ) : (
              <ChartContainer className="h-72" config={{ limit: { label: "Limit" }, spent: { label: "Spent" } }}>
                <BarChart data={budgetChartData} margin={{ left: 16, right: 16, top: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="limit" stackId="a" fill="#facc15" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-brutal border-4 border-border xl:col-span-2">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5" /> Goals progress
              </CardTitle>
              <CardDescription>Track how quickly targets are closing</CardDescription>
            </div>
            <GoalFormDialog wallets={wallets} mode="create" onSubmit={onCreateGoal}>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                New goal
              </Button>
            </GoalFormDialog>
          </div>
        </CardHeader>
        <CardContent>
          {goalChartData.length === 0 ? (
            <p className="text-sm font-semibold text-muted-foreground">
              {isLoading ? "Loading goals..." : "Create a goal to visualize progress"}
            </p>
          ) : (
            <div className="space-y-4">
              <ChartContainer className="h-64" config={{ progress: { label: "Progress" } }}>
                <RadialBarChart
                  data={goalChartData}
                  innerRadius="20%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="progress" background cornerRadius={4} fill="#3b82f6" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => `${(value as number).toFixed(0)}% ● ${props?.payload?.target ? formatCurrency(props.payload.target) : ""}`}
                      />
                    }
                  />
                </RadialBarChart>
              </ChartContainer>
              <div className="space-y-2">
                {goalChartData.map((goal) => (
                  <div key={goal.name} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-black uppercase">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">Target {formatCurrency(goal.target)}</p>
                    </div>
                    <p className="text-sm font-black">{goal.progress.toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


type GoalFormDialogProps = {
  wallets: Wallet[]
  mode: "create" | "edit"
  initialGoal?: Goal
  onSubmit: (payload: GoalPayload) => Promise<void>
  children?: ReactNode
}

const createGoalFormState = (goal?: Goal) => ({
  name: goal?.name ?? "",
  targetAmount: goal ? String(goal.targetAmount) : "",
  currentAmount: goal?.currentAmount ? String(goal.currentAmount) : "",
  walletId: goal?.walletId ?? NO_WALLET_VALUE,
  deadline: goal?.deadline ? toDateInputValue(goal.deadline) : "",
  description: goal?.description ?? "",
})

function GoalFormDialog({ wallets, mode, initialGoal, onSubmit, children }: GoalFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => createGoalFormState(initialGoal))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(createGoalFormState(initialGoal))
    }
  }, [open, initialGoal])

  const handleSubmit = async () => {
    if (!form.name || !form.targetAmount) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: form.currentAmount ? Number(form.currentAmount) : undefined,
        walletId: form.walletId === NO_WALLET_VALUE ? undefined : form.walletId,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        description: form.description || undefined,
      })
      if (mode === "create") {
        setForm(createGoalFormState())
      }
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = !form.name || !form.targetAmount || Number(form.targetAmount) <= 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            {mode === "create" ? "Create goal" : "Edit goal"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create goal" : "Update goal"}</DialogTitle>
          <DialogDescription>Track savings or payoff milestones.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Target amount</Label>
              <Input
                type="number"
                min="0"
                value={form.targetAmount}
                onChange={(event) => setForm({ ...form, targetAmount: event.target.value })}
              />
            </div>
            <div>
              <Label>Current amount</Label>
              <Input
                type="number"
                min="0"
                value={form.currentAmount}
                onChange={(event) => setForm({ ...form, currentAmount: event.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Wallet</Label>
            <Select value={form.walletId} onValueChange={(value) => setForm({ ...form, walletId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="No wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_WALLET_VALUE}>No wallet</SelectItem>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet._id} value={wallet._id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Optional details"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setForm(createGoalFormState(initialGoal))} disabled={submitting}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || disabled}>
            {submitting ? "Saving..." : mode === "create" ? "Save goal" : "Update goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ConfirmDeleteDialogProps = {
  title: string
  description: string
  onConfirm: () => Promise<void>
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
}

function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  children,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setLoading(false)
        }
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={loading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? "Deleting..." : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type TransactionsPanelProps = {
  expenses: Expense[]
  filters: DashboardFilters
  updateFilters: (next: Partial<DashboardFilters>) => void
  onCreate: (payload: ExpensePayload) => Promise<void>
  onEdit: (id: string, payload: Partial<ExpensePayload>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  categories: string[]
  isLoading: boolean
}

function TransactionsPanel({
  expenses,
  filters,
  updateFilters,
  onCreate,
  onEdit,
  onDelete,
  categories,
  isLoading,
}: TransactionsPanelProps) {
  return (
    <Card className="shadow-brutal border-4 border-border">
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Search, add, and maintain your ledger</CardDescription>
        </div>
        <ExpenseFormDialog categories={categories} mode="create" onSubmit={onCreate}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add expense
          </Button>
        </ExpenseFormDialog>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <Label className="text-xs font-black uppercase">Search</Label>
            <Input
              placeholder="coffee, gym, ..."
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs font-black uppercase">Category</Label>
            <Select
              value={filters.categories[0] || ALL_CATEGORIES_VALUE}
              onValueChange={(value) =>
                updateFilters({ categories: value === ALL_CATEGORIES_VALUE ? [] : [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-black uppercase">Sort</Label>
            <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value as 'asc' | 'desc' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden border-4 border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/70">
                <TableHead className="font-black uppercase">Date</TableHead>
                <TableHead className="font-black uppercase">Name</TableHead>
                <TableHead className="font-black uppercase">Category</TableHead>
                <TableHead className="text-right font-black uppercase">Amount</TableHead>
                <TableHead className="w-[150px] text-right font-black uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-semibold">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-semibold text-muted-foreground">
                    No transactions match your filters
                  </TableCell>
                </TableRow>
              ) : (
                expenses.slice(0, 50).map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{expense.name}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right font-black">
                      {formatCurrency(expense.amount, expense.currency || "USD")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <ExpenseFormDialog
                          categories={categories}
                          mode="edit"
                          initialExpense={expense}
                          onSubmit={(payload) => onEdit(expense._id, payload)}
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                        </ExpenseFormDialog>
                        <ConfirmDeleteDialog
                          title="Delete expense"
                          description={`This will permanently remove ${expense.name}.`}
                          onConfirm={() => onDelete(expense._id)}
                        >
                          <Button variant="destructive" size="sm" className="gap-1">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </ConfirmDeleteDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Showing up to 50 results. Refine filters for more.</p>
      </CardContent>
    </Card>
  )
}

type ExpenseFormDialogProps = {
  categories: string[]
  mode: "create" | "edit"
  initialExpense?: Expense
  onSubmit: (payload: ExpensePayload) => Promise<void>
  children?: ReactNode
}

const createExpenseFormState = (expense?: Expense) => ({
  name: expense?.name ?? "",
  amount: expense ? String(expense.amount) : "",
  category: expense?.category ?? "",
  date: expense ? toDateInputValue(expense.date) : new Date().toISOString().slice(0, 10),
  note: expense?.note ?? "",
  tags: expense?.tags?.join(", ") ?? "",
})

function ExpenseFormDialog({ categories, mode, initialExpense, onSubmit, children }: ExpenseFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => createExpenseFormState(initialExpense))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(createExpenseFormState(initialExpense))
    }
  }, [open, initialExpense])

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.category) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name,
        amount: Number(form.amount),
        category: form.category,
        date: new Date(form.date).toISOString(),
        note: form.note || undefined,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      })
      if (mode === "create") {
        setForm(createExpenseFormState())
      }
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const disabled = !form.name || !form.amount || Number(form.amount) <= 0 || !form.category
  const triggerLabel = mode === "create" ? "Add expense" : "Edit expense"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add expense" : "Edit expense"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Capture purchases with full context." : "Update the record and keep the audit trail clean."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                max={toDateInputValue(new Date().toISOString())}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                placeholder="travel, tax, ..."
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
              />
              <p className="text-[10px] font-semibold text-muted-foreground">Comma separated</p>
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea
              placeholder="Optional details"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setForm(createExpenseFormState(initialExpense))} disabled={submitting}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || disabled}>
            {submitting ? "Saving..." : mode === "create" ? "Save expense" : "Update expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
