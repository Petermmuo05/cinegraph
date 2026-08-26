"use client";

import React from "react";
import Image from "next/image";
import { User, Sparkles } from "lucide-react";

interface PersonaSelectorProps {
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

export default function PersonaSelector({
  selectedUserId,
  onSelectUser,
}: PersonaSelectorProps) {
  const personas = [
    {
      id: "u-scifilover",
      name: "AuraCinema",
      genre: "Sci-Fi & Mind-Bending",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop",
      desc: "Loves non-linear timelines, Nolan, Villeneuve & existential relativity",
    },
    {
      id: "u-cinephile",
      name: "NoirMaster",
      genre: "Crime & Classic Noir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop",
      desc: "Loves Scorsese, The Godfather, antiheroes & gripping dialogue",
    },
    {
      id: "u-indiebuff",
      name: "A24Vibes",
      genre: "Indie & Multiverse",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&fit=crop",
      desc: "Loves surrealism, visual poetry, Everything Everywhere & Blade Runner",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Active Graph Taste Persona
        </label>
        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Collaborative Filtering & Thematic Traversal
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {personas.map((p) => {
          const isSelected = selectedUserId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => onSelectUser(p.id)}
              className={`p-4 rounded-3xl text-left transition-all relative overflow-hidden border ${
                isSelected
                  ? "bg-emerald-950/60 border-emerald-400/50 shadow-neon-emerald"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                  <Image src={p.avatar} alt={p.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{p.name}</h4>
                  <span className="text-[11px] font-medium text-emerald-400">
                    {p.genre}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
