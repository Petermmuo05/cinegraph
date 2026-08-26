import Link from "next/link";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <Film className="w-10 h-10 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">404 - Node Not Found</h1>
      <p className="text-sm text-white/60 max-w-md">
        The cinematic entity or graph route you are looking for does not exist in our graph database.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-neon-emerald"
      >
        Return to Knowledge Graph
      </Link>
    </div>
  );
}
