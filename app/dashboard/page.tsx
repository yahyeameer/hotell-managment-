"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BedDouble, Users, CreditCard, TrendingUp } from "lucide-react";
import { useHotel, PAYMENT_METHODS } from "@/app/context/HotelContext";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function DashboardPage() {
  const { 
    hotelName, rooms, bookings, expenses, guests, 
    formatCurrency, exchangeRate, setExchangeRate, toUSD,
    currentUserRole, setCurrentUserRole
  } = useHotel();

  const totalRevenue = bookings.reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + toUSD(e.amount, e.currency), 0);
  const netProfit = totalRevenue - totalExpenses;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const activeGuests = guests.length;

  // Payment method analytics
  const paymentBreakdown = PAYMENT_METHODS.map(pm => {
    const total = bookings
      .filter(b => b.paymentMethod === pm.id)
      .reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0);
    const count = bookings.filter(b => b.paymentMethod === pm.id).length;
    return { name: pm.label, value: Math.round(total), count, color: pm.color, icon: pm.icon };
  }).filter(d => d.count > 0);

  // Daily revenue for last 7 days (mock from bookings dates)
  const revenueByDay = (() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en', { weekday: 'short' });
      days[key] = 0;
    }
    bookings.forEach(b => {
      const d = new Date(b.checkIn);
      const key = d.toLocaleDateString('en', { weekday: 'short' });
      if (key in days) {
        days[key] += toUSD(b.amount, b.currency);
      }
    });
    return Object.entries(days).map(([day, amount]) => ({ day, amount: Math.round(amount) }));
  })();

  // Room status data for pie
  const roomStatusData = [
    { name: "Bannaan", value: rooms.filter(r => r.status === "Available").length, color: "#22c55e" },
    { name: "La Deggan Yahay", value: rooms.filter(r => r.status === "Occupied").length, color: "#ef4444" },
    { name: "Ciladaysan", value: rooms.filter(r => r.status === "Maintenance").length, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header + Exchange Rate */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Muraayadda
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Ku soo dhawoow {hotelName}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs">
            $1 =
          </Badge>
          <Input
            type="number"
            value={exchangeRate}
            onChange={e => setExchangeRate(Number(e.target.value) || 0)}
            className="w-20 sm:w-24 h-8 text-xs bg-muted/40 border-border text-foreground text-center"
          />
          <span className="text-xs text-muted-foreground hidden sm:inline">SOS</span>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <Badge 
            variant="outline" 
            className={`cursor-pointer px-3 py-1.5 transition-colors ${currentUserRole === 'Admin' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-muted text-muted-foreground'}`}
            onClick={() => setCurrentUserRole(currentUserRole === 'Admin' ? 'Staff' : 'Admin')}
          >
            {currentUserRole} Muuqaal
          </Badge>
        </div>
      </motion.div>

      {/* Stat Cards - Horizontal scroll on mobile, Grid on desktop */}
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-3 pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 -mx-3 px-3 sm:mx-0 sm:px-0 w-[calc(100%+1.5rem)] sm:w-full">
        {[
          { title: "Dakhliga", icon: CreditCard, value: formatCurrency(totalRevenue), sub: `${(totalRevenue * exchangeRate).toLocaleString()} SOS`, color: "text-primary", bg: "bg-primary/10" },
          { title: "Martida", icon: Users, value: activeGuests.toString(), sub: "Wadarta la diiwaan geliyay", color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Buuxinta", icon: BedDouble, value: `${occupancyRate}%`, sub: `${occupiedRooms}/${rooms.length} qol`, color: "text-primary", bg: "bg-primary/10", progress: true },
          { title: "Macaashka", icon: TrendingUp, value: formatCurrency(netProfit), sub: netProfit >= 0 ? "Faa'iido" : "Khasaare", color: netProfit >= 0 ? "text-primary" : "text-destructive", bg: netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10", adminOnly: true }
        ].filter(stat => !(stat.adminOnly && currentUserRole === 'Staff')).map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="snap-start shrink-0 w-[260px] sm:w-auto sm:shrink sm:flex-1"
          >
            <Card className="glass border-border/50 bg-muted/20 overflow-hidden relative group shadow-lg hover:shadow-xl transition-shadow">
              <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="flex flex-row items-center justify-between pb-1 relative z-10">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                  {stat.sub}
                </div>
                {stat.progress && (
                  <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${occupancyRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row - Hidden for Staff */}
      {currentUserRole === 'Admin' && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Methods Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/50 bg-muted/20 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full" />
                  Habka Lacag Bixinta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentBreakdown.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie
                            data={paymentBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="85%"
                            dataKey="value"
                            strokeWidth={2}
                            stroke="hsl(var(--background))"
                          >
                            {paymentBreakdown.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                            formatter={(value) => [`$${value}`, 'Dakhli']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {paymentBreakdown.map((pm, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                            <span className="text-xs text-foreground truncate">{pm.icon} {pm.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-foreground">${pm.value}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">({pm.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">
                    Wali ma jiraan bukaynno. Samee mid si aad u aragto falanqeynta.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Revenue Bar Chart */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/50 bg-muted/20 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full" />
                  Dakhliga Usbuuca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-44 sm:h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={revenueByDay} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip 
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                        formatter={(value) => [`$${value}`, 'Dakhli']}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Bottom Row: Recent Bookings + Room Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="glass border-border/50 bg-muted/20 h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full" /> Bukaynaha Dhowaa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking, i) => {
                  const pm = PAYMENT_METHODS.find(p => p.id === booking.paymentMethod);
                  return (
                    <motion.div 
                      key={booking.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {booking.guest.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{booking.guest}</p>
                          <p className="text-xs text-muted-foreground">
                            Qol {booking.room} · {pm?.icon} {pm?.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm font-bold text-foreground">${toUSD(booking.amount, booking.currency).toFixed(0)}</p>
                        <Badge variant="outline" className={`text-[10px] ${booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary'}`}>
                          {booking.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
                {bookings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Wali lama helin bukayn dhow.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="glass border-border/50 bg-muted/20 h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" /> Xaaladda Qolalka
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomStatusData.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={roomStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius="50%"
                          outerRadius="80%"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="hsl(var(--background))"
                        >
                          {roomStatusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2">
                    {roomStatusData.map((status, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                          <span className="text-xs text-foreground">{status.name}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{status.value} qol</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-36 flex items-center justify-center text-muted-foreground text-sm">
                  Kudar qolal si aad u aragto xaaladda.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
