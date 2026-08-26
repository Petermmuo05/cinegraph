"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Atom,
  Palette,
  ShieldAlert,
  Award,
  Loader2,
  TrendingUp,
} from "lucide-react";
import CoverFlowCarousel from "@/components/home/CoverFlowCarousel";
import MovieShelf from "@/components/home/MovieShelf";
import TasteOnboardingWizard from "@/components/onboarding/TasteOnboardingWizard";
import { useUser } from "@/lib/user-store";
import { MovieNode, RecommendationResult } from "@/types";

export default function HomePage() {
  const {
    currentUser,
    isOnboarded,
    setIsOnboarded,
    isTasteModalOpen,
    setIsTasteModalOpen,
    likedMovies,
    watchlist,
  } = useUser();

  const [spotlightMovies, setSpotlightMovies] = useState<MovieNode[]>([]);
  const [socialTrendingRecs, setSocialTrendingRecs] = useState<any[]>([]);
  const [indieRecs, setIndieRecs] = useState<any[]>([]);
  const [crimeRecs, setCrimeRecs] = useState<any[]>([]);
  const [sciFiRecs, setSciFiRecs] = useState<any[]>([]);
  const [cultGemsRecs, setCultGemsRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all diverse, non-overlapping recommendation shelves from CognoDB openCypher queries
  useEffect(() => {
    async function loadDiverseShelves() {
      try {
        setLoading(true);

        // 1. Primary Spotlight Recommendations for 3D Cover-Flow
        const spotlightRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&limit=7`
        );
        const spotlightData: RecommendationResult[] = await spotlightRes.json();
        const spotlightList = (spotlightData && spotlightData.length > 0)
          ? spotlightData.map((r) => r.movie)
          : [];
        setSpotlightMovies(spotlightList);

        const accumulatedExcludeIds = new Set<string>(spotlightList.map((m) => m.id));

        // 2. Shelf: Social Velocity & Trending in Cinephile Circle
        const excludeStr1 = Array.from(accumulatedExcludeIds).join(",");
        const trendingRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&strategy=social_velocity&excludeIds=${encodeURIComponent(excludeStr1)}&limit=8`
        );
        const trendingData: RecommendationResult[] = await trendingRes.json();
        if (trendingData && trendingData.length > 0) {
          trendingData.forEach((r) => accumulatedExcludeIds.add(r.movie.id));
          setSocialTrendingRecs(
            trendingData.map((r) => ({
              ...r.movie,
              matchScore: r.affinityScore || 96,
              socialTag: r.sharedLikers?.length
                ? `High Cohort Velocity (${r.sharedLikers[0]} + others)`
                : "Trending in Graph Circle",
              reason: r.reason,
            }))
          );
        }

        // 3. Shelf: A24 & Indie Surrealism Traversal
        const excludeStr2 = Array.from(accumulatedExcludeIds).join(",");
        const indieRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&genre=Drama&trope=Surrealism&excludeIds=${encodeURIComponent(excludeStr2)}&limit=8`
        );
        const indieData: RecommendationResult[] = await indieRes.json();
        if (indieData && indieData.length > 0) {
          indieData.forEach((r) => accumulatedExcludeIds.add(r.movie.id));
          setIndieRecs(
            indieData.map((r) => ({
              ...r.movie,
              matchScore: Math.min(99, (r.affinityScore || 92) + 3),
              socialTag: "Surrealist & Indie Graph Bridge",
              reason: r.reason,
            }))
          );
        }

        // 4. Shelf: Classic Crime Noir & Antiheroes
        const excludeStr3 = Array.from(accumulatedExcludeIds).join(",");
        const crimeRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&genre=Crime&excludeIds=${encodeURIComponent(excludeStr3)}&limit=8`
        );
        const crimeData: RecommendationResult[] = await crimeRes.json();
        if (crimeData && crimeData.length > 0) {
          crimeData.forEach((r) => accumulatedExcludeIds.add(r.movie.id));
          setCrimeRecs(
            crimeData.map((r) => ({
              ...r.movie,
              matchScore: Math.min(99, (r.affinityScore || 93) + 2),
              socialTag: r.director ? `Directed by ${r.director}` : "Crime Noir Masterpiece",
              reason: r.reason,
            }))
          );
        }

        // 5. Shelf: Sci-Fi & Cosmic Horizons
        const excludeStr4 = Array.from(accumulatedExcludeIds).join(",");
        const scifiRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&genre=Science+Fiction&excludeIds=${encodeURIComponent(excludeStr4)}&limit=8`
        );
        const scifiData: RecommendationResult[] = await scifiRes.json();
        if (scifiData && scifiData.length > 0) {
          scifiData.forEach((r) => accumulatedExcludeIds.add(r.movie.id));
          setSciFiRecs(
            scifiData.map((r) => ({
              ...r.movie,
              matchScore: r.affinityScore || 94,
              socialTag: "Sci-Fi & Cosmic Horizon",
              reason: r.reason,
            }))
          );
        }

        // 6. Shelf: Cult Masterpieces (IMDb 8.5+)
        const excludeStr5 = Array.from(accumulatedExcludeIds).join(",");
        const gemsRes = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(currentUser.id)}&strategy=cult_gems&excludeIds=${encodeURIComponent(excludeStr5)}&limit=8`
        );
        const gemsData: RecommendationResult[] = await gemsRes.json();
        if (gemsData && gemsData.length > 0) {
          setCultGemsRecs(
            gemsData.map((r) => ({
              ...r.movie,
              matchScore: Math.min(99, (r.affinityScore || 91) + 5),
              socialTag: `IMDb ⭐ ${r.movie.imdbRating}`,
              reason: r.reason,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load recommendation dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDiverseShelves();
  }, [currentUser.id, likedMovies, watchlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-500 select-none">
      {/* Mandatory Onboarding Wizard Trigger */}
      <TasteOnboardingWizard
        isOpen={!isOnboarded || isTasteModalOpen}
        onComplete={() => {
          setIsOnboarded(true);
          setIsTasteModalOpen(false);
        }}
      />

      {/* 1. Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20 whitespace-nowrap">
              Personalized openCypher Feed
            </span>
            <span className="text-xs text-white/50 hidden sm:inline whitespace-nowrap font-mono">
              Live CognoDB • 936 Nodes Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Hello {currentUser.username}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Explore graph-powered cinema recommendations and deep relational provenance.
          </p>
        </div>
      </div>

      {/* 2. 3D Angled Perspective Cover-Flow Carousel (Spotlight Recs from Graph) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">
              Spotlight Recommendations for You
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            ← → Arrow Keys or Drag to Swipe
          </span>
        </div>

        {spotlightMovies.length > 0 ? (
          <CoverFlowCarousel movies={spotlightMovies} />
        ) : (
          <div className="h-64 rounded-3xl glass-card flex items-center justify-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Calculating Graph Spotlight...</span>
          </div>
        )}
      </section>

      {/* 4. Recommendation Shelf: Trending in Social Graph Circle */}
      {socialTrendingRecs.length > 0 && (
        <section>
          <MovieShelf
            title="Trending in Your Cinephile Circle"
            subtitle="Films experiencing highest rating velocity and watchlists among connected peers"
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            movies={socialTrendingRecs}
            seeAllHref="/recommendations"
          />
        </section>
      )}

      {/* 5. Recommendation Shelf: A24 & Indie Surrealism */}
      {indieRecs.length > 0 && (
        <section>
          <MovieShelf
            title="A24 & Surrealist Multiverse Gems"
            subtitle="Poetic cinema, ontological multiverse structures, and emotional resonance"
            icon={<Palette className="w-5 h-5 text-pink-400" />}
            movies={indieRecs}
            seeAllHref="/recommendations"
          />
        </section>
      )}

      {/* 6. Recommendation Shelf: Classic Crime Noir & Antiheroes */}
      {crimeRecs.length > 0 && (
        <section>
          <MovieShelf
            title="Crime Noir & Morally Ambiguous Antiheroes"
            subtitle="Gritty underworlds, tactical heists, and psychological tension"
            icon={<ShieldAlert className="w-5 h-5 text-cyan-400" />}
            movies={crimeRecs}
            seeAllHref="/recommendations"
          />
        </section>
      )}

      {/* 7. Recommendation Shelf: Sci-Fi & Cosmic Horizons */}
      {sciFiRecs.length > 0 && (
        <section>
          <MovieShelf
            title="Sci-Fi & Cosmic Horizons"
            subtitle="Speculative physics, sentient intelligence, and vast interplanetary scale"
            icon={<Atom className="w-5 h-5 text-emerald-400" />}
            movies={sciFiRecs}
            seeAllHref="/recommendations"
          />
        </section>
      )}

      {/* 8. Recommendation Shelf: Masterpieces (IMDb 8.5+) */}
      {cultGemsRecs.length > 0 && (
        <section>
          <MovieShelf
            title="Universal Cinematic Masterpieces (IMDb 8.5+)"
            subtitle="All-time landmark achievements in world cinema"
            icon={<Award className="w-5 h-5 text-accent-gold" />}
            movies={cultGemsRecs}
            seeAllHref="/recommendations"
          />
        </section>
      )}
    </div>
  );
}
