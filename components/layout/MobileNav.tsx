"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BedDouble, ReceiptText, UsersRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Billing", icon: ReceiptText, href: "/billing" },
  { label: "Rooms", icon: BedDouble, href: "/rooms" },
  { label: "Guests", icon: UsersRound, href: "/guests" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-3 mb-3 bg-background/70 backdrop-blur-3xl border border-border/40 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.35)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-around h-[68px] px-1">
          {navItems.map((item) => {
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
