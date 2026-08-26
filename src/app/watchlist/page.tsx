"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  Star,
  Trash2,
  Film,
  Network,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useUser } from "@/lib/user-store";
import { MovieNode } from "@/types";

export default function WatchlistPage() {
  const { currentUser, watchlist, likedMovies, userRatings, toggleWatchlist, toggleLike } = useUser();
  const [activeTab, setActiveTab] = useState<"watchlist" | "liked">("watchlist");
  const [catalog, setCatalog] = useState<MovieNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch("/api/movies?limit=100");
        const data = await res.json();
        if (data.movies) {
          setCatalog(data.movies);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const watchlistedMovies = catalog.filter((m) => watchlist.includes(m.id));
  const favoritedMovies = catalog.filter((m) => likedMovies.includes(m.id));
  const displayedMovies = activeTab === "watchlist" ? watchlistedMovies : favoritedMovies;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300 select-none">
      {/* Header Profile & Overview */}
      <div className="p-6 sm:p-8 rounded-[36px] glass-card border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-emerald-400 shadow-neon-emerald flex-shrink-0">
            <Image src={currentUser.avatarUrl} alt={currentUser.username} fill className="object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {currentUser.username}&rsquo;s Cinema Vault
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentUser.favoriteGenre} Devotee
              </span>
            </div>
            <p className="text-xs text-white/60">
              Your personalized graph repository powering real-time openCypher recommendations.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="px-4 py-2 text-center border-r border-white/10">
            <span className="text-lg font-bold text-emerald-400">{watchlist.length}</span>
            <p className="text-[10px] text-white/50 uppercase font-semibold">Watchlist</p>
          </div>
          <div className="px-4 py-2 text-center border-r border-white/10">
            <span className="text-lg font-bold text-rose-400">{likedMovies.length}</span>
            <p className="text-[10px] text-white/50 uppercase font-semibold">Liked</p>
          </div>
          <div className="px-4 py-2 text-center">
            <span className="text-lg font-bold text-accent-gold">{Object.keys(userRatings).length}</span>
            <p className="text-[10px] text-white/50 uppercase font-semibold">Rated</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left List + Right Graph Taste Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Movies List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "watchlist"
                    ? "bg-emerald-500 text-black shadow-neon-emerald"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Watchlist ({watchlistedMovies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("liked")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "liked"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Liked Titles ({favoritedMovies.length})</span>
              </button>
            </div>

            <Link
              href="/recommendations"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Explore Recs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List Display */}
          {loading ? (
            <div className="p-12 text-center text-white/50 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Querying CognoDB Cinema Vault...</span>
            </div>
          ) : displayedMovies.length === 0 ? (
            <div className="p-12 rounded-[32px] glass-card text-center space-y-3">
              <Film className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-base font-bold text-white">Your list is currently empty</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Explore the discover feed or search for movies to seed your taste graph.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-xs shadow-neon-emerald mt-2"
              >
                <span>Browse Discover Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-4 rounded-3xl glass-card hover:border-emerald-500/40 border border-white/10 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-16 h-22 rounded-2xl overflow-hidden flex-shrink-0 border border-white/15">
                      <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-bold text-accent-gold">
                          <Star className="w-3 h-3 fill-current" />
                          IMDb {movie.imdbRating}
                        </span>
                        <span className="text-white/50 text-[11px]">• {movie.releaseYear}</span>
                        <span className="text-white/40 text-[11px]">• {movie.runtime} min</span>
                      </div>

                      <Link href={`/movie/${movie.id}`}>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {movie.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-white/60 line-clamp-1 max-w-md">
                        {movie.plotSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <Link
                      href={`/graph?nodeId=${movie.id}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-300 transition-colors"
                      title="View in Knowledge Graph"
                    >
                      <Network className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => activeTab === "watchlist" ? toggleWatchlist(movie.id) : toggleLike(movie.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Visual Graph Taste Radar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Graph Taste Radar
              </h3>
            </div>

            {/* Dominant Genres */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Dominant Genre Clusters
              </label>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/80">Sci-Fi & Cyberpunk</span>
                    <span className="text-emerald-400 font-mono">55%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[55%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/80">Drama & Tension</span>
                    <span className="text-cyan-400 font-mono">30%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[30%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/80">Crime & Neo-Noir</span>
                    <span className="text-purple-400 font-mono">15%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full w-[15%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Recurring Directors */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Favorite Auteurs in Graph
              </label>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                  Christopher Nolan
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20">
                  Denis Villeneuve
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                  Martin Scorsese
                </span>
              </div>
            </div>

            {/* Dominant Tropes */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Key Narrative Tropes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Non-Linear Timeline", "Time Dilation", "Sentient AI", "Antihero", "Multiverse"].map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
