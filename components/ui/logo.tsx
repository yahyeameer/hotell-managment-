"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotel } from "@/app/context/HotelContext";

interface LogoProps {
  hotelName: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ hotelName, className, iconSize = "md", showText = true }: LogoProps) {
  // Use a try-catch or safe access since Logo might be used in places where Context is missing in some edge cases
  let contextLogoUrl = null;
  try {
    const context = useHotel();
    contextLogoUrl = context.logoUrl;
  } catch (e) {
    // Ignore if not wrapped
  }

  const sizeClasses = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative flex items-center justify-center bg-gradient-to-br from-[#CA8A04] to-[#FCD34D] shadow-[0_0_20px_rgba(202,138,4,0.4)] overflow-hidden shrink-0 border border-yellow-300/30",
        sizeClasses[iconSize]
      )}>
        {contextLogoUrl ? (
          <img src={contextLogoUrl} alt="Hotel Logo" className="w-full h-full object-cover z-10" />
        ) : (
          <>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] skew-x-12" />
            <Crown className={cn("text-yellow-950 drop-shadow-md z-10", iconSizeClasses[iconSize])} />
          </>
        )}
      </div>
      
      {showText && (
        <span className={cn(
          "font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-primary/80 truncate",
          textClasses[iconSize]
        )}>
          {hotelName}
        </span>
      )}
    </div>
  );
}
