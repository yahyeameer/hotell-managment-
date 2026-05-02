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
import { useHotel, Booking, Guest } from "@/app/context/HotelContext";

export default function BillingPage() {
  const { bookings, addBooking, rooms, formatCurrency, addGuest } = useHotel();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const filteredBookings = bookings.filter(b => 
    b.guest.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find room to calculate amount (simplified)
    const room = rooms.find(r => r.id === roomId);
    const amount = room ? room.price * 2 : 100; // Assume 2 days for simplicity

    const newBooking: Booking = {
      id: `BKG-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      guest: guestName,
      room: roomId,
      checkIn,
      checkOut,
      amount,
      status: "Paid"
    };

    addBooking(newBooking);
    
    // Auto-add guest if needed
    const newGuest: Guest = {
      id: `GST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: guestName,
      phone: "-",
      email: "-",
      totalStays: 1,
      lifetimeValue: amount
    };
    addGuest(newGuest);

    setOpen(false);
    setGuestName("");
    setRoomId("");
    setCheckIn("");
    setCheckOut("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing & Bookings</h2>
          <p className="text-muted-foreground text-sm">Manage guest bookings, payments, and receipts.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-primary text-black hover:bg-primary/90 font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> New Booking
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground">
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
                <Label htmlFor="roomId">Assign Room</Label>
                <Select value={roomId} onValueChange={(v) => setRoomId(v ?? "")}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue placeholder="Select available room" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    {rooms.filter(r => r.status === "Available").map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.id} - {room.type} ({formatCurrency(room.price)}/night)
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
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={!roomId}>
                Confirm Booking
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass border border-border bg-muted/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search bookings by guest name or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50" 
            />
          </div>
          <Button variant="outline" className="bg-transparent border-border text-foreground hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Booking ID</TableHead>
                <TableHead className="text-muted-foreground">Guest Name</TableHead>
                <TableHead className="text-muted-foreground">Room</TableHead>
                <TableHead className="text-muted-foreground">Check In</TableHead>
                <TableHead className="text-muted-foreground">Check Out</TableHead>
                <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-border hover:bg-white/5 cursor-pointer">
                  <TableCell className="font-medium text-foreground">{booking.id}</TableCell>
                  <TableCell className="text-foreground">{booking.guest}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.room}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.checkIn}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.checkOut}</TableCell>
                  <TableCell className="font-bold text-foreground text-right">{formatCurrency(booking.amount)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={
                      booking.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                      'bg-secondary/10 text-secondary border-secondary/20'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
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
