// recommendations/recommendations.controller.ts
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Get,
  Param,
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
      req.user.id,
      text,
      file,
    );
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    return this.recommendationsService.getMatchHistory(req.user.id);
  }

  @Get(':id')
  async getMatch(@Req() req: any, @Param('id') id: string) {
    return this.recommendationsService.getMatchById(id, req.user.id);
  }
}
