"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarContent } from "./Sidebar";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHotel } from "@/app/context/HotelContext";

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const { hotelName } = useHotel();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 glass border-b z-10 sticky top-0 w-full">
      <div className="flex items-center gap-3 w-full">
        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground shrink-0 !min-w-10 !min-h-10" />}>
              <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-background border-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        
        {/* Mobile hotel name */}
        <span className="md:hidden text-sm font-bold text-foreground truncate">{hotelName}</span>

        {/* Desktop search */}
        <div className="relative hidden md:block w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search bookings, guests..." 
            className="w-full h-9 bg-muted/40 border border-border rounded-full pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative !min-w-10 !min-h-10">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_var(--primary)]"></span>
        </Button>
        {/* Desktop user info */}
        <div className="hidden md:flex items-center gap-3 border-l border-border pl-4 ml-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{userEmail ? userEmail.split('@')[0] : "Admin User"}</span>
            <span className="text-xs text-muted-foreground">{userEmail ? "Staff" : "Manager"}</span>
          </div>
          <Avatar className="w-8 h-8 border border-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-medium text-xs">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "AD"}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors ml-1" title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        {/* Mobile avatar + sign out */}
        <div className="md:hidden flex items-center gap-1">
          <Avatar className="w-7 h-7 border border-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-medium text-[10px]">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "AD"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
