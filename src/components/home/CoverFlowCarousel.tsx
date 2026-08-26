"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Calendar, Bookmark, Heart, Play, Sparkles, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { MovieNode } from "@/types";
import { useUser } from "@/lib/user-store";

interface CoverFlowCarouselProps {
  movies: MovieNode[];
  onSelectMovie?: (movie: MovieNode) => void;
}

export default function CoverFlowCarousel({ movies, onSelectMovie }: CoverFlowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { watchlist, likedMovies, toggleWatchlist, toggleLike } = useUser();

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!movies || movies.length === 0) return null;

  const activeMovie = movies[activeIndex];
  const isWatchlisted = watchlist.includes(activeMovie.id);
  const isLiked = likedMovies.includes(activeMovie.id);

  return (
    <div className="relative w-full py-4 overflow-hidden select-none">
      {/* 3D Perspective Stage */}
      <div
        className="relative h-[420px] sm:h-[480px] lg:h-[520px] flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {movies.map((movie, idx) => {
          // Calculate relative distance from active index
          let offset = idx - activeIndex;
          // Handle wrap-around for smooth looping
          if (offset > movies.length / 2) offset -= movies.length;
          if (offset < -movies.length / 2) offset += movies.length;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          // 3D Matrix Calculations
          const rotateY = offset * -28; // Tilted angle
          const translateX = offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 110 : 210);
          const translateZ = -Math.abs(offset) * 140;
          const scale = 1 - Math.abs(offset) * 0.16;
          const opacity = 1 - Math.abs(offset) * 0.35;
          const zIndex = 20 - Math.abs(offset);

          return (
            <motion.div
              key={movie.id}
              onClick={() => {
                if (!isCenter) setActiveIndex(idx);
                else if (onSelectMovie) onSelectMovie(movie);
              }}
              animate={{
                rotateY,
                x: translateX,
                z: translateZ,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
              className={`absolute w-[280px] sm:w-[380px] lg:w-[460px] h-[380px] sm:h-[440px] lg:h-[480px] rounded-[36px] overflow-hidden glass-card border border-white/25 cursor-pointer shadow-2xl transition-shadow ${
                isCenter ? "shadow-card-glow border-emerald-400/40 ring-1 ring-emerald-400/30" : "hover:border-white/40"
              }`}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Media Backdrop / Poster */}
              <Image
                src={movie.backdropUrl || movie.posterUrl}
                alt={movie.title}
                fill
                priority={isCenter}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040D0A] via-[#040D0A]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040D0A]/80 via-transparent to-transparent" />

              {/* Floating Top Match & Like Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/30 text-emerald-300 font-bold text-[11px] shadow-neon-emerald">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>98% Match</span>
                </div>

                {isCenter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(movie.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                      isLiked
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        : "bg-black/40 text-white/70 hover:text-white border-white/15"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                )}
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold font-bold text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    {movie.imdbRating}
                  </span>
                  <span className="text-white/70">{movie.releaseYear}</span>
                  <span className="text-white/50">• {movie.runtime} min</span>
                  <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    4K HDR
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-1">
                  {movie.title}
                </h2>

                <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-normal">
                  {movie.plotSummary}
                </p>

                {/* Center Action Controls */}
                {isCenter && (
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(movie.id);
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                        isWatchlisted
                          ? "bg-emerald-500 text-black border border-emerald-400 shadow-neon-emerald"
                          : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                      }`}
                    >
                      {isWatchlisted ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>In Watchlist</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Add to Watchlist</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/movie/${movie.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Details & Graph</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Floating Left / Right Chevrons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-30 p-3 rounded-full glass-dock text-white/80 hover:text-white hover:border-emerald-400/50 transition-all shadow-xl hover:scale-110"
          aria-label="Previous Movie"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-30 p-3 rounded-full glass-dock text-white/80 hover:text-white hover:border-emerald-400/50 transition-all shadow-xl hover:scale-110"
          aria-label="Next Movie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {movies.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === activeIndex ? "w-6 bg-emerald-400 shadow-neon-emerald" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
