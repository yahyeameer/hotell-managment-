"use client";

import { Bell, Menu, Search, Phone, X, Clock, BedDouble, LogOut } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarContent } from "./Sidebar";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useHotel, PAYMENT_METHODS } from "@/app/context/HotelContext";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const router = useRouter();
  const { hotelName, bookings, guests, currentUserRole } = useHotel();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Checkout reminders: bookings where checkout is today or overdue
  const checkoutReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return bookings
      .filter(b => {
        if (dismissedIds.includes(b.id)) return false;
        if (!b.checkOut) return false;
        const checkOutDate = new Date(b.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        // Show if checkout is today or overdue (past)
        return checkOutDate <= today;
      })
      .map(b => {
        const checkOutDate = new Date(b.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        const isOverdue = checkOutDate < today;
        const guest = guests.find(g => g.name === b.guest);
        return {
          ...b,
          isOverdue,
          guestPhone: guest?.phone || "-",
          daysOverdue: isOverdue ? Math.floor((today.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
        };
      })
      .sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
  }, [bookings, guests, dismissedIds]);

  const notifCount = checkoutReminders.length;

  const dismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 bg-background/40 backdrop-blur-3xl border-b border-border/50 z-10 sticky top-0 w-full shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
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
        <div className="md:hidden flex items-center justify-center min-w-0 pr-2">
          <Logo hotelName={hotelName} iconSize="sm" />
        </div>

        {/* Desktop search */}
        <div className="relative hidden md:block w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search bookings, guests..." 
            className="w-full h-9 bg-muted/30 backdrop-blur-md border border-border/50 rounded-full pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
        <ThemeToggle />
        
        {/* Notification Bell */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground relative !min-w-10 !min-h-10"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                {notifCount}
              </span>
            )}
          </Button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[340px] max-w-[calc(100vw-24px)] z-50 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Checkout Reminders</h3>
                    </div>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                      {notifCount} active
                    </Badge>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                    {checkoutReminders.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">No checkout reminders</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">All guests are within their stay</p>
                      </div>
                    ) : (
                      checkoutReminders.map((reminder, i) => (
                        <motion.div
                          key={reminder.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-3 border-b border-border/30 hover:bg-muted/30 transition-colors ${
                            reminder.isOverdue ? "bg-destructive/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              reminder.isOverdue 
                                ? "bg-destructive/20 text-destructive" 
                                : "bg-primary/20 text-primary"
                            }`}>
                              {reminder.guest.charAt(0)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">{reminder.guest}</p>
                                <button
                                  onClick={() => dismiss(reminder.id)}
                                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-0.5">
                                <BedDouble className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Room {reminder.room}</span>
                                <span className="text-muted-foreground/30">·</span>
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{reminder.checkOut}</span>
                              </div>

                              {reminder.isOverdue && (
                                <Badge variant="outline" className="mt-1.5 bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                                  ⚠️ {reminder.daysOverdue} day{reminder.daysOverdue > 1 ? 's' : ''} overdue
                                </Badge>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 mt-2">
                                <a
                                  href={reminder.guestPhone !== "-" ? `tel:${reminder.guestPhone}` : "#"}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  {reminder.guestPhone !== "-" ? "Call Guest" : "No Phone"}
                                </a>
                                <button
                                  onClick={() => dismiss(reminder.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 text-muted-foreground text-xs font-medium hover:bg-muted/60 transition-colors"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {checkoutReminders.length > 0 && (
                    <div className="p-2 border-t border-border/50 bg-muted/20">
                      <button
                        onClick={() => setDismissedIds(checkoutReminders.map(r => r.id))}
                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                      >
                        Dismiss all reminders
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop user info */}
        <div className="hidden md:flex items-center gap-3 border-l border-border pl-4 ml-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{userEmail ? userEmail.split('@')[0] : (currentUserRole === 'Admin' ? "Admin User" : "Staff Member")}</span>
            <span className="text-xs text-muted-foreground">{currentUserRole === 'Admin' ? "Manager" : "Staff"}</span>
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
        {/* Mobile avatar */}
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
