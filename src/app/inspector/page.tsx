"use client";

import React, { useState } from "react";
import { Terminal, Play, Clock, Database, CheckCircle2, AlertCircle, Sparkles, Copy, Check } from "lucide-react";

export default function InspectorPage() {
  const [query, setQuery] = useState(
    `MATCH (m:Movie {title: "Inception"})<-[:DIRECTED]-(d:Person)-[:DIRECTED]->(rec:Movie)
RETURN d.name AS Director, m.title AS OriginMovie, rec.title AS SharedDirectorMovie, rec.releaseYear AS Year, rec.imdbRating AS Rating
ORDER BY Rating DESC`
  );

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presetQueries = [
    {
      title: "1. Six Degrees Shortest Path (O(V+E))",
      description: "Finds shortest relational path between Timothée Chalamet and Cillian Murphy",
      cypher: `MATCH (start:Person {name: "Timothée Chalamet"}), (target:Person {name: "Cillian Murphy"})
MATCH p = shortestPath((start)-[:ACTED_IN|DIRECTED*..8]-(target))
RETURN p, length(p) AS DegreesOfSeparation`,
    },
    {
      title: "2. Multi-Hop Recommendation Traversal (3+ Hops)",
      description: "Finds movies connected by shared actors, directors, and tropes, excluding watched titles",
      cypher: `MATCH (u:User {id: "u-scifilover"})-[r:RATED]->(m:Movie)
WHERE r.rating >= 8.0
MATCH (m)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(rec:Movie)
OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Person)-[:DIRECTED]->(rec)
OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(rec)
OPTIONAL MATCH (m)-[:HAS_TROPE]->(t:Trope)<-[:HAS_TROPE]-(rec)
WHERE NOT (u)-[:RATED]->(rec) AND rec.id <> m.id
RETURN rec.title AS Title,
       rec.releaseYear AS Year,
       rec.imdbRating AS Rating,
       collect(DISTINCT d.name) AS SharedDirectors,
       collect(DISTINCT a.name)[0..2] AS SharedActors,
       collect(DISTINCT t.name)[0..2] AS SharedTropes
ORDER BY Rating DESC LIMIT 6`,
    },
    {
      title: "3. Frequent Creative Collaborations (Cliques)",
      description: "Finds director-actor pairs with 2+ joint films and calculates average score",
      cypher: `MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person)
WHERE d.id <> a.id
WITH d, a, count(m) AS Collaborations, collect(m.title) AS Movies, avg(m.imdbRating) AS AvgRating
WHERE Collaborations >= 2
RETURN d.name AS Director, a.name AS Actor, Collaborations, AvgRating, Movies
ORDER BY Collaborations DESC, AvgRating DESC`,
    },
    {
      title: "4. Graph Centrality: Top Connected Cinematic Nodes",
      description: "Measures relationship in-degree centrality across the entire knowledge graph",
      cypher: `MATCH (n)
OPTIONAL MATCH (n)-[r]-()
WITH n, labels(n)[0] AS Label, count(r) AS DegreeCentrality
RETURN coalesce(n.title, n.name) AS Entity, Label, DegreeCentrality
ORDER BY DegreeCentrality DESC LIMIT 10`,
    },
  ];

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Query failed");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live openCypher Query Workbench
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Designed for technical evaluators and reviewers to test parameterized openCypher queries directly against CognoDB with millisecond latency metrics.
        </p>
      </div>

      {/* Presets Row */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Evaluation Preset Queries (Graph Traversal Tests)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetQueries.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setQuery(p.cypher);
                setError(null);
              }}
              className="p-3.5 rounded-2xl text-left glass-card hover:border-emerald-400/40 hover:bg-emerald-950/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  {p.title}
                </h4>
                <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                  {p.description}
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-2">Click to load ⟶</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Execution Panel */}
      <div className="p-6 rounded-[32px] glass-card border border-white/15 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">openCypher Query Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Copy Cypher"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleRunQuery}
              disabled={loading}
              className="px-5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-neon-emerald"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Executing..." : "Run Query"}</span>
            </button>
          </div>
        </div>

        {/* Code Area */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={6}
          className="w-full p-4 rounded-2xl bg-[#040D0A]/90 border border-white/15 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 leading-relaxed shadow-inner"
        />

        {/* Latency / Error bar */}
        {result && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Query executed successfully ({result.records?.length || 0} records returned)</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{result.executionTimeMs} ms</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* JSON Results Box */}
        {result && result.records && (
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Result Dataset (JSON Records)
            </label>
            <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white/80 overflow-x-auto max-h-80 leading-relaxed">
              {JSON.stringify(result.records, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
