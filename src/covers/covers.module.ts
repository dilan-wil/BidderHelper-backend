import { Module } from '@nestjs/common';
import { CoversController } from './covers.controller';
import { CoversService } from './covers.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CoversController],
  providers: [CoversService, PrismaService],
})
export class CoversModule {}
