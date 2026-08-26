"use client";

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Network, Film, GitMerge, Calendar, Loader2 } from "lucide-react";
import { PersonNode, MovieNode } from "@/types";

interface PersonDetailState {
  person: PersonNode;
  directedMovies: MovieNode[];
  actedMovies: { movie: MovieNode; role: string }[];
}

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PersonDetailState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPersonDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/person/${encodeURIComponent(id)}`);
        if (!res.ok) {
          throw new Error("Person not found in database");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load person profile");
      } finally {
        setLoading(false);
      }
    }
    loadPersonDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-sm text-white/60">Fetching person node and filmography from CognoDB...</p>
      </div>
    );
  }

  if (error || !data || !data.person) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Person Not Found</h2>
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

  const { person, directedMovies, actedMovies } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <Link
        href="/ensembles"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Ensembles</span>
      </Link>

      {/* Person Bio Card */}
      <div className="p-8 rounded-[36px] glass-card border border-white/20 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-emerald-400/50 shadow-neon-emerald flex-shrink-0">
          <Image src={person.photoUrl} alt={person.name} fill className="object-cover" />
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
              {person.primaryRole}
            </span>
            {person.bornYear && (
              <span className="text-white/60 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Born {person.bornYear}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {person.name}
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
            {person.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <Link
              href={`/graph?nodeId=${person.id}&name=${encodeURIComponent(person.name)}&type=Person`}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
            >
              <Network className="w-4 h-4" />
              <span>Explore Connections in Graph</span>
            </Link>

            <Link
              href={`/path-finder?from=${encodeURIComponent(person.name)}`}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>Find Connections to Other Actors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filmography Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-400" />
          <span>Filmography & Featured Movies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {directedMovies.map((m) => (
            <Link
              key={m.id}
              href={`/movie/${m.id}`}
              className="p-4 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
            >
              <div className="relative w-14 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={m.posterUrl} alt={m.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {m.title}
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium">Director • {m.releaseYear}</span>
              </div>
            </Link>
          ))}

          {actedMovies.map((a) => (
            <Link
              key={a.movie.id}
              href={`/movie/${a.movie.id}`}
              className="p-4 rounded-3xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
            >
              <div className="relative w-14 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={a.movie.posterUrl} alt={a.movie.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {a.movie.title}
                </h3>
                <span className="text-[11px] text-white/50">as {a.role} • {a.movie.releaseYear}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
