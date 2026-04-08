// recommendations.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('match')
  @UseInterceptors(FileInterceptor('file'))
  async matchResumes(
    @Req() req: any,
    @Body('text') text?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!text && !file) {
      throw new Error('Please provide either text or a file');
    }

    return this.recommendationsService.findMatchingResumes(
      req.user.userId,
      text,
      file,
    );
  }
}
