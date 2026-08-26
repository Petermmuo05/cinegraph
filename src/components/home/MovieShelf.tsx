"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import MovieCard from "@/components/common/MovieCard";
import { MovieNode } from "@/types";

interface MovieShelfProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  movies: (MovieNode & { matchScore?: number; socialTag?: string; reason?: string })[];
  seeAllHref?: string;
}

export default function MovieShelf({
  title,
  subtitle,
  icon,
  movies,
  seeAllHref,
}: MovieShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -460 : 460;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-3.5 select-none">
      {/* Shelf Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-white/60 mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mr-2 transition-colors"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Left / Right Scroll buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleScroll("left")}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start flex-shrink-0">
            <MovieCard
              movie={movie}
              matchScore={movie.matchScore}
              socialTag={movie.socialTag}
              reason={movie.reason}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
