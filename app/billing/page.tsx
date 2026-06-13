"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, CheckCircle2, XCircle, LogOut, Edit2, Trash2 } from "lucide-react";
import { useHotel, Booking, Guest, PAYMENT_METHODS, PaymentMethodId } from "@/app/context/HotelContext";

export default function BillingPage() {
  const { bookings, addBooking, editBooking, deleteBooking, rooms, formatCurrency, formatAmount, addGuest, toUSD, guests, exchangeRate, updateBookingPaymentStatus, updatePromiseToPay, endBooking } = useHotel();
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

  // Custom Promise-to-Pay States
  const [promisePaymentBooking, setPromisePaymentBooking] = useState<Booking | null>(null);
  const [customPromiseDate, setCustomPromiseDate] = useState<string>("");

  // Edit Booking State
  const [editBookingOpen, setEditBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [confirmDeleteBooking, setConfirmDeleteBooking] = useState<string | null>(null);

  const filteredBookings = bookings.filter(b => 
    b.guest.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    const room = rooms.find(r => r.id === roomId);
    let amount = room ? room.price * 2 : 100;
    if (bookingCurrency === "SOS") {
      amount = amount * exchangeRate;
    }

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
    
    const existingGuest = guests.find(g => g.name.toLowerCase() === guestName.toLowerCase());
    if (!existingGuest) {
      const newGuest: Guest = {
        id: `GST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: guestName,
        phone: guestPhone || "-",
        email: "-",
        totalStays: 1,
        lifetimeValue: amount
      };
      addGuest(newGuest);
    }

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

  const handleConfirmPromiseToPay = (days: number) => {
    if (!promisePaymentBooking) return;
    
    let dateStr: string | undefined;
    if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      dateStr = d.toISOString();
    } else {
      dateStr = customPromiseDate || undefined;
    }
    
    updatePromiseToPay(promisePaymentBooking.id, dateStr);
    updateBookingPaymentStatus(promisePaymentBooking.id, "Pending");
    
    setPromisePaymentBooking(null);
    setCustomPromiseDate("");
  };

  const handleTogglePayment = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    if (booking.status === "Paid") {
      setPromisePaymentBooking(booking);
    } else if (booking.status === "Pending") {
      updatePromiseToPay(booking.id, undefined);
      updateBookingPaymentStatus(booking.id, "Paid");
    }
  };

  const renderPromiseCountdown = (booking: Booking) => {
    if (booking.status !== "Pending" || !booking.promiseToPayDate) return null;
    const due = new Date(booking.promiseToPayDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) {
      return <span className="text-[10px] text-red-500 font-bold ml-2">Wakhtigu Dhamaday!</span>;
    } else if (diffHours < 24) {
      return <span className="text-[10px] text-orange-500 font-bold ml-2">Dhow Ayuu Yahay</span>;
    }
    return <span className="text-[10px] text-muted-foreground ml-2">{Math.ceil(diffHours/24)} maalin</span>;
  };

  // Duration display helper
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) return null;
    const diffMs = endDate - startDate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (remainingHours === 0) return `${days} day${days !== 1 ? 's' : ''}`;
    return `${days}d ${remainingHours}h`;
  };

  const handleEditBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    editBooking(editingBooking.id, {
      guest: editingBooking.guest,
      room: editingBooking.room,
      checkIn: editingBooking.checkIn,
      checkOut: editingBooking.checkOut,
      amount: editingBooking.amount,
      paymentMethod: editingBooking.paymentMethod,
      currency: editingBooking.currency,
      status: editingBooking.status
    });
    setEditBookingOpen(false);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (id: string) => {
    deleteBooking(id);
    setConfirmDeleteBooking(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Qaansheegta & Bukaynaha</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Maamul bukaynaha, lacag bixinta, iyo rasiidhka.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> Bukayn Cusub
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Samee Bukayn Cusub</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBooking} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Magaca Martida</Label>
                <Input 
                  id="guestName" 
                  value={guestName} 
                  onChange={e => setGuestName(e.target.value)} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Telefon Martida</Label>
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
                <Label htmlFor="roomId">Qol U Qoondo</Label>
                <Select value={roomId} onValueChange={(v) => setRoomId(v ?? "")}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue placeholder="Dooro qol bannaan" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    {rooms.filter(r => r.status === "Available").map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Qol {room.id} - {room.type} (${room.price}/habeen)
                      </SelectItem>
                    ))}
                    {rooms.filter(r => r.status === "Available").length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">Wax qol bannaan ah ma jiraan</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Soo Galitaanka</Label>
                  <Input 
                    id="checkIn" 
                    type="datetime-local"
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Ka Bixida</Label>
                  <Input 
                    id="checkOut" 
                    type="datetime-local"
                    value={checkOut} 
                    onChange={e => setCheckOut(e.target.value)} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Duration Display */}
              {checkIn && checkOut && calculateDuration(checkIn, checkOut) && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Muddada Joogitaanka</p>
                  <p className="text-lg font-black text-primary">{calculateDuration(checkIn, checkOut)}</p>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Habka Lacag Bixinta</Label>
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
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all duration-300 active:scale-95 ${
                        paymentMethod === pm.id 
                          ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(202,138,4,0.1)] drop-shadow-sm" 
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:border-border"
                      }`}
                    >
                      <span className={paymentMethod === pm.id ? "drop-shadow-[0_0_8px_rgba(202,138,4,0.5)] transition-all" : ""}>{pm.icon}</span>
                      <span className="truncate w-full text-center">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>Lacagta</Label>
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
                      {cur === "USD" ? "💵 US Dollar" : "💰 Shilin Soomaaliyeed"}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!roomId}>
                Xaqiiji Bukaynta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Wadarta Bukaynaha</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{bookings.length}</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Wadarta Dakhliga</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{formatCurrency(bookings.reduce((sum, b) => sum + toUSD(b.amount, b.currency), 0))}</p>
        </div>
        <div className="glass p-3 sm:p-4 rounded-xl border border-border bg-muted/20 col-span-2 md:col-span-1 relative overflow-hidden group hover:bg-muted/30 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
          <h3 className="text-xs text-muted-foreground mb-1 font-medium tracking-wide">Sugaya</h3>
          <p className="text-xl sm:text-3xl font-black text-foreground drop-shadow-sm">{bookings.filter(b => b.status === "Pending").length}</p>
        </div>
      </div>

      <div className="glass border border-border/50 bg-muted/20 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Raadi bukaynaha..." 
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
                      <p className="text-xs text-muted-foreground">Qol {booking.room}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <Badge variant="outline" className={
                      booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                      booking.status === 'Checked Out' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                      'bg-secondary/10 text-secondary border-secondary/20'
                    }>
                      {booking.status}
                    </Badge>
                    {renderPromiseCountdown(booking)}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{pm?.icon}</span>
                    <span className="text-xs text-muted-foreground">{pm?.label}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatAmount(booking.amount, booking.currency)}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-border/30">
                  {booking.status !== "Checked Out" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`flex-1 text-xs h-10 sm:h-9 rounded-xl transition-all duration-300 border-none ${
                          booking.status === "Paid" 
                            ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700" 
                            : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700"
                        }`}
                        onClick={(e) => handleTogglePayment(e, booking)}
                      >
                        {booking.status === "Paid" ? (
                          <><XCircle className="w-4 h-4 mr-1.5" /> Muu bixin</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Bixiyey</>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="flex-1 text-xs h-10 sm:h-9 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 border-none transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          endBooking(booking.id, booking.room);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-1.5" /> Baxay
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-10 sm:h-9 px-3 rounded-xl bg-muted/30 text-muted-foreground hover:bg-muted/50 border-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBooking({...booking});
                      setEditBookingOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {confirmDeleteBooking === booking.id ? (
                    <div className="flex items-center gap-1 animate-slide-up">
                      <Button size="sm" variant="destructive" className="h-10 sm:h-9 px-2 text-xs rounded-xl" onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}>Yes</Button>
                      <Button size="sm" variant="outline" className="h-10 sm:h-9 px-2 text-xs rounded-xl border-none" onClick={(e) => { e.stopPropagation(); setConfirmDeleteBooking(null); }}>No</Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-10 sm:h-9 px-3 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteBooking(booking.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Wax bukayn ah lama helin.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Martida</TableHead>
                <TableHead className="text-muted-foreground">Qolka</TableHead>
                <TableHead className="text-muted-foreground">Soo Galitaanka</TableHead>
                <TableHead className="text-muted-foreground">Ka Bixida</TableHead>
                <TableHead className="text-muted-foreground">Lacag Bixinta</TableHead>
                <TableHead className="text-muted-foreground text-right">Qadarka</TableHead>
                <TableHead className="text-muted-foreground text-center">Xaaladda</TableHead>
                <TableHead className="text-muted-foreground text-right">Ficilada</TableHead>
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
                      <div className="flex flex-col items-center">
                        <Badge variant="outline" className={
                          booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                          booking.status === 'Checked Out' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                          'bg-secondary/10 text-secondary border-secondary/20'
                        }>
                          {booking.status}
                        </Badge>
                        {renderPromiseCountdown(booking)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status !== "Checked Out" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-8 text-xs px-3 transition-all duration-300 border-none ${
                                booking.status === "Paid" 
                                  ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700" 
                                  : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700"
                              }`}
                              onClick={(e) => handleTogglePayment(e, booking)}
                            >
                              {booking.status === "Paid" ? (
                                <><XCircle className="w-3.5 h-3.5 mr-1.5" /> Muu bixin</>
                              ) : (
                                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Bixiyey</>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="h-8 text-xs px-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 border-none transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                endBooking(booking.id, booking.room);
                              }}
                            >
                              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Baxay
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2 bg-muted/30 text-muted-foreground hover:bg-muted/50 border-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBooking({...booking});
                            setEditBookingOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirmDeleteBooking === booking.id) {
                              handleDeleteBooking(booking.id);
                            } else {
                              setConfirmDeleteBooking(booking.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Wax bukayn ah lama helin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Promise-to-Pay Drawer/Dialog */}
      {promisePaymentBooking && (
        <Dialog open={!!promisePaymentBooking} onOpenChange={(o) => { if (!o) setPromisePaymentBooking(null); }}>
          <DialogContent className="bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Muu bixin (Mark Pending)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Goormuu macmiilka <strong className="text-foreground">{promisePaymentBooking.guest}</strong> bixin doonaa lacagta?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Beri (1d)", days: 1 },
                  { label: "2 Maalmood", days: 2 },
                  { label: "3 Maalmood", days: 3 },
                  { label: "Toddobaad (7d)", days: 7 },
                  { label: "10 Maalmood", days: 10 },
                  { label: "15 Maalmood", days: 15 },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleConfirmPromiseToPay(opt.days)}
                    className="py-3 px-2 rounded-xl border border-border/50 bg-muted/20 text-xs font-semibold text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-all active:scale-95 text-center cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-2 border-t border-border/30">
                <Label htmlFor="customPromiseDate" className="text-xs text-muted-foreground">Taariikh Gaar ah</Label>
                <div className="flex gap-2">
                  <Input
                    id="customPromiseDate"
                    type="date"
                    className="bg-muted/40 border-border flex-1 dark:[color-scheme:dark]"
                    onChange={(e) => {
                      const dateVal = e.target.value;
                      if (dateVal) {
                        const d = new Date(dateVal);
                        d.setHours(23, 59, 59, 999);
                        setCustomPromiseDate(d.toISOString());
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleConfirmPromiseToPay(0)}
                    disabled={!customPromiseDate}
                  >
                    Keydi
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPromisePaymentBooking(null)}>
                Jooji
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {editingBooking && (
        <Dialog open={editBookingOpen} onOpenChange={(o) => { if (!o) { setEditBookingOpen(false); setEditingBooking(null); } }}>
          <DialogContent className="bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Wax Ka Bedel Bukaynta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditBooking} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="editGuest">Magaca Martida</Label>
                <Input 
                  id="editGuest"
                  value={editingBooking.guest} 
                  onChange={e => setEditingBooking({...editingBooking, guest: e.target.value})} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoom">Qolka</Label>
                <Select value={editingBooking.room} onValueChange={(v) => setEditingBooking({...editingBooking, room: v || editingBooking.room})}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Qol {room.id} - {room.type} ({room.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCheckIn">Soo Galitaanka</Label>
                  <Input 
                    id="editCheckIn" 
                    type="datetime-local"
                    value={editingBooking.checkIn} 
                    onChange={e => setEditingBooking({...editingBooking, checkIn: e.target.value})} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCheckOut">Ka Bixida</Label>
                  <Input 
                    id="editCheckOut" 
                    type="datetime-local"
                    value={editingBooking.checkOut} 
                    onChange={e => setEditingBooking({...editingBooking, checkOut: e.target.value})} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50 dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Duration Display */}
              {editingBooking.checkIn && editingBooking.checkOut && calculateDuration(editingBooking.checkIn, editingBooking.checkOut) && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Muddada Joogitaanka</p>
                  <p className="text-lg font-black text-primary">{calculateDuration(editingBooking.checkIn, editingBooking.checkOut)}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editAmount">Qadarka</Label>
                <Input 
                  id="editAmount"
                  type="number"
                  value={editingBooking.amount} 
                  onChange={e => setEditingBooking({...editingBooking, amount: parseFloat(e.target.value) || 0})} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Habka Lacag Bixinta</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setEditingBooking({...editingBooking, paymentMethod: pm.id});
                        if (pm.id === "cash_sos") setEditingBooking(prev => prev ? {...prev, paymentMethod: pm.id, currency: "SOS"} : prev);
                        else if (pm.id === "cash_usd") setEditingBooking(prev => prev ? {...prev, paymentMethod: pm.id, currency: "USD"} : prev);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all duration-300 active:scale-95 ${
                        editingBooking.paymentMethod === pm.id 
                          ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(202,138,4,0.1)]" 
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{pm.icon}</span>
                      <span className="truncate w-full text-center">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">Keydi Isbedelka</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none px-4"
                  onClick={() => {
                    handleDeleteBooking(editingBooking.id);
                    setEditBookingOpen(false);
                    setEditingBooking(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Tirtir
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
