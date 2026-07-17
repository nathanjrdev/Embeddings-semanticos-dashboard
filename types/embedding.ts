export interface TextChunk {
  id: string;
  index: number;
  text: string;
  charCount: number;
}

export interface RawEmbeddingResult {
  chunkId: string;
  vector: number[];
}

export interface NormalizationResult {
  chunkId: string;
  rawVector: number[];
  normalizedVector: number[];
  normBefore: number;
  normAfter: number;
  sampleBefore: number[];
  sampleAfter: number[];
}

export interface ProjectedPoint {
  chunkId: string;
  index: number;
  text: string;
  charCount: number;
  x: number;
  y: number;
}

export type PipelineStage =
  | "ocioso"
  | "dividindo"
  | "gerando_embeddings"
  | "normalizando"
  | "reduzindo"
  | "concluido"
  | "erro";

export interface SearchResult {
  chunk: TextChunk;
  score: number;
  rank: number;
}

export interface QueryPoint {
  text: string;
  x: number;
  y: number;
}

export interface VoyageEmbeddingResponseItem {
  embedding: number[];
  index: number;
}

export interface VoyageEmbeddingResponse {
  object: string;
  data: VoyageEmbeddingResponseItem[];
  model: string;
  usage: {
    total_tokens: number;
  };
}
