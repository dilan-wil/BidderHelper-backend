import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../functions/embedding.service';
import { ParserService } from '../functions/parser.service';
import crypto from 'crypto';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private embed: EmbeddingService,
    private parser: ParserService,
  ) {}

  async upload(
    files: Express.Multer.File | Express.Multer.File[],
    userId: string,
  ) {
    const fileList = [files].flat();
    const results: any = [];

    for (const file of fileList) {
      const text = await this.parser.extractText(file);

      const embedding = await this.embed.embed(text);
      const vectorString = `[${Array.from(embedding).join(',')}]`;

      const result = await this.prisma.$queryRaw`
        INSERT INTO "Resume" (id, filename, "fileUrl", text, "fileSize", "fileType", embedding, "userId", "createdAt")
        VALUES (
          gen_random_uuid(),
          ${file.originalname},
          ${file.path},
          ${text},
          ${file.size},
          ${file.mimetype},
          ${vectorString}::vector(384),
          ${userId}::uuid,
          NOW()
        )
        RETURNING id, filename, "fileUrl", text, "userId", "createdAt"
      `;

      results.push({ filename: file.originalname });
    }

    return results;
  }

  async findAllByUserId(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        text: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.resume.findFirst({
      where: { id, userId },
    });
  }

  async deleteOne(id: string, userId: string) {
    return this.prisma.resume.delete({
      where: { id, userId },
    });
  }
}
