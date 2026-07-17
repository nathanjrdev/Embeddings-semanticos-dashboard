"use client";

import { PipelineStage } from "@/types/embedding";

interface Step {
  key: PipelineStage;
  label: string;
  number: string;
}

const STEPS: Step[] = [
  { key: "dividindo", label: "Chunking", number: "01" },
  { key: "gerando_embeddings", label: "Embedding", number: "02" },
  { key: "normalizando", label: "Normalização L2", number: "03" },
  { key: "reduzindo", label: "Redução PCA", number: "04" },
  { key: "concluido", label: "Visualização", number: "05" }
];

const ORDER: PipelineStage[] = [
  "ocioso",
  "dividindo",
  "gerando_embeddings",
  "normalizando",
  "reduzindo",
  "concluido"
];

function getStatus(stepKey: PipelineStage, currentStage: PipelineStage): "pendente" | "ativo" | "concluido" {
  const currentIndex = ORDER.indexOf(currentStage);
  const stepIndex = ORDER.indexOf(stepKey);

  if (currentStage === "erro") {
    return stepIndex < currentIndex ? "concluido" : "pendente";
  }

  if (stepIndex < currentIndex) return "concluido";
  if (stepIndex === currentIndex) return "ativo";
  return "pendente";
}

export default function StepIndicator({ currentStage }: { currentStage: PipelineStage }) {
  return (
    <div className="glass-panel px-6 py-5">
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const status = getStatus(step.key, currentStage);
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border text-xs font-mono transition-all duration-300 ${
                    status === "concluido"
                      ? "bg-base-50 text-base-950 border-base-50"
                      : status === "ativo"
                      ? "border-white/40 text-base-50 animate-pulse-slow"
                      : "border-white/[0.08] text-base-500"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-sm whitespace-nowrap transition-colors duration-300 ${
                    status === "pendente" ? "text-base-500" : "text-base-100"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-4 bg-white/[0.08] relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-base-50 transition-transform duration-500 origin-left ${
                      status === "concluido" ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
