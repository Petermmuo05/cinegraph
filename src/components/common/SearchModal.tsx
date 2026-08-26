"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Film, User, Tag, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (label: string) => {
    switch (label) {
      case "Movie":
        return <Film className="w-4 h-4 text-blue-400" />;
      case "Person":
        return <User className="w-4 h-4 text-emerald-400" />;
      case "Genre":
        return <Tag className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl glass-card border border-white/20 p-5 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            type="text"
            placeholder="Search movies, actors, directors, tropes, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Box */}
        <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
          {loading && (
            <div className="py-8 text-center text-white/40 text-sm animate-pulse">
              Searching knowledge graph...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-white/40 text-sm">
              No matching graph nodes found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-white/40 text-xs space-y-2">
              <p>Try searching: &ldquo;Christopher Nolan&rdquo;, &ldquo;Dune&rdquo;, &ldquo;Non-Linear&rdquo;, &ldquo;Hans Zimmer&rdquo;</p>
            </div>
          )}

          {results.map((res) => (
            <Link
              key={res.id}
              href={`/graph?nodeId=${res.id}`}
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-emerald-900/30 hover:border-emerald-500/30 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  {getIcon(res.label)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {res.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="capitalize">{res.label}</span>
                    {res.properties?.releaseYear && (
                      <span>• {res.properties.releaseYear}</span>
                    )}
                    {res.properties?.primaryRole && (
                      <span>• {res.properties.primaryRole}</span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
