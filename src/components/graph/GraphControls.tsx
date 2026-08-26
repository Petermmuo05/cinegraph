"use client";

import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, RefreshCw, Layers } from "lucide-react";

interface GraphControlsProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onRefresh: () => void;
}

export default function GraphControls({
  filterType,
  onFilterChange,
  onZoomIn,
  onZoomOut,
  onReset,
  onRefresh,
}: GraphControlsProps) {
  const filters = [
    { label: "All", value: "ALL" },
    { label: "Movies", value: "Movie" },
    { label: "Cast & Crew", value: "Person" },
    { label: "Genres", value: "Genre" },
    { label: "Tropes", value: "Trope" },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full glass-panel pointer-events-auto shadow-lg overflow-x-auto max-w-full">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterType === f.value
                ? "bg-emerald-500 text-black font-semibold shadow-neon-emerald"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Camera & Reset Controls */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full glass-panel pointer-events-auto shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-white/20" />
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-full hover:bg-white/15 text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Reload Overview Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
