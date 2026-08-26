"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Sparkles, Network, ArrowRight, Layers } from "lucide-react";
import { RecommendationResult } from "@/types";

interface RecCardProps {
  rec: RecommendationResult;
}

export default function RecCard({ rec }: RecCardProps) {
  const { movie, affinityScore, director, actors, tropes, reason, connectedFrom, graphPathHops } = rec;

  return (
    <div className="group relative rounded-[32px] glass-card overflow-hidden transition-all duration-300 hover:shadow-card-glow hover:-translate-y-1.5 flex flex-col justify-between">
      <div>
        {/* Media Poster Header */}
        <div className="relative w-full h-56 overflow-hidden">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091A14] via-[#091A14]/30 to-transparent" />

          {/* Match Score Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 text-emerald-300 font-bold text-xs shadow-neon-emerald">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{affinityScore}% Match</span>
          </div>

          {/* Hops Indicator */}
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 text-[11px] font-mono">
            {graphPathHops}-Hop Traversal
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-xs font-bold text-accent-gold">
                <Star className="w-3 h-3 fill-current" />
                {movie.imdbRating}
              </span>
              <span className="text-white/50 text-xs">• {movie.releaseYear}</span>
              <span className="text-white/50 text-xs">• {movie.runtime} min</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
              {movie.title}
            </h3>
          </div>
        </div>

        {/* Card Content & Explainable Path */}
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
            {movie.plotSummary}
          </p>

          {/* Graph Path Explanation Box */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              <Network className="w-3.5 h-3.5" />
              <span>Graph Path Rationale</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {reason}
            </p>

            {/* Connective Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {director && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                  Dir: {director}
                </span>
              )}
              {tropes.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-medium border border-purple-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 pt-0">
        <Link
          href={`/graph?nodeId=${movie.id}&name=${encodeURIComponent(movie.title)}&type=Movie`}
          className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/15 text-white hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all group/btn"
        >
          <span>Visualize In Graph</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
