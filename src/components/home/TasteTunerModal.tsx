"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Sparkles, Check, SlidersHorizontal, Flame, Atom, ShieldAlert, Palette } from "lucide-react";
import { useUser } from "@/lib/user-store";
import seedData from "../../../scripts/seed-data.json";

export default function TasteTunerModal() {
  const { isTasteModalOpen, setIsTasteModalOpen, selectedMood, setSelectedMood, likedMovies, toggleLike } = useUser();

  const moods = [
    { id: "Mind-Bending", label: "Mind-Bending", desc: "Non-linear timelines, Inception & Nolan", icon: Atom, color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30" },
    { id: "Adrenaline", label: "Adrenaline", desc: "High-octane action, Dark Knight & Heists", icon: Flame, color: "from-red-500/20 to-amber-500/20 border-red-500/30" },
    { id: "Indie Surreal", label: "A24 Surrealism", desc: "Everything Everywhere & poetic cinema", icon: Palette, color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
    { id: "Crime Noir", label: "Crime Noir", desc: "Scorsese, The Godfather & Antiheroes", icon: ShieldAlert, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
  ];

  if (!isTasteModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setIsTasteModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-[36px] glass-card border border-white/20 p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Tune Recommendation Engine</h2>
              <p className="text-xs text-white/60">Choose your current cinematic vibe or seed your favorite films.</p>
            </div>
          </div>

          <button
            onClick={() => setIsTasteModalOpen(false)}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mood Archetype Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Select Your Current Vibe
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moods.map((m) => {
              const isSelected = selectedMood === m.id;
              const Icon = m.icon;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border relative overflow-hidden flex items-start gap-3 bg-gradient-to-br ${
                    isSelected
                      ? `${m.color} ring-2 ring-emerald-400 shadow-neon-emerald`
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.label}</h4>
                    <p className="text-[11px] text-white/60 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorite Movie Multi-Picker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Seed Titles You Love ({likedMovies.length} selected)
            </label>
            <span className="text-[11px] text-white/50">Click to toggle</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {seedData.movies.map((movie) => {
              const isSelected = likedMovies.includes(movie.id);

              return (
                <button
                  key={movie.id}
                  onClick={() => toggleLike(movie.id)}
                  className={`relative rounded-2xl overflow-hidden aspect-[2/3] border transition-all group ${
                    isSelected
                      ? "ring-2 ring-emerald-400 border-emerald-400 shadow-neon-emerald scale-[0.98]"
                      : "border-white/15 opacity-70 hover:opacity-100 hover:border-white/40"
                  }`}
                >
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-black shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="text-[11px] font-bold text-white line-clamp-1">{movie.title}</p>
                    <span className="text-[9px] text-white/60">{movie.releaseYear}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply Action */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-emerald-400/80">
            ⚡ Live CognoDB graph traversals will update instantly.
          </p>

          <button
            onClick={() => setIsTasteModalOpen(false)}
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
