"use client";

interface SearchPanelProps {
  value: string;
  onChange: (text: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isSearching: boolean;
  hasResults: boolean;
}

export default function SearchPanel({
  value,
  onChange,
  onSearch,
  onClear,
  isSearching,
  hasResults
}: SearchPanelProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim().length > 0 && !isSearching) {
      onSearch();
    }
  }

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 animate-fade-in">
      <div>
        <p className="label-eyebrow">Busca semântica</p>
        <h2 className="text-lg font-medium text-base-50 mt-1">Consulta por similaridade</h2>
        <p className="text-sm text-base-400 mt-1">
          O termo ou frase é convertido em um vetor e comparado com cada bloco via produto
          escalar. Como todos os vetores estao normalizados por L2, isso e equivalente a
          similaridade cosseno.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um termo ou frase para buscar nos blocos..."
          className="glass-input flex-1 px-4 py-3 text-sm text-base-100 placeholder:text-base-500"
        />
        <button
          onClick={onSearch}
          disabled={value.trim().length === 0 || isSearching}
          className="glass-button px-5 py-3 text-sm whitespace-nowrap"
        >
          {isSearching ? "Buscando" : "Buscar"}
        </button>
        {hasResults && (
          <button onClick={onClear} className="glass-button-secondary px-4 py-3 text-sm">
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
