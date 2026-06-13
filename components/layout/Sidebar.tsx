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
  { label: "Muraayadda", filterKey: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Qaansheegta", filterKey: "Billing", icon: ReceiptText, href: "/billing" },
  { label: "Qolalka", filterKey: "Rooms", icon: BedDouble, href: "/rooms" },
  { label: "Martida", filterKey: "Guests", icon: UsersRound, href: "/guests" },
  { label: "Shaqaalaha", filterKey: "Staff", icon: Users, href: "/staff" },
  { label: "Kharashaadka", filterKey: "Expenses", icon: WalletCards, href: "/expenses" },
  { label: "Macaashka", filterKey: "Profit", icon: LineChart, href: "/profit" },
  { label: "Nidaaminta", filterKey: "Settings", icon: Settings, href: "/settings" },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { hotelName, currentUserRole } = useHotel();

  const visibleRoutes = routes.filter(r => {
    if (currentUserRole !== "Admin") {
      if (["Expenses", "Profit", "Staff", "Settings"].includes(r.filterKey)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl">
      <div className="h-[72px] flex items-center px-6 border-b border-border/40 shrink-0">
        <Logo hotelName={hotelName} iconSize="md" className="w-full truncate" />
      </div>
      <div className="flex-1 py-5 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-hide">
        {visibleRoutes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary/12 text-primary shadow-[0_2px_12px_rgba(202,138,4,0.1)]" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.97]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(202,138,4,0.4)]" />
              )}
              <route.icon className={cn(
                "w-[18px] h-[18px] transition-all duration-300 shrink-0", 
                isActive 
                  ? "text-primary drop-shadow-[0_0_8px_rgba(202,138,4,0.5)]" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className="truncate">{route.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Bottom branding */}
      <div className="px-5 py-4 border-t border-border/30">
        <p className="text-[10px] text-muted-foreground/50 font-medium tracking-wider uppercase">Maamulka Huteelka v2.0</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen bg-card/40 backdrop-blur-3xl border-r border-border/30 flex flex-col hidden md:flex transition-all duration-300 z-10 shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.03)]">
      <SidebarContent />
    </aside>
  );
}
