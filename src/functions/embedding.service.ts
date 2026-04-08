import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  async embed(text: string): Promise<Number[]> {
    const { pipeline } = await import('@huggingface/transformers');
    const extractor = await pipeline(
      'feature-extraction',
      'mixedbread-ai/mxbai-embed-xsmall-v1',
      { device: 'cpu' },
    );

    const embedding = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    return embedding.ort_tensor.data as any;
  }
}
