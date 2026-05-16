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
        {children}
      </HotelProvider>
    );
  }

  return (
    <HotelProvider>
      {/* Ambient Premium Background — subtle, performant */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/8 blur-[120px] md:blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/6 blur-[120px] md:blur-[160px]" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen min-h-dvh">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-h-dvh overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-xl p-3 sm:p-4 md:p-8 lg:p-10 w-full pb-28 md:pb-8">
            <div className="max-w-7xl mx-auto animate-slide-up">
              {children}
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    </HotelProvider>
  );
}
