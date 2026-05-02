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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Guests Directory</h2>
          <p className="text-muted-foreground text-sm">View guest history, contact info, and lifetime value.</p>
        </div>
      </div>

      <div className="glass border border-border bg-muted/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search guests by name or phone..." 
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
