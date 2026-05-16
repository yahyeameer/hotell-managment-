"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useHotel, Room } from "@/app/context/HotelContext";
import { motion } from "framer-motion";

export default function RoomsPage() {
  const { rooms, addRoom } = useHotel();
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);

  // Form State
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [roomId, setRoomId] = useState("");
  const [roomType, setRoomType] = useState("Hal Qol");
  const [roomPrice, setRoomPrice] = useState("40");
  
  // Bulk state
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkStart, setBulkStart] = useState("101");
  const [bulkPrefix, setBulkPrefix] = useState("");

  const filteredRooms = rooms.filter(room => filter === "All" ? true : room.status === filter);

  const availableCount = rooms.filter(r => r.status === "Available").length;
  const occupiedCount = rooms.filter(r => r.status === "Occupied").length;
  const maintenanceCount = rooms.filter(r => r.status === "Maintenance").length;

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (addMode === "bulk") {
      const count = parseInt(bulkCount);
      const startNum = parseInt(bulkStart);
      if (isNaN(count) || isNaN(startNum)) return;
      
      for (let i = 0; i < count; i++) {
        const newRoomId = `${bulkPrefix}${startNum + i}`;
        addRoom({
          id: newRoomId,
          type: roomType,
          status: "Available",
          price: parseFloat(roomPrice)
        });
      }
    } else {
      addRoom({
        id: roomId,
        type: roomType,
        status: "Available",
        price: parseFloat(roomPrice)
      });
    }
    
    setOpen(false);
    setRoomId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rooms Management</h2>
          <p className="text-muted-foreground text-sm">Manage room statuses and inventory.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> Add Room
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Add New Room(s)</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4 bg-muted/40 p-1 rounded-md">
              <Button 
                variant={addMode === "single" ? "default" : "ghost"} 
                className="flex-1 h-8 text-xs" 
                onClick={() => setAddMode("single")}
              >
                Single Room
              </Button>
              <Button 
                variant={addMode === "bulk" ? "default" : "ghost"} 
                className="flex-1 h-8 text-xs" 
                onClick={() => setAddMode("bulk")}
              >
                Bulk Add
              </Button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
              {addMode === "single" ? (
                <div className="space-y-2">
                  <Label htmlFor="roomId">Room Number/ID</Label>
                  <Input 
                    id="roomId" 
                    value={roomId} 
                    onChange={e => setRoomId(e.target.value)} 
                    required 
                    placeholder="e.g. 104"
                    className="bg-muted/40 border-border focus-visible:ring-primary/50"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkCount">How many rooms?</Label>
                    <Input 
                      id="bulkCount" 
                      type="number"
                      value={bulkCount} 
                      onChange={e => setBulkCount(e.target.value)} 
                      required 
                      placeholder="e.g. 20"
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkStart">Starting Number</Label>
                    <Input 
                      id="bulkStart" 
                      type="number"
                      value={bulkStart} 
                      onChange={e => setBulkStart(e.target.value)} 
                      required 
                      placeholder="e.g. 101"
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bulkPrefix">Prefix (Optional)</Label>
                    <Input 
                      id="bulkPrefix" 
                      value={bulkPrefix} 
                      onChange={e => setBulkPrefix(e.target.value)} 
                      placeholder="e.g. A-, B-, Floor1-"
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select value={roomType} onValueChange={(v) => setRoomType(v ?? "Hal Qol")}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    <SelectItem value="Hal Qol">Hal Qol (Single)</SelectItem>
                    <SelectItem value="Qol Double">Qol Double</SelectItem>
                    <SelectItem value="Qol Qoyska">Qol Qoyska (Family)</SelectItem>
                    <SelectItem value="Qol VIP">Qol VIP (Suite)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomPrice">Base Price (USD)</Label>
                <Input 
                  id="roomPrice" 
                  type="number"
                  value={roomPrice} 
                  onChange={e => setRoomPrice(e.target.value)} 
                  required 
                  className="bg-muted/40 border-border focus-visible:ring-primary/50"
                />
              </div>
              <Button type="submit" className="w-full">
                {addMode === "single" ? "Save Room" : `Save ${bulkCount || 0} Rooms`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
        <Badge 
          onClick={() => setFilter("All")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "All" ? "bg-foreground/10 text-foreground border-foreground/20 shadow-sm" : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"}`}
        >
          All Rooms ({rooms.length})
        </Badge>
        <Badge 
          onClick={() => setFilter("Available")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Available" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-sm" : "bg-emerald-500/5 text-emerald-600/60 dark:text-emerald-400/60 border-emerald-500/15 hover:bg-emerald-500/10"}`}
        >
          Available ({availableCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Occupied")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Occupied" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-sm" : "bg-rose-500/5 text-rose-600/60 dark:text-rose-400/60 border-rose-500/15 hover:bg-rose-500/10"}`}
        >
          Occupied ({occupiedCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Maintenance")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Maintenance" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-sm" : "bg-amber-500/5 text-amber-600/60 dark:text-amber-400/60 border-amber-500/15 hover:bg-amber-500/10"}`}
        >
          Maintenance ({maintenanceCount})
        </Badge>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {filteredRooms.map((room, i) => (
          <motion.div
            key={`${room.id}-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.025, duration: 0.3 }}
          >
            <Card className="glass border-border/30 bg-card/40 hover:bg-card/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:scale-[1.04] transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-[3px] ${
                room.status === 'Available' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                room.status === 'Occupied' ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 
                'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[130px] relative z-10">
                <div className="text-3xl sm:text-4xl font-black text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 tabular-nums">{room.id}</div>
                <div className="text-[11px] font-medium text-muted-foreground tracking-wide">{room.type}</div>
                <Badge variant="outline" className={`mt-3 text-[10px] uppercase tracking-widest font-bold ${
                  room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                  room.status === 'Occupied' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' : 
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {room.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No rooms found for this filter.
          </div>
        )}
      </motion.div>
    </div>
  );
}
