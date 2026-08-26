"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GitMerge, ArrowRight, Sparkles, RefreshCw, UserCheck } from "lucide-react";
import PathVisualizer from "@/components/path-finder/PathVisualizer";
import { ShortestPathResult } from "@/types";

function PathFinderContent() {
  const searchParams = useSearchParams();
  const [fromPerson, setFromPerson] = useState(searchParams.get("from") || "Timothée Chalamet");
  const [toPerson, setToPerson] = useState(searchParams.get("to") || "Cillian Murphy");
  const [pathResult, setPathResult] = useState<ShortestPathResult | null>(null);
  const [loading, setLoading] = useState(false);

  const presetPairings = [
    { from: "Timothée Chalamet", to: "Cillian Murphy" },
    { from: "Leonardo DiCaprio", to: "Christian Bale" },
    { from: "Keanu Reeves", to: "Robert De Niro" },
    { from: "Zendaya", to: "Anne Hathaway" },
    { from: "Ryan Gosling", to: "Matt Damon" },
  ];

  const solvePath = async (from: string, to: string) => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/path-finder?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const data = await res.json();
      setPathResult(data);
    } catch (e) {
      console.error("Path solve failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    solvePath(fromPerson, toPerson);
  }, []);

  const handlePreset = (p: { from: string; to: string }) => {
    setFromPerson(p.from);
    setToPerson(p.to);
    solvePath(p.from, p.to);
  };

  const handleSwap = () => {
    const temp = fromPerson;
    setFromPerson(toPerson);
    setToPerson(temp);
    solvePath(toPerson, temp);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitMerge className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Six Degrees of Cinema: Shortest Path Traversal
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Trace the exact collaborative lineage between any two individuals in openCypher shortestPath() graph time.
        </p>
      </div>

      {/* Active Traversal Context Banner */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-cyan-500/30 bg-cyan-950/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in slide-in-from-top-3 duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Six Degrees Traversal
              </span>
              <span className="text-xs text-white/50">• openCypher shortestPath()</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
              Connecting <span className="text-emerald-400 font-extrabold">{fromPerson}</span> <span className="text-cyan-400">➔</span> <span className="text-cyan-400 font-extrabold">{toPerson}</span>
            </h2>
            <p className="text-xs text-white/60 line-clamp-1">
              Traversing shared filmography, cast edges (:ACTED_IN), and directorship edges (:DIRECTED) in CognoDB.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 px-3 py-1 rounded-full bg-black/40 border border-cyan-500/30 self-start sm:self-auto flex-shrink-0">
          Bidirectional BFS
        </span>
      </div>

      {/* Preset Quick Badges */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Quick Preset Comparisons
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {presetPairings.map((p) => (
            <button
              key={`${p.from}-${p.to}`}
              onClick={() => handlePreset(p)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-white/10 text-xs font-medium text-white/80 whitespace-nowrap transition-all"
            >
              {p.from} ⟶ {p.to}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Inputs Search Box */}
      <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs font-medium text-emerald-400 mb-1.5 block">
              Origin Creative (Actor / Director)
            </label>
            <input
              type="text"
              value={fromPerson}
              onChange={(e) => setFromPerson(e.target.value)}
              placeholder="e.g. Timothée Chalamet"
              className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-cyan-400 mb-1.5 block">
              Target Creative (Actor / Director)
            </label>
            <input
              type="text"
              value={toPerson}
              onChange={(e) => setToPerson(e.target.value)}
              placeholder="e.g. Cillian Murphy"
              className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleSwap}
            className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            ⇄ Swap Names
          </button>

          <button
            onClick={() => solvePath(fromPerson, toPerson)}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
          >
            <GitMerge className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Traversing..." : "Find Shortest Path"}</span>
          </button>
        </div>
      </div>

      {/* Visualized Path Journey */}
      <PathVisualizer pathResult={pathResult} loading={loading} />
    </div>
  );
}

export default function PathFinderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-emerald-400 animate-pulse">Loading Path Finder...</div>}>
      <PathFinderContent />
    </Suspense>
  );
}
