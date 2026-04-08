// recommendations.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../functions/embedding.service';
import { ParserService } from '../functions/parser.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
    private parserService: ParserService,
  ) {}

  async findMatchingResumes(
    userId: string,
    jobText?: string,
    jobFile?: Express.Multer.File,
  ) {
    // Extract text from either the job description text or uploaded file
    let jobDescription = jobText || '';

    if (jobFile) {
      jobDescription = await this.parserService.extractText(jobFile);
    }

    if (!jobDescription.trim()) {
      throw new Error('No text content found to match against');
    }

    // Generate embedding for the job description
    const jobEmbedding = await this.embeddingService.embed(jobDescription);
    const embeddingString = `[${Array.from(jobEmbedding).join(',')}]`;

    // Find top 3 matching resumes using vector similarity
    const matches = await this.prisma.$queryRaw`
      SELECT
        r.id,
        r.filename,
        r."fileUrl",
        r.text,
        r."createdAt",
        1 - (r.embedding <=> ${embeddingString}::vector) as similarity
      FROM "Resume" r
      WHERE r."userId" = ${userId}::uuid
      ORDER BY r.embedding <=> ${embeddingString}::vector
      LIMIT 3
    `;

    return {
      jobDescription: jobDescription.slice(0, 500), // Preview
      matches,
    };
  }
}
