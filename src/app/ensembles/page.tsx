"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Star, Film, ArrowRight, Network, Sparkles, Award } from "lucide-react";
import { CollaboratorClique } from "@/types";

export default function EnsemblesPage() {
  const [cliques, setCliques] = useState<CollaboratorClique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCliques() {
      try {
        setLoading(true);
        const res = await fetch("/api/ensembles");
        const data = await res.json();
        setCliques(data);
      } catch (err) {
        console.error("Failed to load ensembles", err);
      } finally {
        setLoading(false);
      }
    }
    loadCliques();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Iconic Director & Actor Collaborations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Explore legendary creative partnerships and the acclaimed movies they created together.
        </p>
      </div>

      {/* Cliques Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-[32px] glass-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cliques.map((c, idx) => (
            <div
              key={idx}
              className="p-6 rounded-[32px] glass-card border border-white/15 hover:border-emerald-500/30 transition-all space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Header with 2 Person Avatars & Score */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 z-10">
                        <Image
                          src={c.director?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop"}
                          alt={c.director?.name || "Director"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-teal-300">
                        <Image
                          src={c.collaborator?.photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop"}
                          alt={c.collaborator?.name || "Collaborator"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white">
                        {c.director?.name} & {c.collaborator?.name}
                      </h3>
                      <span className="text-xs text-emerald-400 font-medium">
                        {c.collaborationsCount} Major Collaborations
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent-gold font-bold text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{c.avgRating}</span>
                    </div>
                    <span className="text-[10px] text-white/50">Avg IMDb Score</span>
                  </div>
                </div>

                {/* Collaborative Films List */}
                <div className="space-y-2 mt-4">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    Shared Filmography
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {c.movies.map((m) => (
                      <Link
                        key={m.id}
                        href={`/movie/${m.id}`}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-white/10 text-xs text-white/80 hover:text-emerald-300 transition-all flex items-center gap-1.5"
                      >
                        <Film className="w-3 h-3 text-emerald-400" />
                        <span>{m.title}</span>
                        <span className="text-[10px] text-white/40">({m.releaseYear})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <Link
                href={`/graph?nodeId=${c.director?.id}&name=${encodeURIComponent(c.director?.name || 'Director')}&type=Person`}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/15 text-white hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all group"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Explore in Graph</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
