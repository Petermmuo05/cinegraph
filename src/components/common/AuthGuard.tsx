"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Film, Loader2 } from "lucide-react";
import { useUser } from "@/lib/user-store";
import Header from "@/components/common/Header";
import FloatingDock from "@/components/common/FloatingDock";
import SearchModal from "@/components/common/SearchModal";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, authLoading, currentUser } = useUser();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const isLoginPage = pathname === "/login";
  const isUserAuthenticated = isAuthenticated && currentUser && currentUser.id !== "guest";

  useEffect(() => {
    if (authLoading) return;

    if (!isUserAuthenticated && !isLoginPage) {
      router.replace("/login");
    } else if (isUserAuthenticated && isLoginPage) {
      router.replace("/");
    }
  }, [authLoading, isUserAuthenticated, isLoginPage, router]);

  // 1. If currently on /login page
  if (isLoginPage) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#040D0A]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      );
    }
    // If logged in, waiting for redirect to /
    if (isUserAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#040D0A]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      );
    }
    // Render clean login page
    return <>{children}</>;
  }

  // 2. If checking auth for protected page
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040D0A] gap-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px] shadow-neon-emerald animate-pulse">
          <div className="w-full h-full bg-[#040D0A] rounded-[14px] flex items-center justify-center">
            <Film className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>Securing graph session...</span>
        </div>
      </div>
    );
  }

  // 3. If unauthenticated on protected page, show redirecting state
  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040D0A] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="text-xs text-white/50">Redirecting to Sign In...</span>
      </div>
    );
  }

  // 4. Authenticated user viewing protected application
  return (
    <>
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1 pb-28 md:pb-24">{children}</main>
      <FloatingDock />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
