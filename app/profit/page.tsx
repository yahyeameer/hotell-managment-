"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { useHotel } from "@/app/context/HotelContext";

export default function ProfitPage() {
  const { bookings, expenses, formatCurrency, exchangeRate } = useHotel();

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const expensePercentage = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Profit & Loss</h2>
          <p className="text-muted-foreground text-sm">Financial performance and net profit overview.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Revenue</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <div className="mt-2 text-sm font-medium text-secondary">
              {(totalRevenue * exchangeRate).toLocaleString()} SOS
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Total Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
            <div className="mt-2 text-sm font-medium text-secondary">
              {(totalExpenses * exchangeRate).toLocaleString()} SOS
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Net Profit</CardTitle>
            <DollarSign className="w-4 h-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="mt-2 text-sm font-medium text-secondary">
              {(netProfit * exchangeRate).toLocaleString()} SOS
            </div>
            {totalRevenue > 0 && (
              <>
                <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${margin}%` }}></div>
                  <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${expensePercentage}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Margin: {margin}%</span>
                  <span>Expenses: {expensePercentage}%</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border bg-muted/20">
        <CardHeader>
          <CardTitle className="text-foreground">Cashflow Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Connect to Supabase for historical charting</p>
              <div className="flex items-end justify-center gap-2 h-32 mt-6">
                <div className="w-8 bg-primary/40 rounded-t" style={{ height: "40%" }}></div>
                <div className="w-8 bg-primary/60 rounded-t" style={{ height: "60%" }}></div>
                <div className="w-8 bg-primary/80 rounded-t" style={{ height: "85%" }}></div>
                <div className="w-8 bg-primary rounded-t" style={{ height: "100%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
