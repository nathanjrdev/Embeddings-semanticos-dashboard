"use client";

import { ChangeEvent, useRef, useState } from "react";

interface InputPanelProps {
  value: string;
  onChange: (text: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function InputPanel({ value, onChange, onProcess, isProcessing }: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      onChange(text);
      setFileName(file.name);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Etapa 01</p>
          <h2 className="text-lg font-medium text-base-50 mt-1">Texto de origem</h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="glass-button-secondary px-4 py-2 text-sm"
        >
          Carregar arquivo .md
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {fileName && (
        <p className="text-xs text-base-400 font-mono -mt-2">arquivo carregado: {fileName}</p>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole aqui o texto que deseja transformar em embeddings, ou carregue um arquivo .md."
        className="glass-input w-full min-h-[220px] p-4 text-sm leading-relaxed text-base-100 placeholder:text-base-500 resize-y"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-base-400 font-mono">
          {value.length.toLocaleString("pt-BR")} caracteres
        </span>
        <button
          onClick={onProcess}
          disabled={value.trim().length === 0 || isProcessing}
          className="glass-button px-6 py-2.5 text-sm"
        >
          {isProcessing ? "Processando" : "Processar texto"}
        </button>
      </div>
    </div>
  );
}
