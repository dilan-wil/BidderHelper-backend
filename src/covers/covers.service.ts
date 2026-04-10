import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoversService {
  private ai: any = null;

  constructor(private prisma: PrismaService) {}

  private async getAI() {
    if (!this.ai) {
      const { GoogleGenAI } = await import('@google/genai');

      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    }

    return this.ai;
  }

  async generateCoverLetter(resumeText: string, jobDescription: string) {
    const ai = await this.getAI();

    const prompt = `Write a professional cover letter based on the following resume and job description.

RESUME:
${resumeText.slice(0, 1000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 500)}

COVER LETTER:`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return {
        coverLetter: response.text || 'Failed to generate cover letter',
      };
    } catch (error) {
      console.error('Gemini error:', error);
      throw new Error('Failed to generate cover letter');
    }
  }

  async generateAndSave(
    userId: string,
    resumeId: string,
    jobDescription: string,
    matchId?: string,
  ) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const { coverLetter } = await this.generateCoverLetter(
      resume.text,
      jobDescription,
    );

    const saved = await this.prisma.cover.create({
      data: {
        userId,
        resumeId,
        jobDescription: jobDescription.slice(0, 2000),
        content: coverLetter,
        matchId,
      },
    });

    return {
      id: saved.id,
      coverLetter: saved.content,
      resumeId: saved.resumeId,
      matchId: saved.matchId,
      createdAt: saved.createdAt,
    };
  }

  async getUserCovers(userId: string) {
    return this.prisma.cover.findMany({
      where: { userId },
      include: {
        resume: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCoverById(id: string, userId: string) {
    const cover = await this.prisma.cover.findFirst({
      where: { id, userId },
      include: {
        resume: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
          },
        },
      },
    });

    if (!cover) {
      throw new Error('Cover letter not found');
    }

    return cover;
  }

  async deleteCover(id: string, userId: string) {
    const cover = await this.prisma.cover.findFirst({
      where: { id, userId },
    });

    if (!cover) {
      throw new Error('Cover letter not found');
    }

    await this.prisma.cover.delete({
      where: { id },
    });

    return { message: 'Cover letter deleted successfully' };
  }

  async regenerateCover(id: string, userId: string) {
    const existing = await this.prisma.cover.findFirst({
      where: { id, userId },
      include: { resume: true },
    });

    if (!existing) {
      throw new Error('Cover letter not found');
    }

    const { coverLetter } = await this.generateCoverLetter(
      existing.resume.text,
      existing.jobDescription,
    );

    const updated = await this.prisma.cover.update({
      where: { id },
      data: { content: coverLetter },
    });

    return {
      id: updated.id,
      coverLetter: updated.content,
      resumeId: updated.resumeId,
      matchId: updated.matchId,
      createdAt: updated.createdAt,
    };
  }

  async getCoversByMatch(matchId: string, userId: string) {
    return this.prisma.cover.findMany({
      where: { matchId, userId },
      include: {
        resume: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
          },
        },
      },
    });
  }
}
