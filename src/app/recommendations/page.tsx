"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Terminal, RefreshCw, Film } from "lucide-react";
import PersonaSelector from "@/components/recommendations/PersonaSelector";
import RecCard from "@/components/recommendations/RecCard";
import { RecommendationResult } from "@/types";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const initialMovieId = searchParams.get("movieId");
  const initialTitle = searchParams.get("title");
  const initialGenre = searchParams.get("genre");
  const initialDirector = searchParams.get("director");

  const [selectedUser, setSelectedUser] = useState("u-scifilover");
  const [movieContext, setMovieContext] = useState<{
    movieId?: string;
    title?: string;
    genre?: string;
    director?: string;
  } | null>(
    initialTitle
      ? {
          movieId: initialMovieId || undefined,
          title: initialTitle,
          genre: initialGenre || undefined,
          director: initialDirector || undefined,
        }
      : null
  );

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuery, setShowQuery] = useState(false);

  const fetchRecs = async (
    userId: string,
    ctx: { movieId?: string; title?: string; genre?: string; director?: string } | null = movieContext
  ) => {
    setLoading(true);
    try {
      let url = `/api/recommendations?userId=${encodeURIComponent(userId)}`;
      if (ctx) {
        if (ctx.movieId) url += `&movieId=${encodeURIComponent(ctx.movieId)}&excludeIds=${encodeURIComponent(ctx.movieId)}`;
        if (ctx.genre) url += `&genre=${encodeURIComponent(ctx.genre)}`;
        if (ctx.director) url += `&director=${encodeURIComponent(ctx.director)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendations(data.filter((r) => r && r.movie && r.movie.id));
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Failed to load recommendations", err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs(selectedUser, movieContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const handlePersonaSelect = (userId: string) => {
    setSelectedUser(userId);
    setMovieContext(null);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/recommendations");
    }
    fetchRecs(userId, null);
  };

  const handleResetToPersona = () => {
    setMovieContext(null);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/recommendations");
    }
    fetchRecs(selectedUser, null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Top Title & Explanations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Movie Recommendations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Discover handpicked movies based on your taste, and see exactly why each film is recommended for you.
          </p>
        </div>

        <button
          onClick={() => setShowQuery(!showQuery)}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showQuery ? "Hide Technical Query" : "View Technical Query"}</span>
        </button>
      </div>

      {/* Context Banner if navigated from a specific Movie OR Active Persona Banner */}
      {movieContext ? (
        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-accent-gold/40 bg-accent-gold/5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent-gold/15 text-accent-gold border border-accent-gold/30 flex-shrink-0">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                  Similar Movies
                </span>
                {movieContext.genre && <span className="text-xs text-white/60">• Genre: <strong className="text-white">{movieContext.genre}</strong></span>}
                {movieContext.director && <span className="text-xs text-white/60">• Director: <strong className="text-white">{movieContext.director}</strong></span>}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                Recommendations Based On: <span className="text-accent-gold font-extrabold">{movieContext.title}</span>
              </h2>
              <p className="text-xs text-white/60 line-clamp-1">
                Showing films with similar themes, storylines, and creative styles.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetToPersona}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>Show All Recommendations</span>
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-emerald-500/30 bg-emerald-950/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Taste Profile
                </span>
                <span className="text-xs text-white/50">• Real-Time Matching</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                Active Style: <span className="text-emerald-400 font-extrabold">
                  {selectedUser === "u-cinephile" ? "Crime & Classic Noir" : selectedUser === "u-indiebuff" ? "Indie & Surrealism" : "Sci-Fi & Mind-Bending"}
                </span>
              </h2>
              <p className="text-xs text-white/60 line-clamp-1">
                {selectedUser === "u-cinephile"
                  ? "Focused on gripping dialogues, iconic directors like Scorsese, and classic crime stories"
                  : selectedUser === "u-indiebuff"
                  ? "Focused on poetic indie gems, multiverse narratives, and unique visual styles"
                  : "Focused on cosmic scale, time dilation, and visionary directors like Nolan & Villeneuve"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 px-3 py-1 rounded-full bg-black/40 border border-emerald-500/30 self-start sm:self-auto flex-shrink-0">
            Graph Powered
          </span>
        </div>
      )}

      {/* Cypher Query Inspector Collapsible */}
      {showQuery && (
        <div className="p-5 rounded-3xl glass-card border border-cyan-500/30 bg-[#040D0A]/90 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400">
              Underlying Graph Query
            </span>
            <span className="text-[11px] text-white/40">Multi-Hop Traversal</span>
          </div>
          <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto p-3 rounded-2xl bg-black/50 border border-white/5 leading-relaxed">
{`MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[r:RATED]->(m:Movie)
WITH u, collect(DISTINCT m) AS userAnchors
MATCH (cohort:User)
WHERE cohort.id <> u.id AND (cohort.favoriteGenre = u.favoriteGenre OR cohort.tasteArchetype = u.tasteArchetype)
MATCH (cohort)-[recRel:RATED]->(rec:Movie)
WHERE NOT rec IN userAnchors AND recRel.rating >= 7.8
OPTIONAL MATCH (rec)<-[:DIRECTED]-(d:Person)
OPTIONAL MATCH (rec)-[:IN_GENRE]->(g:Genre)
OPTIONAL MATCH (rec)-[:HAS_TROPE]->(t:Trope)
RETURN rec, count(DISTINCT cohort) AS cohortCount
ORDER BY cohortCount DESC, rec.imdbRating DESC
LIMIT 8`}
          </pre>
        </div>
      )}

      {/* Taste Persona Selector */}
      <div className="p-6 rounded-[32px] glass-card border border-white/15">
        <PersonaSelector
          selectedUserId={selectedUser}
          onSelectUser={handlePersonaSelect}
        />
      </div>

      {/* Recommendations Bento Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Curated For You</span>
            <span className="text-xs font-mono text-emerald-400 font-normal">
              ({recommendations.length} matches)
            </span>
          </h2>
          <button
            onClick={() => fetchRecs(selectedUser, movieContext)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Refresh Recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-[32px] glass-card animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 rounded-[32px] glass-card text-center space-y-3">
            <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matches Found</h3>
            <p className="text-xs text-white/50">Try switching profiles or clearing the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations
              .filter((rec) => rec && rec.movie && rec.movie.id)
              .map((rec) => (
                <RecCard key={rec.movie.id} rec={rec} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8 text-white/50">Loading recommendations...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
