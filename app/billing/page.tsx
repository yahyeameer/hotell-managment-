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
import { useHotel, Booking, Guest, PAYMENT_METHODS, PaymentMethodId } from "@/app/context/HotelContext";

export default function BillingPage() {
  const { bookings, addBooking, rooms, formatCurrency, formatAmount, addGuest, toUSD } = useHotel();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("zaad");
  const [bookingCurrency, setBookingCurrency] = useState<"USD" | "SOS">("USD");

  const filteredBookings = bookings.filter(b => 
    b.guest.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    const room = rooms.find(r => r.id === roomId);
    const amount = room ? room.price * 2 : 100;

    const newBooking: Booking = {
      id: `BKG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      guest: guestName,
      room: roomId,
      checkIn,
      checkOut,
      amount,
      status: "Paid",
      paymentMethod,
      currency: bookingCurrency
    };

    addBooking(newBooking);
    
    const newGuest: Guest = {
      id: `GST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: guestName,
      phone: guestPhone || "-",
      email: "-",
      totalStays: 1,
      lifetimeValue: amount
    };
    addGuest(newGuest);

    setOpen(false);
    setGuestName("");
    setGuestPhone("");
    setRoomId("");
    setCheckIn("");
    setCheckOut("");
    setPaymentMethod("zaad");
    setBookingCurrency("USD");
  };

  const getPaymentLabel = (id: PaymentMethodId) => {
    return PAYMENT_METHODS.find(p => p.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Billing & Bookings</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Manage guest bookings, payments, and receipts.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-primary text-black hover:bg-primary/90 font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> New Booking
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBooking} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Guest Name</Label>
                <Input 
                  id="guestName" 
                  value={guestName} 
                  onChange={e => setGuestName(e.target.value)} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Guest Phone</Label>
                <Input 
                  id="guestPhone" 
                  type="tel"
                  value={guestPhone} 
                  onChange={e => setGuestPhone(e.target.value)} 
                  placeholder="e.g. +252 63 1234567"
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomId">Assign Room</Label>
                <Select value={roomId} onValueChange={(v) => setRoomId(v ?? "")}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue placeholder="Select available room" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    {rooms.filter(r => r.status === "Available").map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.id} - {room.type} (${room.price}/night)
                      </SelectItem>
                    ))}
                    {rooms.filter(r => r.status === "Available").length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No rooms available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input 
                    id="checkIn" 
                    type="date"
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input 
                    id="checkOut" 
                    type="date"
                    value={checkOut} 
                    onChange={e => setCheckOut(e.target.value)} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(pm.id);
                        if (pm.id === "cash_sos") setBookingCurrency("SOS");
                        else if (pm.id === "cash_usd") setBookingCurrency("USD");
                      }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${
                        paymentMethod === pm.id 
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.15)]" 
                          : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      <span className="truncate w-full text-center">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["USD", "SOS"] as const).map(cur => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setBookingCurrency(cur)}
                      className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        bookingCurrency === cur
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {cur === "USD" ? "💵 US Dollar" : "💰 Somali Shilling"}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={!roomId}>
                Confirm Booking
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Total Bookings</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{bookings.length}</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Total Revenue</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{formatCurrency(bookings.reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0))}</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 col-span-2 md:col-span-1 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Pending</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{bookings.filter(b => b.status === "Pending").length}</p>
        </div>
      </div>

      <div className="glass border border-border/50 bg-muted/20 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search bookings..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" 
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredBookings.map((booking) => {
            const pm = getPaymentLabel(booking.paymentMethod);
            return (
              <div key={booking.id} className="mobile-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA8A04] to-[#FCD34D] shadow-[0_0_10px_rgba(202,138,4,0.3)] flex items-center justify-center text-yellow-950 font-black shrink-0">
                      {booking.guest.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{booking.guest}</p>
                      <p className="text-xs text-muted-foreground">Room {booking.room}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-secondary/10 text-secondary border-secondary/20'
                  }>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{pm?.icon}</span>
                    <span className="text-xs text-muted-foreground">{pm?.label}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatAmount(booking.amount, booking.currency)}</p>
                </div>
              </div>
            );
          })}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No bookings found.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Guest</TableHead>
                <TableHead className="text-muted-foreground">Room</TableHead>
                <TableHead className="text-muted-foreground">Check In</TableHead>
                <TableHead className="text-muted-foreground">Check Out</TableHead>
                <TableHead className="text-muted-foreground">Payment</TableHead>
                <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const pm = getPaymentLabel(booking.paymentMethod);
                return (
                  <TableRow key={booking.id} className="border-border hover:bg-white/5 cursor-pointer">
                    <TableCell className="font-medium text-foreground">{booking.guest}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.room}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.checkIn}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.checkOut}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span>{pm?.icon}</span>
                        <span className="text-foreground">{pm?.label}</span>
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-foreground text-right">{formatAmount(booking.amount, booking.currency)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={
                        booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                        'bg-secondary/10 text-secondary border-secondary/20'
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bookings found.
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
