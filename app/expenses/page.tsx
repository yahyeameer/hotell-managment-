"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useHotel, Expense } from "@/app/context/HotelContext";

export default function ExpensesPage() {
  const { expenses, addExpense, formatCurrency } = useHotel();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [amount, setAmount] = useState("");

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Find highest category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const highestCategory = Object.keys(categoryTotals).length > 0 
    ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
    : "None";

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExpense: Expense = {
      id: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      date,
      description,
      category,
      amount: parseFloat(amount)
    };

    addExpense(newExpense);
    
    setOpen(false);
    setDate("");
    setDescription("");
    setCategory("Utilities");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Expenses Tracking</h2>
          <p className="text-muted-foreground text-sm">Monitor daily hotel operations costs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-primary text-black hover:bg-primary/90 font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> Record Expense
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  placeholder="e.g. Plumbing repairs"
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v ?? "Utilities")}>
                    <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input 
                    id="amount" 
                    type="number"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    required 
                    placeholder="0.00"
                    className="bg-muted/40 border-border focus-visible:ring-primary/50"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90">
                Save Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="glass p-4 rounded-xl border border-border bg-muted/20">
          <h3 className="text-sm text-muted-foreground mb-1">Total This Month</h3>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalThisMonth)}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-border bg-muted/20">
          <h3 className="text-sm text-muted-foreground mb-1">Highest Category</h3>
          <p className="text-2xl font-bold text-foreground">{highestCategory}</p>
        </div>
        <div className="glass p-4 rounded-xl border border-border bg-muted/20">
          <h3 className="text-sm text-muted-foreground mb-1">Pending Approval</h3>
          <p className="text-2xl font-bold text-secondary">0</p>
        </div>
      </div>

      <div className="glass border border-border bg-muted/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search expenses..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" 
            />
          </div>
        </div>

        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="border-border hover:bg-white/5">
                  <TableCell className="text-muted-foreground whitespace-nowrap">{expense.date}</TableCell>
                  <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/5 text-foreground border-border">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No expenses recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
