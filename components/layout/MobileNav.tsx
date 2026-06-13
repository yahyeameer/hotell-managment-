"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BedDouble, ReceiptText, UsersRound, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useHotel } from "@/app/context/HotelContext";

const navItems = [
  { label: "Guriga", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Biilka", icon: ReceiptText, href: "/billing" },
  // Center slot is the FAB
  { label: "Qolalka", icon: BedDouble, href: "/rooms" },
  { label: "Martida", icon: UsersRound, href: "/guests" },
];

const quickActions = [
  { label: "Bukayn Cusub", href: "/billing?action=new", color: "bg-primary text-primary-foreground" },
  { label: "Kudar Qol", href: "/rooms?action=new", color: "bg-blue-500 text-white" },
  { label: "Kharashaad Cusub", href: "/expenses?action=new", color: "bg-rose-500 text-white" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);
  const { currentUserRole } = useHotel();

  const filteredQuickActions = quickActions.filter(action => {
    if (currentUserRole !== "Manager" && currentUserRole !== "Admin") {
      if (action.label === "Add Expense") return false;
    }
    return true;
  });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Quick Action Overlay */}
      <AnimatePresence>
        {fabOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setFabOpen(false)}
            />
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-[88px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5"
            >
              {filteredQuickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => {
                    setFabOpen(false);
                    router.push(action.href);
                  }}
                  className={cn(
                    "px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg active:scale-95 transition-transform whitespace-nowrap",
                    action.color
                  )}
                >
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className="mx-3 mb-3 bg-background/70 backdrop-blur-3xl border border-border/40 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.35)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-around h-[68px] px-1">
          {/* Left nav items */}
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-pill"
                    className="absolute inset-1 bg-primary/12 rounded-xl border border-primary/25"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <item.icon className={cn(
                  "w-[22px] h-[22px] relative z-10 transition-all duration-300", 
                  isActive 
                    ? "text-primary drop-shadow-[0_0_10px_rgba(202,138,4,0.6)]" 
                    : "text-muted-foreground group-hover:text-foreground group-active:scale-90"
                )} />
                <span className={cn(
                  "text-[10px] font-semibold relative z-10 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center FAB */}
          <div className="relative flex items-center justify-center w-full">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setFabOpen(!fabOpen)}
              className={cn(
                "relative -mt-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                fabOpen
                  ? "bg-foreground/90 text-background rotate-45 shadow-xl"
                  : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_4px_20px_rgba(202,138,4,0.4)]"
              )}
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Right nav items */}
          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1 group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-pill"
                    className="absolute inset-1 bg-primary/12 rounded-xl border border-primary/25"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <item.icon className={cn(
                  "w-[22px] h-[22px] relative z-10 transition-all duration-300", 
                  isActive 
                    ? "text-primary drop-shadow-[0_0_10px_rgba(202,138,4,0.6)]" 
                    : "text-muted-foreground group-hover:text-foreground group-active:scale-90"
                )} />
                <span className={cn(
                  "text-[10px] font-semibold relative z-10 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
