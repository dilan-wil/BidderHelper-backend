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
    // 1. Extract job description
    let jobDescription = jobText || '';
    if (jobFile) {
      jobDescription = await this.parserService.extractText(jobFile);
    }

    if (!jobDescription.trim()) {
      throw new Error('No text content found to match against');
    }

    // 2. Generate embedding for job description
    const jobEmbedding = await this.embeddingService.embed(jobDescription);
    const embeddingString = Array.from(jobEmbedding).join(' ');

    // 3. Find top 3 matching resumes
    const matches = await this.prisma.$queryRaw<any[]>`
      SELECT 
        r.id,
        r.filename,
        r."fileUrl",
        r.text,
        1 - (r.embedding <=> ${embeddingString}::vector) as similarity
      FROM "Resume" r
      WHERE r."userId" = ${userId}::uuid
      ORDER BY r.embedding <=> ${embeddingString}::vector
      LIMIT 3
    `;

    // 4. Prepare matched resumes array
    const matchedResumes = matches.map((match, index) => ({
      resumeId: match.id,
      filename: match.filename,
      fileUrl: match.fileUrl,
      text: match.text,
      similarity: match.similarity,
      rank: index + 1,
    }));

    // 5. Store single match record with all 3 resumes
    const storedMatch = await this.prisma.match.create({
      data: {
        userId,
        jobDescription: jobDescription.slice(0, 2000),
        jobTitle: this.extractJobTitle(jobDescription),
        matchedResumes: matchedResumes,
      },
    });

    return {
      id: storedMatch.id,
      jobDescription: jobDescription.slice(0, 500),
      matches: matchedResumes,
      createdAt: storedMatch.createdAt,
    };
  }

  async getMatchHistory(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return matches.map((match) => ({
      id: match.id,
      jobTitle: match.jobTitle,
      jobDescription: match.jobDescription.slice(0, 200),
      matchedResumes: match.matchedResumes as any[],
      createdAt: match.createdAt,
    }));
  }

  async getMatchById(matchId: string, userId: string) {
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, userId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return {
      id: match.id,
      jobDescription: match.jobDescription,
      jobTitle: match.jobTitle,
      matchedResumes: match.matchedResumes as any[],
      createdAt: match.createdAt,
    };
  }

  private extractJobTitle(jobDescription: string): string {
    const patterns = [
      /Title:?\s*([^\n]+)/i,
      /Position:?\s*([^\n]+)/i,
      /Role:?\s*([^\n]+)/i,
      /Looking for:?\s*([^\n]+)/i,
      /Job Title:?\s*([^\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = jobDescription.match(pattern);
      if (match) return match[1].trim().slice(0, 100);
    }

    return jobDescription.slice(0, 50);
  }
}
