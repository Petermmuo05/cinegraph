"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Sparkles, Filter, Layers, Info, Terminal, ChevronRight, Target, RotateCcw } from "lucide-react";
import ForceGraphView from "@/components/graph/ForceGraphView";
import Link from "next/link";

function GraphPageContent() {
  const searchParams = useSearchParams();
  const initialNodeId = searchParams.get("nodeId");
  const initialName = searchParams.get("name");
  const initialType = searchParams.get("type") || "Entity";

  const [focusNode, setFocusNode] = useState<{ id: string; name?: string; type?: string } | null>(
    initialNodeId ? { id: initialNodeId, name: initialName || initialNodeId, type: initialType } : null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Cinematic Graph Explorer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Navigate the interconnected web of directors, cast, genres, tropes, and studios powered by openCypher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/inspector"
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Cypher Console</span>
          </Link>
        </div>
      </div>

      {/* Active Focus Ego-Graph Communication Banner */}
      {focusNode && (
        <div className="p-4 sm:p-5 rounded-3xl glass-card border border-emerald-500/40 bg-emerald-950/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Focused Ego-Graph
                </span>
                <span className="text-xs text-white/60">• {focusNode.type} Root</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                Rooted at: <span className="text-emerald-400 font-extrabold">{focusNode.name}</span>
              </h2>
              <p className="text-xs text-white/60 line-clamp-1">
                Displaying 1st and 2nd-degree relational neighbors (Directors, Cast, Tropes, and Genres) in CognoDB.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFocusNode(null)}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Full Macro View</span>
          </button>
        </div>
      )}

      {/* Main Graph Canvas Container */}
      <div className="relative">
        <ForceGraphView selectedNodeId={focusNode?.id || null} height="h-[650px] sm:h-[750px]" />
      </div>

      {/* Bottom Explanatory Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Hop Traversal</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Double-click any node to send a parameterized Cypher expansion query to CognoDB, pulling in real-time adjacent neighbors.
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Dynamic Graph Physics</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Drag nodes to reorganize clusters. Nodes with high relational centrality (directors like Nolan, franchises like Dune) naturally anchor the network.
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-gold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Relational Inspection</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Click any movie, actor, or genre to inspect full metadata, runtime, box office, and trigger instant shortest path queries.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-emerald-400 animate-pulse">Loading Graph Canvas...</div>}>
      <GraphPageContent />
    </Suspense>
  );
}
