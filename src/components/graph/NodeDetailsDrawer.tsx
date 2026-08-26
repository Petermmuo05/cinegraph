"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, Clock, Calendar, Sparkles, Network, GitMerge, ArrowUpRight } from "lucide-react";
import { GraphNode } from "@/types";

interface NodeDetailsDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
  onExpand: (node: GraphNode) => void;
}

export default function NodeDetailsDrawer({
  node,
  onClose,
  onExpand,
}: NodeDetailsDrawerProps) {
  if (!node) return null;

  const props = node.properties || {};
  const isMovie = node.label === "Movie";
  const isPerson = node.label === "Person";

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[380px] z-30 pointer-events-auto">
      {/* Background backdrop blur for mobile */}
      <div className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" onClick={onClose} />

      <div className="w-full h-full glass-card border-l border-white/20 sm:rounded-l-[32px] overflow-y-auto p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {node.label} Node
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Header */}
          {(props.backdropUrl || props.posterUrl || props.photoUrl) && (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden mt-4 border border-white/10 shadow-lg">
              <Image
                src={props.backdropUrl || props.posterUrl || props.photoUrl}
                alt={node.name || node.title || "Node Preview"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040D0A] via-transparent to-transparent" />
              {props.imdbRating && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-accent-gold/40 text-accent-gold font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>IMDb {props.imdbRating}</span>
                </div>
              )}
            </div>
          )}

          {/* Title & Metadata */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {node.title || node.name}
            </h3>

            {props.tagline && (
              <p className="text-xs italic text-emerald-400/80 mt-1">
                &ldquo;{props.tagline}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-white/60">
              {props.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  {props.releaseYear}
                </span>
              )}
              {props.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  {props.runtime} min
                </span>
              )}
              {props.primaryRole && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-medium">
                  {props.primaryRole}
                </span>
              )}
              {props.boxOffice && (
                <span className="text-white/40">Gross: {props.boxOffice}</span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-xs text-white/70 leading-relaxed">
              {props.plotSummary || props.bio || props.description || "Connected cinematic node in the knowledge graph."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => onExpand(node)}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-neon-emerald"
          >
            <Network className="w-4 h-4" />
            Expand Subgraph (CognoDB)
          </button>

          {isPerson && (
            <Link
              href={`/path-finder?from=${encodeURIComponent(node.name || "")}`}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <GitMerge className="w-4 h-4 text-accent-cyan" />
              Find Degrees of Separation
            </Link>
          )}

          {isMovie && (
            <Link
              href={`/recommendations?seedMovie=${encodeURIComponent(node.id)}`}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Find Thematic Graph Matches
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
