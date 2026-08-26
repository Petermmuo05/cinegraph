"use client";

import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: "Movie", color: "#3B82F6" },
    { label: "Director / Cast", color: "#10B981" },
    { label: "Genre", color: "#06B6D4" },
    { label: "Trope / Theme", color: "#EC4899" },
    { label: "Studio", color: "#F59E0B" },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
      <div className="glass-panel p-3 rounded-2xl shadow-xl transition-all max-w-[280px]">
        <div
          className="flex items-center justify-between gap-2 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Graph Legend</span>
          </div>
          <button className="text-white/40 hover:text-white">
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-2.5 space-y-1.5 text-[11px] border-t border-white/10 pt-2">
            {items.map((i) => (
              <div key={i.label} className="flex items-center gap-2 text-white/70">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: i.color, boxShadow: `0 0 8px ${i.color}` }}
                />
                <span>{i.label}</span>
              </div>
            ))}
            <div className="pt-1.5 text-[10px] text-white/40 border-t border-white/5">
              💡 Tip: Double-click any node to expand adjacent connections.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
