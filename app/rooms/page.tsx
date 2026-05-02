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
          <DialogTrigger render={<Button className="bg-primary text-black hover:bg-primary/90 font-medium w-full md:w-auto" />}>
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
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90">
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
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-colors ${filter === "All" ? "bg-white/20 text-foreground border-white/30" : "bg-white/5 text-foreground border-border hover:bg-white/10"}`}
        >
          All Rooms ({rooms.length})
        </Badge>
        <Badge 
          onClick={() => setFilter("Available")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-colors ${filter === "Available" ? "bg-primary/20 text-primary border-primary/30" : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"}`}
        >
          Available ({availableCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Occupied")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-colors ${filter === "Occupied" ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10"}`}
        >
          Occupied ({occupiedCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Maintenance")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-colors ${filter === "Maintenance" ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary/10"}`}
        >
          Maintenance ({maintenanceCount})
        </Badge>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {filteredRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="glass border-border bg-muted/20 hover:bg-muted/40 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${
                room.status === 'Available' ? 'bg-primary' : 
                room.status === 'Occupied' ? 'bg-destructive' : 
                'bg-secondary'
              }`}></div>
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                <div className="text-2xl font-bold text-foreground mb-1">{room.id}</div>
                <div className="text-xs text-muted-foreground">{room.type}</div>
                <Badge variant="outline" className={`mt-3 text-[10px] uppercase tracking-wider ${
                  room.status === 'Available' ? 'bg-primary/10 text-primary border-primary/20' : 
                  room.status === 'Occupied' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                  'bg-secondary/10 text-secondary border-secondary/20'
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
