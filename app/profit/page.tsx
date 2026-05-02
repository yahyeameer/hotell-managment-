"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { useHotel, PAYMENT_METHODS } from "@/app/context/HotelContext";
import { motion } from "framer-motion";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ProfitPage() {
  const { bookings, expenses, formatCurrency, exchangeRate, toUSD } = useHotel();

  const totalRevenue = bookings.reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + toUSD(e.amount, e.currency), 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Revenue by payment method
  const revenueByMethod = PAYMENT_METHODS.map(pm => {
    const total = bookings
      .filter(b => b.paymentMethod === pm.id)
      .reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0);
    return { name: pm.label, value: Math.round(total), color: pm.color, icon: pm.icon };
  }).filter(d => d.value > 0);

  // Expenses by category
  const expensesByCategory = (() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + toUSD(e.amount, e.currency);
    });
    const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#06b6d4"];
    return Object.entries(cats).map(([name, value], i) => ({ 
      name, value: Math.round(value), color: colors[i % colors.length] 
    }));
  })();

  // Revenue vs Expenses comparison (by day of week from data)
  const comparisonData = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => {
      const rev = bookings
        .filter(b => {
          const d = new Date(b.checkIn);
          return d.toLocaleDateString('en', { weekday: 'short' }) === day;
        })
        .reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0);
      const exp = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.toLocaleDateString('en', { weekday: 'short' }) === day;
        })
        .reduce((sum, e) => sum + toUSD(e.amount, e.currency), 0);
      return { day, revenue: Math.round(rev), expenses: Math.round(exp) };
    });
  })();

  // Currency split
  const currencySplit = [
    { name: "USD", value: bookings.filter(b => b.currency === "USD").length, color: "#10b981" },
    { name: "SOS", value: bookings.filter(b => b.currency === "SOS").length, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const tooltipStyle = {
    contentStyle: { 
      background: 'hsl(var(--card))', 
      border: '1px solid hsl(var(--border))', 
      borderRadius: '10px', 
      fontSize: '12px', 
      color: 'hsl(var(--foreground))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Profit & Loss</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">Financial performance and payment analytics.</p>
      </motion.div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-primary">Revenue</CardTitle>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
              <div className="mt-1 text-[10px] sm:text-xs font-medium text-muted-foreground">
                {(totalRevenue * exchangeRate).toLocaleString()} SOS
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-destructive">Expenses</CardTitle>
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
              <div className="mt-1 text-[10px] sm:text-xs font-medium text-muted-foreground">
                {(totalExpenses * exchangeRate).toLocaleString()} SOS
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
          <Card className="glass border-border bg-muted/40 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-foreground">Net Profit</CardTitle>
              <DollarSign className="w-4 h-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg sm:text-xl md:text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(netProfit)}
              </div>
              <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${Math.max(margin, 0)}%` }} />
                <div className="h-full bg-destructive transition-all duration-700" style={{ width: `${100 - Math.max(margin, 0)}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Margin: {margin}%</span>
                <span>{(netProfit * exchangeRate).toLocaleString()} SOS</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue vs Expenses Area Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50 bg-muted/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-gradient-to-b from-primary to-destructive rounded-full" />
                Revenue vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={comparisonData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value}`, '']} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Payment Method */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50 bg-muted/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full" />
                Revenue by Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByMethod.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueByMethod} cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
                          {revenueByMethod.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value}`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {revenueByMethod.map((pm, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                          <span className="text-xs text-foreground truncate">{pm.icon} {pm.name}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">${pm.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">
                  No payment data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expenses by Category Bar */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50 bg-muted/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-destructive rounded-full" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesByCategory} layout="vertical" barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => [`$${value}`, 'Spent']} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {expensesByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No expense data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Currency Split + Summary */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-border/50 bg-muted/20 shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                Currency & Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currencySplit.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={currencySplit} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
                          {currencySplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5">
                    {currencySplit.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-foreground">{c.name}: {c.value} bookings</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Bookings</span>
                  <span className="font-bold text-foreground">{bookings.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="font-bold text-foreground">{expenses.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Paid Bookings</span>
                  <span className="font-bold text-primary">{bookings.filter(b => b.status === "Paid").length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pending Bookings</span>
                  <span className="font-bold text-secondary">{bookings.filter(b => b.status === "Pending").length}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-bold text-foreground">$1 = {exchangeRate.toLocaleString()} SOS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
