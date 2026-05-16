"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useHotel } from "@/app/context/HotelContext";

export default function GuestsPage() {
  const { guests, formatCurrency } = useHotel();
  const [search, setSearch] = useState("");

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Guests Directory</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">View guest history, contact info, and lifetime value.</p>
        </div>
      </div>

      <div className="glass border border-border/30 bg-card/30 rounded-2xl p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search guests..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/30 border-border/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30" 
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredGuests.map((guest) => (
            <div key={guest.id} className="mobile-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/15 shadow-[0_0_12px_rgba(202,138,4,0.2)] flex items-center justify-center text-primary font-black shrink-0 text-lg border border-primary/15">
                  {guest.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{guest.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{guest.phone} · {guest.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/20">
                <span className="text-xs text-muted-foreground">{guest.totalStays} stays</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(guest.lifetimeValue)}</span>
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No guests found.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-xl border border-border/30 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Guest ID</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground text-center">Total Stays</TableHead>
                <TableHead className="text-muted-foreground text-right">Lifetime Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id} className="border-border hover:bg-white/5 cursor-pointer">
                  <TableCell className="font-medium text-muted-foreground">{guest.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{guest.name}</TableCell>
                  <TableCell className="text-muted-foreground">{guest.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{guest.email}</TableCell>
                  <TableCell className="text-center text-foreground">{guest.totalStays}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{formatCurrency(guest.lifetimeValue)}</TableCell>
                </TableRow>
              ))}
              {filteredGuests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No guests found.
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
