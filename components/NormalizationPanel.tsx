"use client";

import { NormalizationResult } from "@/types/embedding";

function formatNumber(value: number): string {
  return value.toFixed(4);
}

export default function NormalizationPanel({ results }: { results: NormalizationResult[] }) {
  if (results.length === 0) return null;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 animate-fade-in">
      <div>
        <p className="label-eyebrow">Etapa 03</p>
        <h2 className="text-lg font-medium text-base-50 mt-1">Normalização L2</h2>
        <p className="text-sm text-base-400 mt-1">
          Cada vetor é dividido pela sua própria norma euclidiana, de forma que sua magnitude
          final seja sempre igual a 1.0, preservando apenas a direção do vetor.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-base-500">
              <th className="text-left font-medium px-3 py-2">Bloco</th>
              <th className="text-left font-medium px-3 py-2">Dimensões</th>
              <th className="text-left font-medium px-3 py-2">Norma antes</th>
              <th className="text-left font-medium px-3 py-2">Norma depois</th>
              <th className="text-left font-medium px-3 py-2">Amostra antes (5 dims)</th>
              <th className="text-left font-medium px-3 py-2">Amostra depois (5 dims)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr key={result.chunkId} className="bg-white/[0.02]">
                <td className="px-3 py-2.5 rounded-l-xl font-mono text-base-300">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="px-3 py-2.5 font-mono text-base-400">
                  {result.rawVector.length}
                </td>
                <td className="px-3 py-2.5 font-mono text-base-200">
                  {formatNumber(result.normBefore)}
                </td>
                <td className="px-3 py-2.5 font-mono text-base-50">
                  {formatNumber(result.normAfter)}
                </td>
                <td className="px-3 py-2.5 font-mono text-base-500 text-xs">
                  [{result.sampleBefore.map(formatNumber).join(", ")}]
                </td>
                <td className="px-3 py-2.5 rounded-r-xl font-mono text-base-300 text-xs">
                  [{result.sampleAfter.map(formatNumber).join(", ")}]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
