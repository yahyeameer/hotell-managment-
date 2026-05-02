"use client";

import { HotelProvider } from "./context/HotelContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePathname } from "next/navigation";


export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <HotelProvider>
        <div className="flex-1 flex flex-col min-h-screen min-h-dvh overflow-hidden w-full bg-background">
          {children}
        </div>
      </HotelProvider>
    );
  }

  return (
    <HotelProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-h-dvh overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background/50 p-3 sm:p-4 md:p-6 w-full pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </HotelProvider>
  );
}
