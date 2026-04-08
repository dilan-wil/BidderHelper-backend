import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmbeddingService } from 'src/functions/embedding.service';
import { ParserService } from 'src/functions/parser.service';

@Module({
  providers: [
    RecommendationsService,
    PrismaService,
    EmbeddingService,
    ParserService,
  ],
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
