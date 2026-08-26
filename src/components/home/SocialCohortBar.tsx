"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Eye, Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@/lib/user-store";

export default function SocialCohortBar() {
  const { currentUser, likedMovies } = useUser();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunity() {
      try {
        setLoading(true);
        const res = await fetch(`/api/community?userId=${encodeURIComponent(currentUser.id)}`);
        const data = await res.json();
        if (data.cohorts && data.cohorts.length > 0) {
          setCohorts(data.cohorts);
        }
      } catch (err) {
        console.error("Failed to load community cohorts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, [currentUser.id, likedMovies]);

  return (
    <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-4 shadow-xl select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              Connected Cinephiles in Your Graph
            </h3>
            <p className="text-xs text-white/50">
              Peers with matching openCypher rating paths are currently exploring:
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live Community Feed
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-white/50 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Tracing Connected Cinephiles in CognoDB...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {cohorts.map((c, idx) => (
            <Link
              key={`${c.userId || c.username}-${c.movieId}-${idx}`}
              href={`/movie/${c.movieId}`}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-white/10 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400/60 flex-shrink-0">
                  <Image src={c.avatarUrl} alt={c.username} fill className="object-cover" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                    {c.username}
                  </h4>
                  <p className="text-[11px] text-white/60 line-clamp-1">
                    Watching: <strong className="text-white/90">{c.watchingMovie}</strong>
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {c.sharedCount} shared favorite{c.sharedCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Viewers / Overlap Pill */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-white/80 font-semibold flex-shrink-0">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>{c.viewersCount}+</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
