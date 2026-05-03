"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BedDouble, UsersRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Rooms", icon: BedDouble, href: "/rooms" },
  { label: "Guests", icon: UsersRound, href: "/guests" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-5 left-4 right-4 z-50 bg-background/60 backdrop-blur-2xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-primary/15 rounded-xl m-1 border border-primary/30 shadow-[inset_0_0_12px_rgba(202,138,4,0.1)]"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 relative z-10 transition-colors duration-300", 
                isActive ? "text-primary drop-shadow-[0_0_8px_rgba(202,138,4,0.5)]" : "text-muted-foreground hover:text-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium relative z-10 transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
