import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { ParserService } from 'src/functions/parser.service';
import { EmbeddingService } from 'src/functions/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, PrismaService, EmbeddingService, ParserService],
})
export class ResumesModule {}
