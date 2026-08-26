"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Heart,
  Film,
  User,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useUser } from "@/lib/user-store";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, watchlist, setIsTasteModalOpen, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    router.push("/login");
  };

  const isUserLoggedIn = isAuthenticated && currentUser && currentUser.id !== "guest";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040D0A]/85 backdrop-blur-2xl border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-950 p-[1.5px] shadow-neon-emerald transition-transform group-hover:scale-105 flex-shrink-0">
              <div className="w-full h-full bg-[#040D0A] rounded-[14px] flex items-center justify-center">
                <Film className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-200 via-white to-emerald-400 bg-clip-text text-transparent">
                CineGraph
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                AI Recs
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 whitespace-nowrap">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === "/"
                  ? "bg-emerald-500 text-black font-bold shadow-neon-emerald"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Discover
            </Link>
            <Link
              href="/watchlist"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/watchlist"
                  ? "bg-emerald-500 text-black font-bold shadow-neon-emerald"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    pathname === "/watchlist"
                      ? "bg-black/30 text-black"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {watchlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/recommendations"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/recommendations"
                  ? "bg-emerald-500 text-black font-bold shadow-neon-emerald"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>For You</span>
            </Link>
            <Link
              href="/graph"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === "/graph"
                  ? "bg-emerald-500 text-black font-bold shadow-neon-emerald"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Graph View
            </Link>
          </nav>
        </div>

        {/* Right: Quick Search, Taste Tuner & Profile */}
        <div className="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-all shadow-sm flex-shrink-0"
            title="Search movies, cast, genres (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline px-1.5 py-0.5 text-[9px] font-mono bg-black/40 rounded border border-white/15 text-white/40">
              ⌘K
            </kbd>
          </button>

          {/* Live DB Ping Pill */}
          <StatusBadge />

          {/* User Profile or Sign In Button */}
          {isUserLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all flex-shrink-0"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-400/60">
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-white/90 hidden sm:inline">
                  {currentUser.username.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>

              {/* Glassmorphic User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl glass-card border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  {/* Active User Header */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0">
                      <Image
                        src={currentUser.avatarUrl}
                        alt={currentUser.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">
                        {currentUser.username}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono truncate">
                        {currentUser.favoriteGenre} • {currentUser.tasteArchetype}
                      </div>
                    </div>
                  </div>

                  {/* Authenticated User Menu Actions */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsTasteModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-left text-xs font-medium text-white/80 flex items-center gap-2 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tune Taste Preferences</span>
                    </button>

                    <Link
                      href="/watchlist"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-left text-xs font-medium text-white/80 flex items-center gap-2 transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-accent-gold" />
                      <span>My Watchlist ({watchlist.length})</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-left text-xs font-semibold text-rose-400 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs shadow-neon-emerald transition-all flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
