"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCheck, KeyRound } from "lucide-react";
import { useHotel, Staff } from "@/app/context/HotelContext";
import { createStaffUser, resetStaffPassword } from "./actions";

export default function StaffPage() {
  const { staff, addStaff } = useHotel();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Receptionist");
  const [phone, setPhone] = useState("");
  const [shift, setShift] = useState("Morning");
  
  const [generatedPassword, setGeneratedPassword] = useState("");

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call server action to create a user in Supabase Auth
    const res = await createStaffUser(email, generatedPassword, name);
    
    if (!res.success) {
      alert("Waa laga furiin waayay: " + res.error);
      return;
    }
    
    const newStaff: Staff & { email?: string } = {
      id: `EMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId: res.user?.id,
      name,
      role,
      phone,
      email,
      status: "Active",
      shift
    };

    addStaff(newStaff as Staff);
    
    setOpen(false);
    setName("");
    setEmail("");
    setRole("Receptionist");
    setPhone("");
    setShift("Morning");
    setGeneratedPassword("");
  };

  const handleOpenDialog = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setGeneratedPassword(Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10));
    }
  }

  const handleResetPassword = async (userId: string | undefined) => {
    if (!userId) {
      alert("Shaqaalahan ma laha akoon (user ID ma jiro).");
      return;
    }
    const newPass = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10);
    const res = await resetStaffPassword(userId, newPass);
    if (res.success) {
      alert(`Password si guul leh ayaa loo beddelay!\n\nPassword-ka cusub waa:\n\n${newPass}\n\nFadlan nuqul ka samee oo sii shaqaalaha.`);
    } else {
      alert("Waa laga beddeliin waayay: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Maamulka Shaqaalaha</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Maamul macluumaadka, doorka, iyo joogitaanka shaqaalaha.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="bg-transparent border-border/40 text-foreground hover:bg-muted/40 flex-1 md:flex-none">
            <UserCheck className="w-4 h-4 mr-2" /> Joogitaanka
          </Button>
          
          <Dialog open={open} onOpenChange={handleOpenDialog}>
            <DialogTrigger render={<Button className="font-medium flex-1 md:flex-none" />}>
                <Plus className="w-4 h-4 mr-2" /> Kudar Shaqaale
            </DialogTrigger>
            <DialogContent className="bg-background border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Kudar Shaqaale Cusub</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Magaca Buuxa</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="bg-muted/40 border-border focus-visible:ring-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Ciwaanka Iimeelka</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Lambarka</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      required 
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="p-3.5 bg-primary/5 border border-primary/15 rounded-xl text-sm">
                  <p className="text-muted-foreground mb-1">Password-ka la sameeyay:</p>
                  <p className="font-mono font-bold text-foreground tracking-wider">{generatedPassword}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Fadlan nuqul ka samee. Waxay u baahan yihiin si ay u galaan.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Doorka</Label>
                    <Select value={role} onValueChange={(v) => setRole(v ?? "Receptionist")}>
                      <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue placeholder="Dooro doorka" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border text-foreground">
                        <SelectItem value="Receptionist">Receptionist</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shift">Wareegga</Label>
                    <Select value={shift} onValueChange={(v) => setShift(v ?? "Morning")}>
                      <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue placeholder="Dooro wareegga" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border text-foreground">
                        <SelectItem value="Morning">Subax</SelectItem>
                        <SelectItem value="Day">Maalin</SelectItem>
                        <SelectItem value="Night">Habeen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Keydi Shaqaalaha
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass border border-border/30 bg-card/30 rounded-2xl p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Raadi shaqaalaha..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/30 border-border/40 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30" 
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredStaff.map((employee) => (
            <div key={employee.id} className="mobile-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/15 shadow-[0_0_12px_rgba(202,138,4,0.2)] flex items-center justify-center text-primary font-black shrink-0 text-lg border border-primary/15">
                  {employee.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-sm truncate">{employee.name}</p>
                    <Badge variant="outline" className={
                      employee.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0' : 
                      'bg-white/5 text-muted-foreground border-border shrink-0'
                    }>
                      {employee.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{employee.role} · {employee.shift} Wareegtii</p>
                  <p className="text-xs text-muted-foreground mt-1">{employee.phone}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleResetPassword(employee.userId)} title="Bedel Password-ka" className="shrink-0 h-8 w-8">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Wax shaqaale ah lama helin.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-xl border border-border/30 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30 whitespace-nowrap">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Magaca</TableHead>
                <TableHead className="text-muted-foreground">Doorka</TableHead>
                <TableHead className="text-muted-foreground">Wareegga</TableHead>
                <TableHead className="text-muted-foreground">Telefon</TableHead>
                <TableHead className="text-muted-foreground text-right">Xaaladda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((employee) => (
                <TableRow key={employee.id} className="border-border hover:bg-white/5">
                  <TableCell className="font-medium text-foreground">{employee.id}</TableCell>
                  <TableCell className="text-foreground">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.shift}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline" className={
                        employee.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                        'bg-white/5 text-muted-foreground border-border'
                      }>
                        {employee.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleResetPassword(employee.userId)} title="Bedel Password-ka" className="h-8 w-8 hover:bg-muted/50">
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Wax shaqaale ah lama helin.
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
