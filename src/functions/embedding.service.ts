import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  async embed(text: string): Promise<Number[]> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({});

    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: { outputDimensionality: 1536 },
    });
    console.log(response.embeddings!);
    return response.embeddings![0].values as any;
  }
}
