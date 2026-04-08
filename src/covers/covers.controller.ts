// cover-letter.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CoversService } from './covers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('covers')
@UseGuards(JwtAuthGuard)
export class CoversController {
  constructor(private readonly coverLetterService: CoversService) {}

  @Post('generate')
  async generateCoverLetter(
    @Req() req: any,
    @Body('jobDescription') jobDescription: string,
    @Body('resumeText') resumeText: string,
  ) {
    if (!jobDescription || !resumeText) {
      throw new Error('Both jobDescription and resumeText are required');
    }

    return this.coverLetterService.generateCoverLetter(
      resumeText,
      jobDescription,
    );
  }
}
