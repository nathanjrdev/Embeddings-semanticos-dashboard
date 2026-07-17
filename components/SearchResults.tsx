"use client";

import { SearchResult } from "@/types/embedding";

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(Math.max(score, 0) * 100);
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-base-100 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-base-300 w-10 text-right">
        {score.toFixed(3)}
      </span>
    </div>
  );
}

export default function SearchResults({ results }: { results: SearchResult[] }) {
  if (results.length === 0) return null;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Resultados</p>
          <h2 className="text-lg font-medium text-base-50 mt-1">
            Blocos mais similares
          </h2>
        </div>
        <span className="text-xs text-base-400 font-mono">
          similaridade cosseno
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {results.map((result) => (
          <div
            key={result.chunk.id}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.04] transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-base-400">
                bloco {String(result.chunk.index + 1).padStart(2, "0")}
                {"  "}·{"  "}
                {result.chunk.charCount} caracteres
              </span>
              <span
                className={`text-[11px] font-mono font-medium ${
                  result.rank === 1 ? "text-base-50" : "text-base-400"
                }`}
              >
                {result.rank === 1 ? "mais relevante" : `#${result.rank}`}
              </span>
            </div>
            <ScoreBar score={result.score} />
            <p className="text-sm text-base-200 leading-relaxed mt-3 line-clamp-3">
              {result.chunk.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
