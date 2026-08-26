"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Check,
  Flame,
  Atom,
  Palette,
  ShieldAlert,
  Search,
  ArrowRight,
  Network,
  Loader2,
} from "lucide-react";
import { useUser } from "@/lib/user-store";
import { MovieNode } from "@/types";

interface TasteOnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

const ONBOARDING_GENRES = [
  { id: "g-scifi", name: "Science Fiction", icon: "🌌" },
  { id: "g-action", name: "Action", icon: "⚡" },
  { id: "g-drama", name: "Drama", icon: "🎭" },
  { id: "g-crime", name: "Crime", icon: "🕵️" },
  { id: "g-thriller", name: "Thriller", icon: "👁️" },
  { id: "g-animation", name: "Animation", icon: "✨" },
  { id: "g-adventure", name: "Adventure", icon: "🧭" },
  { id: "g-mystery", name: "Mystery", icon: "🔍" },
  { id: "g-fantasy", name: "Fantasy", icon: "🪄" },
  { id: "g-comedy", name: "Comedy", icon: "😄" },
];

const ONBOARDING_MOODS = [
  { id: "Mind-Bending", label: "Mind-Bending & Temporal", desc: "Non-linear timelines, Inception, Interstellar", icon: Atom, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
  { id: "Adrenaline", label: "High-Stakes Adrenaline", desc: "The Dark Knight, Heists, High Octane", icon: Flame, color: "from-red-500/20 to-amber-500/20 border-red-500/30" },
  { id: "Indie Surreal", label: "A24 Surrealism & Multiverse", desc: "Everything Everywhere, Poetic Cinema", icon: Palette, color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
  { id: "Crime Noir", label: "Dark Neo-Noir & Mob Crime", desc: "Scorsese, The Godfather, Moral Ambiguity", icon: ShieldAlert, color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30" },
];

export default function TasteOnboardingWizard({ isOpen, onComplete }: TasteOnboardingWizardProps) {
  const { setSelectedMood, tuneTastePreferences } = useUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectedMood, setLocalMood] = useState<string>("Mind-Bending");
  const [searchFilter, setSearchFilter] = useState("");
  const [dbMovies, setDbMovies] = useState<MovieNode[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Fetch exactly 20 landmark movies from CognoDB for the onboarding grid
  useEffect(() => {
    async function loadOnboardingCatalog() {
      try {
        setLoadingMovies(true);
        const res = await fetch("/api/movies?limit=20");
        const data = await res.json();
        if (data.movies && data.movies.length > 0) {
          setDbMovies(data.movies);
        }
      } catch (err) {
        console.error("Failed to load onboarding movies from CognoDB:", err);
      } finally {
        setLoadingMovies(false);
      }
    }
    if (isOpen) {
      loadOnboardingCatalog();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleGenre = (name: string) => {
    setSelectedGenres((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const toggleMovie = (id: string) => {
    setSelectedMovies((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setSelectedMood(selectedMood);
      tuneTastePreferences(selectedGenres, selectedMovies);
      setIsCompiling(false);
      onComplete();
    }, 1600);
  };

  const filteredMovies = dbMovies.filter((m) =>
    m.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Background Dark Blur */}
      <div className="fixed inset-0 bg-[#040D0A]/95 backdrop-blur-2xl" />

      {/* Main Container */}
      <div className="relative w-full max-w-3xl rounded-[36px] glass-card border border-emerald-500/30 p-6 sm:p-10 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto">
        {isCompiling ? (
          /* Graph Compilation Animation */
          <div className="py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center shadow-neon-emerald">
                <Network className="w-9 h-9 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Finding the Best Movies For You...
              </h3>
              <p className="text-sm text-emerald-400/80 font-mono">
                Connecting your taste with thousands of top-rated films and creators
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Steps Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Personalize Your Movie Taste
                  </h2>
                  <p className="text-xs text-white/60">
                    Step {step} of 3 • Setting up your personalized recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === step
                        ? "w-6 bg-emerald-400 shadow-neon-emerald"
                        : s < step
                        ? "w-3 bg-emerald-600"
                        : "w-3 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Select Genres */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">
                    What are your favorite movie genres?
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Select 2 or more genres ({selectedGenres.length} selected)
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {ONBOARDING_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g.name);

                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(g.name)}
                        className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-400 text-white shadow-neon-emerald ring-1 ring-emerald-400"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="text-2xl">{g.icon}</span>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold truncate">{g.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Favorite Movies */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Select movies you&apos;ve enjoyed
                    </h3>
                    <p className="text-xs text-white/60">
                      Pick films you love to help us recommend great matches ({selectedMovies.length} chosen)
                    </p>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search movies..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Poster Grid */}
                {loadingMovies ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-emerald-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Popular Movies...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-1">
                    {filteredMovies.map((movie) => {
                      const isSelected = selectedMovies.includes(movie.id);

                      return (
                        <button
                          key={movie.id}
                          onClick={() => toggleMovie(movie.id)}
                          className={`group relative rounded-2xl overflow-hidden aspect-[2/3] border transition-all ${
                            isSelected
                              ? "ring-2 ring-emerald-400 border-emerald-400 shadow-neon-emerald scale-[0.98]"
                              : "border-white/15 opacity-75 hover:opacity-100 hover:border-white/40"
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
                            <span className="text-[9px] text-accent-gold font-bold">⭐ {movie.imdbRating}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Select Current Vibe */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">
                    What kind of movies do you feel like watching?
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Choose a vibe to tailor your recommendations
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ONBOARDING_MOODS.map((m) => {
                    const isSelected = selectedMood === m.id;
                    const Icon = m.icon;

                    return (
                      <button
                        key={m.id}
                        onClick={() => setLocalMood(m.id)}
                        className={`p-4 rounded-3xl text-left transition-all border relative overflow-hidden flex items-start gap-3.5 bg-gradient-to-br ${
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
            )}

            {/* Footer Navigation Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="px-3 py-1.5 rounded-full text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Skip for Now
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as any)}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build My Recommendations</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
