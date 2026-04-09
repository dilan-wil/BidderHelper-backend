// covers/covers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoversService {
  private generator: any = null;

  constructor(private prisma: PrismaService) {}

  private async getGenerator() {
    if (!this.generator) {
      const { pipeline } = await import('@huggingface/transformers');
      this.generator = await pipeline('text-generation');
    }
    return this.generator;
  }

  async generateCoverLetter(resumeText: string, jobDescription: string) {
    const generator = await this.getGenerator();

    const prompt = `Write a professional cover letter based on the following resume and job description.

RESUME:
${resumeText.slice(0, 1000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 500)}

COVER LETTER:`;

    const result = await generator(prompt, {
      max_new_tokens: 400,
      temperature: 0.7,
      do_sample: true,
    });

    let coverLetter = result[0].generated_text;
    coverLetter = coverLetter.replace(prompt, '').trim();

    return { coverLetter };
  }

  async generateAndSave(
    userId: string,
    resumeId: string,
    jobDescription: string,
    matchId?: string,
  ) {
    // Get resume text
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Generate cover letter
    const { coverLetter } = await this.generateCoverLetter(
      resume.text,
      jobDescription,
    );

    // Save to database
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

    // Generate new cover letter
    const { coverLetter } = await this.generateCoverLetter(
      existing.resume.text,
      existing.jobDescription,
    );

    // Update existing record
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
