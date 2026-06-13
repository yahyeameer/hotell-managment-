"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, DollarSign, Coins } from "lucide-react";
import { useHotel, Expense, PAYMENT_METHODS, PaymentMethodId } from "@/app/context/HotelContext";

export default function ExpensesPage() {
  const { expenses, addExpense, formatCurrency, formatAmount, toUSD, exchangeRate } = useHotel();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cash_usd");
  const [expenseCurrency, setExpenseCurrency] = useState<"USD" | "SOS">("USD");

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((sum, e) => sum + toUSD(e.amount, e.currency), 0);

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + toUSD(curr.amount, curr.currency);
    return acc;
  }, {} as Record<string, number>);
  
  const highestCategory = Object.keys(categoryTotals).length > 0 
    ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
    : "Midna";

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExpense: Expense = {
      id: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      date,
      description,
      category,
      amount: parseFloat(amount),
      paymentMethod,
      currency: expenseCurrency
    };

    addExpense(newExpense);
    setOpen(false);
    setDate("");
    setDescription("");
    setCategory("Utilities");
    setAmount("");
    setPaymentMethod("cash_usd");
    setExpenseCurrency("USD");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Kharashaadka</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">La soco kharashaadka maalinlaha ah ee huteelka.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> Diiwaangeli Kharash
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Diiwaangeli Kharash Cusub</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Taariikhda</Label>
                <Input 
                  id="date" type="date" value={date} 
                  onChange={e => setDate(e.target.value)} required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Faahfaahin</Label>
                <Input 
                  id="description" value={description} 
                  onChange={e => setDescription(e.target.value)} required placeholder="tusaale. Dayactirka dhuumaha"
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Nooca</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v ?? "Utilities")}>
                    <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                      <SelectValue placeholder="Nooca" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border text-foreground">
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Food">Food & Beverage</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Qadarka</Label>
                  <Input 
                    id="amount" type="number" value={amount} 
                    onChange={e => setAmount(e.target.value)} required placeholder="0.00"
                    className="bg-muted/40 border-border focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Habka Lacag Bixinta</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id} type="button"
                      onClick={() => {
                        setPaymentMethod(pm.id);
                        if (pm.id === "cash_sos") setExpenseCurrency("SOS");
                        else if (pm.id === "cash_usd") setExpenseCurrency("USD");
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all duration-300 active:scale-95 ${
                        paymentMethod === pm.id 
                          ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(202,138,4,0.1)] drop-shadow-sm" 
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:border-border"
                      }`}
                    >
                      <span className={paymentMethod === pm.id ? "drop-shadow-[0_0_8px_rgba(202,138,4,0.5)] transition-all" : ""}>{pm.icon}</span>
                      <span className="truncate w-full text-center text-[10px]">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="grid grid-cols-2 gap-2">
                {(["USD", "SOS"] as const).map(cur => (
                  <button
                    key={cur} type="button"
                    onClick={() => setExpenseCurrency(cur)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-300 active:scale-95 ${
                      expenseCurrency === cur
                        ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(202,138,4,0.1)]"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {cur === "USD" ? <DollarSign className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                    {cur}
                  </button>
                ))}
              </div>

              <Button type="submit" className="w-full">
                Keydi Kharashka
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Wadarta Bishan</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{formatCurrency(totalThisMonth)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{(totalThisMonth * exchangeRate).toLocaleString()} SOS</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Nooca Ugu Badan</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{highestCategory}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{formatCurrency(categoryTotals[highestCategory] || 0)}</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 col-span-2 md:col-span-1 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Wadarta Diiwaanka</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{expenses.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{Object.keys(categoryTotals).length} nooc</p>
        </div>
      </div>

      <div className="glass border border-border/50 bg-muted/20 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Raadi kharashaadka..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" 
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredExpenses.map((expense) => {
            const pm = PAYMENT_METHODS.find(p => p.id === expense.paymentMethod);
            return (
              <div key={expense.id} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{expense.date}</span>
                      <Badge variant="outline" className="bg-white/5 text-foreground border-border text-[10px] px-1.5 py-0">
                        {expense.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs">{pm?.icon}</span>
                      <span className="text-[10px] text-muted-foreground">{pm?.label}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-destructive shrink-0 ml-3">
                    {formatAmount(expense.amount, expense.currency)}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Wali wax kharash ah lama diiwaangelin.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Taariikhda</TableHead>
                <TableHead className="text-muted-foreground">Faahfaahin</TableHead>
                <TableHead className="text-muted-foreground">Nooca</TableHead>
                <TableHead className="text-muted-foreground">Lacag Bixinta</TableHead>
                <TableHead className="text-muted-foreground text-right">Qadarka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => {
                const pm = PAYMENT_METHODS.find(p => p.id === expense.paymentMethod);
                return (
                  <TableRow key={expense.id} className="border-border hover:bg-white/5">
                    <TableCell className="text-muted-foreground whitespace-nowrap">{expense.date}</TableCell>
                    <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white/5 text-foreground border-border">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span>{pm?.icon}</span>
                        <span className="text-foreground">{pm?.label}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      {formatAmount(expense.amount, expense.currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Wali wax kharash ah lama diiwaangelin.
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
