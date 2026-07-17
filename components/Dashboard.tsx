"use client";

import { useRef, useState } from "react";
import {
  NormalizationResult,
  PipelineStage,
  ProjectedPoint,
  QueryPoint,
  RawEmbeddingResult,
  SearchResult,
  TextChunk
} from "@/types/embedding";
import { chunkText } from "@/lib/chunking";
import { l2Normalize, sampleDimensions, vectorNorm } from "@/lib/normalize";
import { pcaReduceGram } from "@/lib/pca";
import Header from "@/components/Header";
import StepIndicator from "@/components/StepIndicator";
import InputPanel from "@/components/InputPanel";
import ChunkList from "@/components/ChunkList";
import NormalizationPanel from "@/components/NormalizationPanel";
import EmbeddingChart from "@/components/EmbeddingChart";
import StatsBar from "@/components/StatsBar";
import ErrorBanner from "@/components/ErrorBanner";
import SearchPanel from "@/components/SearchPanel";
import SearchResults from "@/components/SearchResults";

type ProjectFn = (vector: number[]) => number[];

export default function Dashboard() {
  const [rawText, setRawText] = useState("");
  const [stage, setStage] = useState<PipelineStage>("ocioso");
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [normalizationResults, setNormalizationResults] = useState<NormalizationResult[]>([]);
  const [points, setPoints] = useState<ProjectedPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [embeddingModel, setEmbeddingModel] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);

  const [queryText, setQueryText] = useState("");
  const [queryPoint, setQueryPoint] = useState<QueryPoint | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const normalizedVectorsRef = useRef<number[][]>([]);
  const chunksRef = useRef<TextChunk[]>([]);
  const projectRef = useRef<ProjectFn | null>(null);

  const isProcessing =
    stage === "dividindo" ||
    stage === "gerando_embeddings" ||
    stage === "normalizando" ||
    stage === "reduzindo";

  const pipelineCompleted = stage === "concluido";

  async function runPipeline() {
    setErrorMessage(null);
    setChunks([]);
    setNormalizationResults([]);
    setPoints([]);
    setQueryText("");
    setQueryPoint(null);
    setSearchResults([]);
    setSearchError(null);
    normalizedVectorsRef.current = [];
    chunksRef.current = [];
    projectRef.current = null;

    try {
      setStage("dividindo");
      const generatedChunks = chunkText(rawText, { maxChars: 600 });

      if (generatedChunks.length === 0) {
        throw new Error("Nao foi possivel gerar blocos a partir do texto fornecido.");
      }
      if (generatedChunks.length < 2) {
        throw new Error(
          "Forneca um texto mais longo, gerando ao menos dois blocos para visualizacao."
        );
      }

      setChunks(generatedChunks);
      chunksRef.current = generatedChunks;
      await wait(300);

      setStage("gerando_embeddings");
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunks: generatedChunks.map((c) => ({ id: c.id, text: c.text }))
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao gerar embeddings.");
      }

      const rawEmbeddings: RawEmbeddingResult[] = payload.results;
      setEmbeddingModel(payload.model);
      setTotalTokens(payload.totalTokens);
      await wait(300);

      setStage("normalizando");
      const normResults: NormalizationResult[] = rawEmbeddings.map((item) => {
        const normBefore = vectorNorm(item.vector);
        const normalizedVector = l2Normalize(item.vector);
        const normAfter = vectorNorm(normalizedVector);

        return {
          chunkId: item.chunkId,
          rawVector: item.vector,
          normalizedVector,
          normBefore,
          normAfter,
          sampleBefore: sampleDimensions(item.vector, 5),
          sampleAfter: sampleDimensions(normalizedVector, 5)
        };
      });
      setNormalizationResults(normResults);
      normalizedVectorsRef.current = normResults.map((r) => r.normalizedVector);
      await wait(300);

      setStage("reduzindo");
      const vectors = normResults.map((r) => r.normalizedVector);
      const { points: reducedPoints, project } = pcaReduceGram(vectors, 2);

      projectRef.current = project;

      const projected: ProjectedPoint[] = reducedPoints.map((coords, idx) => {
        const chunk = generatedChunks[idx];
        return {
          chunkId: chunk.id,
          index: chunk.index,
          text: chunk.text,
          charCount: chunk.charCount,
          x: coords[0],
          y: coords[1]
        };
      });
      setPoints(projected);
      await wait(200);

      setStage("concluido");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido.";
      setErrorMessage(message);
      setStage("erro");
    }
  }

  async function runSearch() {
    if (!queryText.trim() || !projectRef.current) return;

    setIsSearching(true);
    setSearchError(null);
    setQueryPoint(null);
    setSearchResults([]);

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunks: [{ id: "query", text: queryText.trim() }]
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao gerar embedding da query.");
      }

      const rawVector: number[] = payload.results[0].vector;
      const normalizedQuery = l2Normalize(rawVector);

      const scores = normalizedVectorsRef.current.map((docVec, idx) => {
        let score = 0;
        for (let j = 0; j < normalizedQuery.length; j += 1) {
          score += normalizedQuery[j] * docVec[j];
        }
        return { chunk: chunksRef.current[idx], score };
      });

      const ranked = [...scores]
        .sort((a, b) => b.score - a.score)
        .map((item, rank) => ({ ...item, rank: rank + 1 })) as SearchResult[];

      setSearchResults(ranked);

      const projected = projectRef.current(normalizedQuery);
      setQueryPoint({
        text: queryText.trim(),
        x: projected[0] ?? 0,
        y: projected[1] ?? 0
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido.";
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  }

  function clearSearch() {
    setQueryText("");
    setQueryPoint(null);
    setSearchResults([]);
    setSearchError(null);
  }

  const stats =
    stage === "concluido"
      ? [
          { label: "Blocos processados", value: String(chunks.length) },
          {
            label: "Dimensoes originais",
            value: normalizationResults[0]
              ? String(normalizationResults[0].rawVector.length)
              : "-"
          },
          { label: "Modelo VoyageAI", value: embeddingModel ?? "-" },
          { label: "Tokens consumidos", value: totalTokens != null ? String(totalTokens) : "-" }
        ]
      : [];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-6">
      <Header />
      <StepIndicator currentStage={stage} />

      <InputPanel
        value={rawText}
        onChange={setRawText}
        onProcess={runPipeline}
        isProcessing={isProcessing}
      />

      {errorMessage && <ErrorBanner message={errorMessage} />}

      <StatsBar stats={stats} />

      <ChunkList chunks={chunks} />
      <NormalizationPanel results={normalizationResults} />
      <EmbeddingChart points={points} queryPoint={queryPoint} />

      {pipelineCompleted && (
        <>
          <SearchPanel
            value={queryText}
            onChange={setQueryText}
            onSearch={runSearch}
            onClear={clearSearch}
            isSearching={isSearching}
            hasResults={searchResults.length > 0}
          />
          {searchError && <ErrorBanner message={searchError} />}
          <SearchResults results={searchResults} />
        </>
      )}
    </main>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
