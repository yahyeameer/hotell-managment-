"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useHotel, Room } from "@/app/context/HotelContext";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

export default function RoomsPage() {
  const { rooms, addRoom, deleteRoom, editRoom, bookings, guests, endBooking } = useHotel();
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form State
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [roomId, setRoomId] = useState("");
  const [roomType, setRoomType] = useState("Hal Qol");
  const [roomPrice, setRoomPrice] = useState("40");
  
  // Bulk state
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkStart, setBulkStart] = useState("101");
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [editPrice, setEditPrice] = useState("");
  
  const debouncedSearch = useDebounce(search, 300);

  const filteredRooms = rooms.filter(r => 
    r.id.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    r.type.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).filter(room => filter === "All" ? true : room.status === filter);

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

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    const updates: Partial<Room> = {
      type: editingRoom.type,
      price: editingRoom.price,
      status: editingRoom.status
    };
    // Include new room number if changed
    if (editRoomNumber && editRoomNumber !== editingRoom.id) {
      updates.id = editRoomNumber;
    }
    editRoom(editingRoom.id, updates);
    setEditOpen(false);
    setEditingRoom(null);
    setEditRoomNumber("");
  };

  const getRoomActiveBooking = (roomId: string) => {
    return bookings.find(b => b.room === roomId && (b.status === "Paid" || b.status === "Pending"));
  };

  const calculateStayDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours < 24) return `${Math.ceil(diffHours)} hours`;
    return `${Math.ceil(diffHours / 24)} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Maamulka Qolalka</h2>
          <p className="text-muted-foreground text-sm">Maamul heerka qolalka iyo tiradooda.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="font-medium w-full md:w-auto" />}>
              <Plus className="w-4 h-4 mr-2" /> Kudar Qol
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Kudar Qol(al) Cusub</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4 bg-muted/40 p-1 rounded-md">
              <Button 
                variant={addMode === "single" ? "default" : "ghost"} 
                className="flex-1 h-8 text-xs" 
                onClick={() => setAddMode("single")}
              >
                Hal Qol
              </Button>
              <Button 
                variant={addMode === "bulk" ? "default" : "ghost"} 
                className="flex-1 h-8 text-xs" 
                onClick={() => setAddMode("bulk")}
              >
                Dhowr Qol
              </Button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
              {addMode === "single" ? (
                <div className="space-y-2">
                  <Label htmlFor="roomId">Tirsiga Qolka</Label>
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
                    <Label htmlFor="bulkCount">Imisa Qol?</Label>
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
                    <Label htmlFor="bulkStart">Lambar Ka Bilaaw</Label>
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
                    <Label htmlFor="bulkPrefix">Horgale (Ikhtiyaari)</Label>
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
                <Label htmlFor="roomType">Nooca Qolka</Label>
                <Select value={roomType} onValueChange={(v) => setRoomType(v ?? "Hal Qol")}>
                  <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                    <SelectValue placeholder="Dooro nooc" />
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
                <Label htmlFor="roomPrice">Qiimaha Asalka (USD)</Label>
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
                {addMode === "single" ? "Keydi Qolka" : `Keydi ${bulkCount || 0} Qol`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditingRoom(null); setEditRoomNumber(""); setConfirmDelete(false); } else { if (editingRoom) setEditRoomNumber(editingRoom.id); } }}>
          <DialogContent className="bg-background border-border text-foreground max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Qolka {editingRoom?.id}</DialogTitle>
            </DialogHeader>
            {editingRoom && (
              <div className="space-y-4 pt-1">
                {/* Active Booking Info if Occupied */}
                {editingRoom.status === "Occupied" && (() => {
                  const activeBooking = getRoomActiveBooking(editingRoom.id);
                  if (activeBooking) {
                    return (
                      <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Qofka Deggan</h4>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-foreground text-sm">{activeBooking.guest}</p>
                          <Badge className="bg-primary/10 text-primary border-primary/25">{activeBooking.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 pt-1 border-t border-border/20 mt-1">
                          <div>
                            <span className="block text-[9px] text-muted-foreground/75 font-semibold">MUDDADA</span>
                            <strong className="text-foreground">{calculateStayDuration(activeBooking.checkIn, activeBooking.checkOut)}</strong>
                          </div>
                          <div>
                            <span className="block text-[9px] text-muted-foreground/75 font-semibold">WAQTIGA BIXIDA</span>
                            <strong className="text-foreground">{new Date(activeBooking.checkOut).toLocaleDateString()}</strong>
                          </div>
                        </div>
                        <Button 
                          type="button"
                          onClick={() => {
                            endBooking(activeBooking.id, editingRoom.id);
                            setEditOpen(false);
                          }}
                          className="w-full mt-2" variant="destructive" size="sm">
                          Ka Bixi Qolka (Check Out)
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}

                <form onSubmit={handleEditRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRoomNumber">Tirsiga Qolka</Label>
                    <Input 
                      id="editRoomNumber"
                      value={editRoomNumber || editingRoom.id} 
                      onChange={e => setEditRoomNumber(e.target.value)} 
                      required 
                      placeholder="e.g. 104"
                      className="bg-muted/40 border-border focus-visible:ring-primary/50 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editType">Nooca Qolka</Label>
                    <Select 
                      value={editingRoom.type} 
                      onValueChange={(v) => setEditingRoom({ ...editingRoom, type: v || "" })}
                    >
                      <SelectTrigger id="editType" className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue />
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
                    <Label htmlFor="editStatus">Xaaladda</Label>
                    <Select 
                      value={editingRoom.status} 
                      onValueChange={(v) => setEditingRoom({ ...editingRoom, status: (v || "Available") as Room["status"] })}
                    >
                      <SelectTrigger id="editStatus" className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border text-foreground">
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Occupied">Occupied</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPrice">Qiimaha Asalka (USD)</Label>
                    <Input 
                      id="editPrice"
                      type="number"
                      value={editingRoom.price} 
                      onChange={e => setEditingRoom({ ...editingRoom, price: parseFloat(e.target.value) || 0 })} 
                      required 
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">
                      Keydi Isbedelka
                    </Button>
                    
                    {!confirmDelete ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700 border-none px-3"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 animate-slide-up bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl">
                        <span className="text-[10px] text-rose-500 font-bold whitespace-nowrap">Hubtaa?</span>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => {
                            deleteRoom(editingRoom.id);
                            setEditOpen(false);
                            setEditingRoom(null);
                            setConfirmDelete(false);
                          }}
                        >
                          Haa
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => setConfirmDelete(false)}
                        >
                          Maya
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
        <Badge 
          onClick={() => setFilter("All")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "All" ? "bg-foreground/10 text-foreground border-foreground/20 shadow-sm" : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"}`}
        >
          Dhamaan ({rooms.length})
        </Badge>
        <Badge 
          onClick={() => setFilter("Available")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Available" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-sm" : "bg-emerald-500/5 text-emerald-600/60 dark:text-emerald-400/60 border-emerald-500/15 hover:bg-emerald-500/10"}`}
        >
          Bannaan ({availableCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Occupied")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Occupied" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-sm" : "bg-rose-500/5 text-rose-600/60 dark:text-rose-400/60 border-rose-500/15 hover:bg-rose-500/10"}`}
        >
          La Deggan Yahay ({occupiedCount})
        </Badge>
        <Badge 
          onClick={() => setFilter("Maintenance")}
          variant="outline" 
          className={`px-4 py-1.5 cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95 rounded-xl ${filter === "Maintenance" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-sm" : "bg-amber-500/5 text-amber-600/60 dark:text-amber-400/60 border-amber-500/15 hover:bg-amber-500/10"}`}
        >
          Ciladaysan ({maintenanceCount})
        </Badge>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {filteredRooms.map((room, i) => {
          const activeBooking = room.status === "Occupied" ? getRoomActiveBooking(room.id) : null;
          return (
          <motion.div
            key={`${room.id}-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.025, duration: 0.3 }}
          >
            <Card 
              onClick={() => { setEditingRoom(room); setEditRoomNumber(room.id); setEditOpen(true); }}
              className="glass border-border/30 bg-card/40 hover:bg-card/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:scale-[1.04] transition-all duration-300 cursor-pointer group relative overflow-hidden active:scale-98"
            >
              <div className={`absolute top-0 left-0 w-full h-[3px] ${
                room.status === 'Available' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                room.status === 'Occupied' ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 
                'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[130px] relative z-10">
                <div className="text-3xl sm:text-4xl font-black text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 tabular-nums">{room.id}</div>
                <div className="text-[11px] font-medium text-muted-foreground tracking-wide">{room.type}</div>
                
                {activeBooking && (
                  <div className="mt-2 text-center">
                    <p className="text-xs font-bold text-foreground truncate max-w-[100px]">{activeBooking.guest}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(() => { const g = guests.find(gg => gg.name === activeBooking.guest); return g?.phone && g.phone !== '-' ? g.phone : ''; })()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{calculateStayDuration(activeBooking.checkIn, activeBooking.checkOut)}</p>
                  </div>
                )}
                
                <Badge variant="outline" className={`mt-3 text-[10px] uppercase tracking-widest font-bold ${
                  room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                  room.status === 'Occupied' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' : 
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {room.status === 'Available' ? 'Bannaan' : room.status === 'Occupied' ? 'La Deggan Yahay' : 'Ciladaysan'}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Wax qol ah lagama helin doorashadan.
          </div>
        )}
      </motion.div>
    </div>
  );
}
