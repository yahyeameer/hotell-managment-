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
        <div className="flex-1 flex flex-col min-h-screen min-h-dvh overflow-hidden w-full bg-background relative">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
          <div className="relative z-10 w-full flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </HotelProvider>
    );
  }

  return (
    <HotelProvider>
      {/* Ambient Premium Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] md:blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px] md:blur-[140px]" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen min-h-dvh">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-h-dvh overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background/40 backdrop-blur-3xl p-3 sm:p-4 md:p-8 lg:p-10 w-full pb-28 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    </HotelProvider>
  );
}
