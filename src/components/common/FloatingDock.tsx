"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sparkles, Bookmark, Network, Terminal } from "lucide-react";
import { useUser } from "@/lib/user-store";

export default function FloatingDock() {
  const pathname = usePathname();
  const { watchlist } = useUser();

  const items = [
    { href: "/", label: "Discover", icon: Home },
    { href: "/recommendations", label: "For You", icon: Sparkles },
    { href: "/watchlist", label: "Watchlist", icon: Bookmark, badge: watchlist.length },
    { href: "/graph", label: "Graph View", icon: Network },
    { href: "/inspector", label: "Cypher", icon: Terminal },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] pointer-events-auto select-none">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-dock px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-2xl border border-white/20 whitespace-nowrap overflow-x-auto scrollbar-none"
      >
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold transition-all group flex-shrink-0 whitespace-nowrap"
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-teal-500/20 border border-emerald-400/50 shadow-neon-emerald"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 relative z-10 flex-shrink-0 ${
                  isActive ? "text-emerald-300" : "text-white/70 group-hover:text-white"
                }`}
              />
              <span
                className={`relative z-10 hidden sm:inline whitespace-nowrap transition-colors ${
                  isActive ? "text-white font-bold" : "text-white/60 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-bold flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
