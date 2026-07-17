import { NextRequest, NextResponse } from "next/server";
import { generateVoyageEmbeddings } from "@/lib/voyage";
import { RawEmbeddingResult } from "@/types/embedding";

interface EmbedRequestBody {
  chunks: { id: string; text: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: EmbedRequestBody = await request.json();

    if (!body.chunks || body.chunks.length === 0) {
      return NextResponse.json(
        { error: "Nenhum bloco de texto foi enviado para gerar embeddings." },
        { status: 400 }
      );
    }

    const texts = body.chunks.map((chunk) => chunk.text);
    const voyageResponse = await generateVoyageEmbeddings({ texts });

    const results: RawEmbeddingResult[] = voyageResponse.data.map((item) => ({
      chunkId: body.chunks[item.index].id,
      vector: item.embedding
    }));

    return NextResponse.json({
      results,
      model: voyageResponse.model,
      totalTokens: voyageResponse.usage.total_tokens
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
