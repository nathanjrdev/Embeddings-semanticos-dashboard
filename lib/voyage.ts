import { VoyageEmbeddingResponse } from "@/types/embedding";

const VOYAGE_ENDPOINT = "https://api.voyageai.com/v1/embeddings";

interface VoyageRequestOptions {
  texts: string[];
  model?: string;
  inputType?: "document" | "query";
}

export async function generateVoyageEmbeddings(
  options: VoyageRequestOptions
): Promise<VoyageEmbeddingResponse> {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "A variável de ambiente VOYAGE_API_KEY não está configurada no servidor."
    );
  }

  const response = await fetch(VOYAGE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: options.texts,
      model: options.model ?? "voyage-3",
      input_type: options.inputType ?? "document"
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Falha na chamada à API da VoyageAI (status ${response.status}): ${errorBody}`
    );
  }

  const data: VoyageEmbeddingResponse = await response.json();
  return data;
}
