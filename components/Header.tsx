export default function Header() {
  return (
    <header className="flex flex-col gap-2 mb-8">
      <p className="label-eyebrow">Pipeline de embeddings</p>
      <h1 className="text-3xl md:text-4xl font-semibold text-base-50 tracking-tight">
        Painel de Vetorização Semântica
      </h1>
      <p className="text-base-400 text-sm md:text-base max-w-2xl">
        Do texto bruto ao espaço vetorial: chunking, geração de embeddings com a VoyageAI,
        normalização L2 e redução de dimensionalidade por PCA, visualizados em tempo real.
      </p>
    </header>
  );
}
