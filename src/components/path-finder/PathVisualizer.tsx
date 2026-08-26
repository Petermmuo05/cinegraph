"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GitMerge, ArrowRight, User, Film, Star, CheckCircle2 } from "lucide-react";
import { ShortestPathResult } from "@/types";

interface PathVisualizerProps {
  pathResult: ShortestPathResult | null;
  loading: boolean;
}

export default function PathVisualizer({ pathResult, loading }: PathVisualizerProps) {
  if (loading) {
    return (
      <div className="p-12 rounded-[32px] glass-card text-center space-y-3 animate-pulse">
        <GitMerge className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
        <h4 className="text-base font-bold text-white">Traversing Graph Adjacency Paths...</h4>
        <p className="text-xs text-white/50">Running openCypher shortestPath algorithm in CognoDB</p>
      </div>
    );
  }

  if (!pathResult || !pathResult.nodes || pathResult.nodes.length === 0) {
    return null;
  }

  const { nodes, pathDescription, length, startNode, targetNode } = pathResult;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary Header */}
      <div className="p-6 rounded-[32px] glass-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
              Optimal Graph Path Found
            </span>
            <span className="text-xs text-white/60 font-mono">
              Degrees of Separation: <strong className="text-white">{length} Hops</strong>
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {(startNode as any)?.name || (startNode as any)?.title} <span className="text-emerald-400">⟶</span> {(targetNode as any)?.name || (targetNode as any)?.title}
          </h3>
        </div>

        <Link
          href={`/graph?nodeId=${startNode?.id}`}
          className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-neon-emerald"
        >
          <span>View on Canvas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Visual Step-by-Step Path Chain */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-6 my-4 ml-4">
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;
          const isMovie = node.label === "Movie";
          const props = node.properties || {};

          return (
            <div key={`${node.id}-${idx}`} className="relative group">
              {/* Connector Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                  idx === 0 || isLast
                    ? "bg-emerald-400 border-white shadow-neon-emerald"
                    : "bg-[#040D0A] border-emerald-400"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Node Card */}
              <div className="p-4 rounded-3xl glass-card hover:border-emerald-500/40 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/15 bg-black/40 flex-shrink-0">
                    {(props.photoUrl || props.posterUrl) ? (
                      <Image
                        src={props.photoUrl || props.posterUrl}
                        alt={node.name || node.title || ""}
                        fill
                        className="object-cover"
                      />
                    ) : isMovie ? (
                      <Film className="w-6 h-6 text-blue-400 m-auto mt-3" />
                    ) : (
                      <User className="w-6 h-6 text-emerald-400 m-auto mt-3" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {node.label}
                      </span>
                      {props.releaseYear && (
                        <span className="text-[10px] text-white/40">({props.releaseYear})</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{node.name || node.title}</h4>
                    {pathDescription[idx] && (
                      <p className="text-xs text-white/60 mt-0.5">{pathDescription[idx]}</p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/graph?nodeId=${node.id}`}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title="Inspect node"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
