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
import { Logo } from "@/components/ui/logo";

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
  const { hotelName, currentUserRole } = useHotel();

  const visibleRoutes = routes.filter(r => {
    if (currentUserRole === "Staff" && (r.label === "Expenses" || r.label === "Profit")) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
        <Logo hotelName={hotelName} iconSize="md" className="w-full truncate" />
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {visibleRoutes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_12px_rgba(202,138,4,0.1)]" 
                  : "text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <route.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(202,138,4,0.5)]" : "text-muted-foreground")} />
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
    <aside className="w-64 h-screen bg-background/40 backdrop-blur-3xl border-r border-border/50 flex flex-col hidden md:flex transition-all duration-300 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <SidebarContent />
    </aside>
  );
}
