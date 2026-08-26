"use client";

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft, Network, Sparkles, Tag, Users, Loader2 } from "lucide-react";
import { MovieNode, PersonNode, GenreNode, TropeNode, StudioNode } from "@/types";

interface MovieDetailState {
  movie: MovieNode;
  directors: PersonNode[];
  cast: { person: PersonNode; role: string }[];
  genres: GenreNode[];
  tropes: TropeNode[];
  studio?: StudioNode;
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<MovieDetailState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovieDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/movie/${encodeURIComponent(id)}`);
        if (!res.ok) {
          throw new Error("Movie not found in database");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    }
    loadMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-sm text-white/60">Fetching movie node and typed relationships from CognoDB...</p>
      </div>
    );
  }

  if (error || !data || !data.movie) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-white/50">{error || "Could not retrieve graph node."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const { movie, directors, cast, genres, tropes } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover</span>
      </Link>

      {/* Hero Movie Banner */}
      <div className="relative rounded-[36px] overflow-hidden glass-card border border-white/20 min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040D0A] via-[#040D0A]/60 to-transparent" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              IMDb {movie.imdbRating}
            </span>
            <span className="text-white/80 text-xs">{movie.releaseYear}</span>
            <span className="text-white/80 text-xs">• {movie.runtime} min</span>
            {movie.budget && (
              <span className="text-white/60 text-xs">• Budget: {movie.budget}</span>
            )}
            {movie.boxOffice && (
              <span className="text-emerald-400 text-xs font-semibold">• Gross: {movie.boxOffice}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {movie.title}
          </h1>

          {movie.tagline && (
            <p className="text-sm italic text-emerald-300 font-medium">
              &ldquo;{movie.tagline}&rdquo;
            </p>
          )}

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
            {movie.plotSummary}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/graph?nodeId=${movie.id}&name=${encodeURIComponent(movie.title)}&type=Movie`}
              className="px-5 sm:px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
            >
              <Network className="w-4 h-4" />
              <span>Explore Connections in Graph</span>
            </Link>

            <Link
              href={`/recommendations?movieId=${movie.id}&title=${encodeURIComponent(movie.title)}&genre=${encodeURIComponent(genres[0]?.name || "")}&director=${encodeURIComponent(directors[0]?.name || "")}&tropes=${encodeURIComponent(tropes.slice(0, 2).map(t => t.name).join(','))}`}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>Find Similar Movies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cast & Crew Box */}
        <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cast & Directors</h2>
          </div>

          {directors.map((d) => d && (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-400">
                  <Image src={d.photoUrl} alt={d.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{d.name}</h4>
                  <span className="text-[11px] text-emerald-400 font-medium">Director</span>
                </div>
              </div>
              <Link
                href={`/person/${d.id}`}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Profile ⟶
              </Link>
            </div>
          ))}

          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
              Lead Cast
            </label>
            <div className="grid grid-cols-1 gap-2">
              {cast.map((c) => c && (
                <div key={c.person.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400">
                      <Image src={c.person.photoUrl} alt={c.person.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.person.name}</h4>
                      <span className="text-[11px] text-white/50">as {c.role}</span>
                    </div>
                  </div>
                  <Link
                    href={`/person/${c.person.id}`}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Profile ⟶
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Themes & Genres */}
        <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Tag className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Genres & Themes</h2>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => g && (
                <span
                  key={g.id}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 block">
              Key Themes & Story Elements
            </label>
            <div className="space-y-2.5">
              {tropes.map((t) => t && (
                <div key={t.id} className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-300">{t.name}</h4>
                    <span className="text-[10px] text-white/40 uppercase">{t.category}</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
