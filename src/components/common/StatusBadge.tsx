"use client";

import React, { useEffect, useState } from "react";
import { Database, Server, RefreshCw, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { DbStatus } from "@/types";

export default function StatusBadge() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHealth = async (retries = 2) => {
    try {
      setLoading(true);
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      if (retries > 0) {
        setTimeout(() => fetchHealth(retries - 1), 1500);
        return;
      }
      setStatus({
        connected: false,
        isMock: true,
        latencyMs: 0,
        nodeCount: 936,
        edgeCount: 3357,
        labels: {},
        errorMessage: "Network error fetching database status",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(0), 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const isConnected = status?.connected ?? false;
  const isInitializing = loading && status === null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          isInitializing
            ? "bg-white/5 text-white/70 border-white/10"
            : isConnected
            ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/50 shadow-neon-emerald"
            : "bg-amber-950/40 text-amber-300 border-amber-500/30 hover:border-amber-400"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isInitializing ? "bg-white/40" : isConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isInitializing ? "bg-white/60" : isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="font-semibold">
          {isInitializing ? "Connecting..." : isConnected ? "CognoDB" : "Demo Cache"}
        </span>
        {status && isConnected && (
          <span className="text-[10px] opacity-80 font-mono hidden sm:inline">
            {status.latencyMs}ms
          </span>
        )}
      </button>

      {/* Popover Card */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute right-0 mt-2 w-80 p-4 rounded-3xl glass-card z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">CognoDB Instance</span>
              </div>
              <button
                onClick={() => fetchHealth(1)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Status</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Live Bolt Connection</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">In-Memory Mock Fallback</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Protocol</span>
                <span className="font-mono text-emerald-400/90">Bolt 5.4 (openCypher)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Latency</span>
                <span className="font-mono">{status?.latencyMs || 0} ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Total Nodes in Graph</span>
                <span className="font-semibold text-white">{status?.nodeCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Total Relationships</span>
                <span className="font-semibold text-white">{status?.edgeCount || 0}</span>
              </div>

              {status?.errorMessage && (
                <div className="mt-3 p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                  {status.errorMessage}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
