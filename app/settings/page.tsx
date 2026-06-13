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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Nidaaminta Huteelka</h2>
        <p className="text-muted-foreground text-sm">Maamul astaanta, lacagta, iyo qaabeynta guud ee huteelka.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="text-foreground">Astaanta (Branding)</CardTitle>
            <CardDescription>Cusboonaysii magaca iyo summada huteelka.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotel-name" className="text-foreground">Magaca Huteelka</Label>
              <Input 
                id="hotel-name" 
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-foreground">Summada Huteelka (Logo)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border border-primary/30 overflow-hidden shadow-sm">
                  {localLogo ? (
                    <img src={localLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground text-2xl font-black">{localName.charAt(0) || "H"}</span>
                  )}
                </div>
                <Label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-secondary hover:text-secondary-foreground h-10 px-4 py-2 w-full sm:w-auto">
                  Soo Geli Summad Cusub
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

        <Card className="glass border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="text-foreground">Maamulka Doorarka</CardTitle>
            <CardDescription>Samee oo maamul doorarka shaqaalaha iyo oggolaanshahooda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Doorarka Hadda Jira</h3>
              
              <Dialog>
                <DialogTrigger render={<Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" />}>
                    + Samee Door Cusub
                </DialogTrigger>
                <DialogContent className="bg-background border-border text-foreground">
                  <DialogHeader>
                    <DialogTitle>Samee Door Cusub</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Magaca Doorka</Label>
                      <Input id="role-name" placeholder="tusaale. Kaaliyaha Maamulaha" className="bg-muted/40 border-border focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-desc">Faahfaahin</Label>
                      <Input id="role-desc" placeholder="Faahfaahin kooban ee shaqada" className="bg-muted/40 border-border focus-visible:ring-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Oggolaanshaha</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Maamul Shaqaale</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Wax Ka Bedel Bukaynaha</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Arag Warbixinaha</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-primary" /> Maamul Qolalka</label>
                      </div>
                    </div>
                    <Button className="w-full  mt-2">Keydi Doorka & Oggolaanshaha</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Manager", desc: "Helitaan buuxa oo ay ku jiraan warbixinaha iyo maamulka shaqaalaha" },
                { name: "Receptionist", desc: "Wuxuu maamuli karaa bukaynaha, martida, iyo lacag bixinta" },
                { name: "Housekeeping", desc: "Wuxuu arki karaa oo cusboonaysiin karaa xaaladaha qolalka" }
              ].map((role) => (
                <div key={role.name} className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/30 transition-colors duration-300">
                  <div>
                    <p className="font-medium text-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Bedel</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="text-foreground">Qaabeynta Maaliyadda</CardTitle>
            <CardDescription>Maamul nidaamka lacagta iyo sicirka sarrifka.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-currency" className="text-foreground">Lacagta Aasaasiga Ah</Label>
                <select 
                  id="primary-currency" 
                  value={localCurrency}
                  onChange={e => setLocalCurrency(e.target.value)}
                  className="flex h-11 w-full items-center justify-between whitespace-nowrap rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-base shadow-sm transition-all duration-300 hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SOS">Somaliland Shilling (SOS)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange-rate" className="text-foreground">Sicirka Sarrifka (1 USD = X SOS)</Label>
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
            <CardTitle className="text-foreground">Macluumaadka Xiriirka</CardTitle>
            <CardDescription>Faahfaahinta xiriirka huteelka ee loogu talagalay rasiidhyada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Ciwaanka Iimeelka</Label>
                <Input id="email" type="email" defaultValue="info@hargeisagrand.com" className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Telefon Lambarka</Label>
                <Input id="phone" defaultValue="+252 63 1234567" className="bg-muted/40 border-border text-foreground focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-foreground">Ciwaanka (Address)</Label>
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
            Jooji
          </Button>
          <Button 
            onClick={handleSave} 
            className={`font-semibold transition-all duration-500 ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)]' : ''}`}
          >
            {isSaved ? "Waa La Keydiyay!" : "Keydi Isbedelka"}
          </Button>
        </div>
      </div>
    </div>
  );
}
