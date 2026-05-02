"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCheck } from "lucide-react";
import { useHotel, Staff } from "@/app/context/HotelContext";

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

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call a server action to create a user in Supabase Auth
    // using the admin API with email and the generated password.
    
    const newStaff: Staff & { email?: string } = {
      id: `EMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Staff Management</h2>
          <p className="text-muted-foreground text-sm">Manage employee details, roles, and attendance.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="bg-transparent border-border text-foreground hover:bg-white/5 flex-1 md:flex-none">
            <UserCheck className="w-4 h-4 mr-2" /> Attendance
          </Button>
          
          <Dialog open={open} onOpenChange={handleOpenDialog}>
            <DialogTrigger render={<Button className="bg-primary text-black hover:bg-primary/90 font-medium flex-1 md:flex-none" />}>
                <Plus className="w-4 h-4 mr-2" /> Add Staff
            </DialogTrigger>
            <DialogContent className="bg-background border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
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
                    <Label htmlFor="email">Email Address</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      required 
                      className="bg-muted/40 border-border focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted/50 border border-border rounded-md text-sm">
                  <p className="text-muted-foreground mb-1">Generated Password for Login:</p>
                  <p className="font-mono font-bold text-foreground tracking-wider">{generatedPassword}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Please copy this password. They will need it to sign in.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v ?? "Receptionist")}>
                      <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue placeholder="Select role" />
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
                    <Label htmlFor="shift">Shift</Label>
                    <Select value={shift} onValueChange={(v) => setShift(v ?? "Morning")}>
                      <SelectTrigger className="bg-muted/40 border-border focus-visible:ring-primary/50">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border text-foreground">
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90">
                  Save Employee
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass border border-border bg-muted/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search staff by name or role..." 
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
                <TableHead className="text-muted-foreground">Employee ID</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Shift</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground text-right">Status</TableHead>
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
                    <Badge variant="outline" className={
                      employee.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : 
                      'bg-white/5 text-muted-foreground border-border'
                    }>
                      {employee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No staff found.
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
