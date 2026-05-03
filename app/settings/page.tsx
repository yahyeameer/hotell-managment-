"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useHotel } from "@/app/context/HotelContext";
import { useState } from "react";

export default function SettingsPage() {
  const { hotelName, setHotelName, currency, setCurrency, exchangeRate, setExchangeRate, logoUrl, setLogoUrl } = useHotel();
  
  // Local state for form inputs before saving
  const [localName, setLocalName] = useState(hotelName);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localRate, setLocalRate] = useState(exchangeRate.toString());
  const [localLogo, setLocalLogo] = useState(logoUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setHotelName(localName);
    setCurrency(localCurrency);
    setExchangeRate(parseFloat(localRate));
    setLogoUrl(localLogo);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Hotel Settings</h2>
        <p className="text-muted-foreground text-sm">Manage hotel branding, currency, and general configuration.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Branding</CardTitle>
            <CardDescription>Update your hotel's name and logo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotel-name" className="text-foreground">Hotel Name</Label>
              <Input 
                id="hotel-name" 
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Hotel Logo</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/50 overflow-hidden">
                  {localLogo ? (
                    <img src={localLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground text-2xl font-black">{localName.charAt(0) || "H"}</span>
                  )}
                </div>
                <Label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-secondary hover:text-secondary-foreground h-10 px-4 py-2 w-full sm:w-auto">
                  Upload New Logo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLocalLogo(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Role Management</CardTitle>
            <CardDescription>Create and manage staff roles and their permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Current Roles</h3>
              
              <Dialog>
                <DialogTrigger render={<Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" />}>
                    + Generate New Role
                </DialogTrigger>
                <DialogContent className="bg-background border-border text-foreground">
                  <DialogHeader>
                    <DialogTitle>Generate New Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name</Label>
                      <Input id="role-name" placeholder="e.g. Assistant Manager" className="bg-muted/40 border-border focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-desc">Description</Label>
                      <Input id="role-desc" placeholder="Brief description of responsibilities" className="bg-muted/40 border-border focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Manage Staff</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Edit Bookings</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> View Reports</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Manage Rooms</label>
                      </div>
                    </div>
                    <Button className="w-full bg-primary text-black hover:bg-primary/90 mt-2">Save Role & Permissions</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Manager", desc: "Full system access including reports and staff management" },
                { name: "Receptionist", desc: "Can manage bookings, guests, and payments" },
                { name: "Housekeeping", desc: "Can view and update room statuses" }
              ].map((role) => (
                <div key={role.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Financial Configuration</CardTitle>
            <CardDescription>Manage currency settings and exchange rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-currency" className="text-foreground">Primary Currency</Label>
                <select 
                  id="primary-currency" 
                  value={localCurrency}
                  onChange={e => setLocalCurrency(e.target.value)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-muted/40 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground [&>span]:line-clamp-1"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SOS">Somaliland Shilling (SOS)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange-rate" className="text-foreground">Exchange Rate (1 USD = X SOS)</Label>
                <Input 
                  id="exchange-rate" 
                  type="number" 
                  value={localRate}
                  onChange={e => setLocalRate(e.target.value)}
                  className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-foreground">Contact Information</CardTitle>
            <CardDescription>Hotel contact details for receipts and invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input id="email" type="email" defaultValue="info@hargeisagrand.com" className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input id="phone" defaultValue="+252 63 1234567" className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Input id="address" defaultValue="Road 1, Hargeisa, Somaliland" className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pb-10">
          <Button variant="outline" className="bg-transparent border-border text-foreground hover:bg-secondary" onClick={() => {
            setLocalName(hotelName);
            setLocalCurrency(currency);
            setLocalRate(exchangeRate.toString());
            setLocalLogo(logoUrl);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className={`${isSaved ? 'bg-green-500' : 'bg-primary'} text-primary-foreground hover:bg-primary/90 font-medium transition-colors`}
          >
            {isSaved ? "Saved Successfully!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
