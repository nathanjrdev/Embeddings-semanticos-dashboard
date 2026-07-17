"use client";

import { TextChunk } from "@/types/embedding";

export default function ChunkList({ chunks }: { chunks: TextChunk[] }) {
  if (chunks.length === 0) return null;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Etapa 02</p>
          <h2 className="text-lg font-medium text-base-50 mt-1">Blocos gerados</h2>
        </div>
        <span className="text-xs text-base-400 font-mono">{chunks.length} blocos</span>
      </div>

      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.04] transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-base-400">
                bloco {String(chunk.index + 1).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-mono text-base-500">
                {chunk.charCount} caracteres
              </span>
            </div>
            <p className="text-sm text-base-200 leading-relaxed line-clamp-2">{chunk.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
