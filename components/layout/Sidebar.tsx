"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BedDouble, 
  ReceiptText, 
  UsersRound, 
  WalletCards, 
  LineChart, 
  Settings, 
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotel } from "@/app/context/HotelContext";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Billing", icon: ReceiptText, href: "/billing" },
  { label: "Rooms", icon: BedDouble, href: "/rooms" },
  { label: "Guests", icon: UsersRound, href: "/guests" },
  { label: "Staff", icon: Users, href: "/staff" },
  { label: "Expenses", icon: WalletCards, href: "/expenses" },
  { label: "Profit", icon: LineChart, href: "/profit" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { hotelName } = useHotel();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-3 truncate">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
            <span className="text-primary-foreground text-xs font-black">{hotelName.charAt(0)}</span>
          </div>
          <span className="truncate">{hotelName}</span>
        </h1>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_var(--primary)]" 
                  : "text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-primary drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-muted-foreground")} />
              {route.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 h-screen glass border-r border-border flex flex-col hidden md:flex transition-all duration-300 z-10 shrink-0">
      <SidebarContent />
    </aside>
  );
}
