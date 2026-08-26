"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Bookmark, Heart, Sparkles, Check, Play, ArrowRight, Users } from "lucide-react";
import { MovieNode } from "@/types";
import { useUser } from "@/lib/user-store";

interface MovieCardProps {
  movie: MovieNode;
  matchScore?: number;
  socialTag?: string;
  reason?: string;
  onSelect?: () => void;
}

export default function MovieCard({
  movie,
  matchScore,
  socialTag,
  reason,
  onSelect,
}: MovieCardProps) {
  const { watchlist, likedMovies, toggleWatchlist, toggleLike } = useUser();
  const isWatchlisted = watchlist.includes(movie.id);
  const isLiked = likedMovies.includes(movie.id);

  return (
    <div
      onClick={onSelect}
      className="group relative w-[200px] sm:w-[230px] lg:w-[250px] rounded-[30px] overflow-hidden glass-card border border-white/15 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-card-glow hover:-translate-y-1.5 flex flex-col justify-between flex-shrink-0 cursor-pointer select-none"
    >
      <div>
        {/* Media Poster */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091A14] via-[#091A14]/20 to-transparent" />

          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/30 text-emerald-300 font-bold text-[10px] shadow-neon-emerald">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>{matchScore}% Match</span>
            </div>
          )}

          {/* Quick Action Overlay Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(movie.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                isLiked ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-black/50 text-white/80 hover:text-white border-white/20"
              }`}
              title="Like movie"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(movie.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                isWatchlisted ? "bg-emerald-500 text-black border-emerald-400" : "bg-black/50 text-white/80 hover:text-white border-white/20"
              }`}
              title="Add to watchlist"
            >
              {isWatchlisted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Social Proof Tag */}
          {socialTag && (
            <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/80">
              <Users className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{socialTag}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-accent-gold font-bold text-xs">
              <Star className="w-3 h-3 fill-current" />
              {movie.imdbRating}
            </span>
            <span className="text-white/50 text-[11px]">{movie.releaseYear}</span>
            <span className="text-white/40 text-[10px]">• {movie.runtime}m</span>
          </div>

          <h3 className="font-bold text-sm text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
            {movie.title}
          </h3>

          {reason && (
            <p className="text-[10px] text-emerald-400/90 line-clamp-1 font-medium">
              {reason}
            </p>
          )}
        </div>
      </div>

      {/* Footer Details Action */}
      <div className="px-4 pb-4">
        <Link
          href={`/movie/${movie.id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-white/10 text-white hover:text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Explore Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
