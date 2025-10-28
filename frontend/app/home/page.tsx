"use client"

import { useState, useMemo, useEffect, ChangeEvent } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ChartTooltipContent, ChartTooltip, ChartContainer } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { addExpensesAPI, fetchExpensesAPI } from "@/api/expensesapi"

interface Expense {
  _id?: string
  id?: number
  name: string
  amount: number
  category: string
}

interface NewExpense {
  name: string
  amount: string
  category: string
}

const categoryConfig = {
  Housing: { icon: "", color: "oklch(0.65 0.24 26.92)" },
  Food: { icon: "", color: "oklch(0.97 0.21 109.74)" },
  Transportation: { icon: "", color: "oklch(0.56 0.24 260.83)" },
  Utilities: { icon: "", color: "oklch(0.73 0.25 142.50)" },
  Entertainment: { icon: "", color: "oklch(0.59 0.27 328.36)" },
  Other: { icon: "", color: "oklch(0.50 0.15 200)" },
}

export default function Component() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState<NewExpense>({
    name: "",
    amount: "",
    category: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetchExpensesAPI()
        setExpenses(response.data)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchExpenses()
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewExpense({
      ...newExpense,
      [e.target.id]: e.target.value,
    })
  }

  const handleAddExpense = async () => {
    if (newExpense.name && newExpense.amount && newExpense.category) {
      setIsAdding(true)
      const optimisticExpense = {
        id: expenses.length + 1,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
      }

      setExpenses([...expenses, optimisticExpense])

      try {
        await addExpensesAPI(newExpense.name, parseFloat(newExpense.amount), newExpense.category)
      } catch (error) {
        console.error("Error adding expense:", error)
        setExpenses(expenses.filter(e => e.id !== optimisticExpense.id))
      } finally {
        setIsAdding(false)
        setNewExpense({
          name: "",
          amount: "",
          category: "",
        })
      }
    }
  }

  const expensesByCategory = useMemo(() => {
    return expenses.reduce<{ [key: string]: { name: string; amount: number } }>((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          name: expense.category,
          amount: 0,
        }
      }
      acc[expense.category].amount += expense.amount
      return acc
    }, {})
  }, [expenses])

  const categoriesData = useMemo(() => {
    return Object.values(expensesByCategory)
  }, [expensesByCategory])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  const categoryColors = useMemo(() => {
    const colors: { [key: string]: string } = {}
    categoriesData.forEach((category) => {
      colors[category.name] = categoryConfig[category.name as keyof typeof categoryConfig]?.color || "oklch(0.50 0.15 200)"
    })
    return colors
  }, [categoriesData])

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Top bar: logo left, theme right */}
      <div className="mb-4 flex items-center justify-between gap-6">
        <Link href="/" className="border-4 border-primary shadow-brutal rounded-none bg-background flex items-center hover:scale-105 transition-transform" title="Go to Home">
          <img
            src="/app-logo.png"
            alt="App Logo"
            width={84}
            height={84}
            className="object-contain"
            loading="eager"
          />
        </Link>
        {/* Headline below top bar */}
        <div className="mb-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-2">Expense Dashboard</h1>
          <p className="text-lg font-bold text-muted-foreground">Track your spending</p>
        </div>
        <div className="flex-1" />
        <ThemeToggle />
      </div>

      {/* Desktop Stats - 3 columns */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-primary">
          <CardContent className="p-6">
            <div className="text-sm font-black uppercase text-primary-foreground/80 mb-2">Total</div>
            <div className="text-4xl font-black text-primary-foreground">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-accent">
          <CardContent className="p-6">
            <div className="text-sm font-black uppercase text-accent-foreground/80 mb-2">Categories</div>
            <div className="text-4xl font-black text-accent-foreground">{categoriesData.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardContent className="p-6">
            <div className="text-sm font-black uppercase text-secondary-foreground/80 mb-2">Entries</div>
            <div className="text-4xl font-black text-secondary-foreground">{expenses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Desktop Grid - 2 columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Add Expense Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-black uppercase text-xs">Name</Label>
                  <Input
                    id="name"
                    placeholder="Expense name"
                    value={newExpense.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-black uppercase text-xs">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="font-black uppercase text-xs">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, { icon }]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span className="font-bold">{key}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAddExpense}
                disabled={isAdding || !newExpense.name || !newExpense.amount || !newExpense.category}
                className="w-full"
              >
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </CardFooter>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesData.length > 0 ? (
                <div className="space-y-3">
                  {categoriesData.map((category) => {
                    const percentageNumber = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
                    const percentage = Math.round(percentageNumber)
                    const config = categoryConfig[category.name as keyof typeof categoryConfig]

                    return (
                      <div
                        key={category.name}
                        className="p-3 border-2 border-border shadow-sm hover:translate-x-1 hover:translate-y-1 transition-all"
                        style={{ borderLeft: `8px solid ${categoryColors[category.name]}` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{config?.icon || "📦"}</div>
                            <div>
                              <div className="font-black uppercase text-sm">{category.name}</div>
                              <div className="text-xs font-bold text-muted-foreground">{percentage}%</div>
                            </div>
                          </div>
                          <div className="font-black text-lg">${category.amount.toFixed(2)}</div>
                        </div>
                        <div className="mt-2 h-3 bg-muted border-2 border-border">
                          <div
                            className="h-full"
                            style={{ width: `${percentage}%`, background: categoryColors[category.name] }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="font-bold text-muted-foreground">No data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {categoriesData.length > 0 ? (
                <PiechartcustomChart data={categoriesData} categoryColors={categoryColors} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="font-bold text-muted-foreground">Add expenses to see chart</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <div className="border-4 border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-black uppercase text-xs">Item</TableHead>
                        <TableHead className="text-right font-black uppercase text-xs">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.slice(-5).reverse().map((expense) => {
                        const config = categoryConfig[expense.category as keyof typeof categoryConfig]

                        return (
                          <TableRow key={expense._id || expense.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{config?.icon || "📦"}</span>
                                <span className="font-bold">{expense.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-black text-lg">
                              ${expense.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💸</div>
                  <p className="font-bold text-muted-foreground">No expenses yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Stats (shown only on mobile) */}
      <div className="grid grid-cols-3 gap-4 lg:hidden mb-6">
        <Card className="bg-primary">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-primary-foreground">${totalExpenses.toFixed(0)}</div>
            <div className="text-xs font-bold text-primary-foreground/80">Total</div>
          </CardContent>
        </Card>

        <Card className="bg-accent">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-accent-foreground">{categoriesData.length}</div>
            <div className="text-xs font-bold text-accent-foreground/80">Categories</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardContent className="p-4">
            <div className="text-2xl font-black text-secondary-foreground">{expenses.length}</div>
            <div className="text-xs font-bold text-secondary-foreground/80">Entries</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PiechartcustomChart({ data, categoryColors }: { data: { name: string; amount: number }[]; categoryColors: { [key: string]: string } }) {
  return (
    <div className="w-full max-w-[280px]">
      <ChartContainer config={{}}>
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            strokeWidth={4}
            stroke="oklch(0 0 0)"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColors[entry.name]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}
