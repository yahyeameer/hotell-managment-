"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BedDouble, CreditCard, Users, ArrowDownRight, Plus } from "lucide-react";
import { useHotel } from "@/app/context/HotelContext";

export default function DashboardPage() {
  const { hotelName, currency, exchangeRate, formatCurrency, bookings, expenses, rooms, guests } = useHotel();

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeGuests = guests.length; // Approximate with guests
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;
  const maintenanceRooms = rooms.filter(r => r.status === "Maintenance").length;
  const occupancyRate = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm">Welcome back to {hotelName}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            Exchange Rate: $1 = {exchangeRate.toLocaleString()} SOS
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border bg-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <div className="mt-3 text-sm font-medium text-secondary">
              {(totalRevenue * exchangeRate).toLocaleString()} SOS
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Guests</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeGuests}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Total registered guests
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <BedDouble className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {occupiedRooms} of {rooms.length} rooms occupied
            </p>
            <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500" style={{ width: `${occupancyRate}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <CreditCard className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
            <div className="mt-3 text-sm font-medium text-secondary">
              {(totalExpenses * exchangeRate).toLocaleString()} SOS
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium shrink-0">
                      {booking.guest.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{booking.guest}</p>
                      <p className="text-xs text-muted-foreground">Room {booking.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(booking.amount)}</p>
                    </div>
                    <Badge variant="outline" className={
                      booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                      'bg-secondary/10 text-secondary border-secondary/20'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent bookings.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Room Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> Available
                </span>
                <span className="text-sm font-medium text-foreground">{availableRooms} Rooms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div> Occupied
                </span>
                <span className="text-sm font-medium text-foreground">{occupiedRooms} Rooms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div> Maintenance
                </span>
                <span className="text-sm font-medium text-foreground">{maintenanceRooms} Rooms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
