// covers/covers.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { CoversService } from './covers.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('covers')
@UseGuards(JwtAuthGuard)
export class CoversController {
  constructor(private readonly coversService: CoversService) {}

  @Post('generate')
  async generateCoverLetter(
    @Req() req: any,
    @Body('resumeId') resumeId: string,
    @Body('jobDescription') jobDescription: string,
    @Body('matchId') matchId?: string,
  ) {
    if (!resumeId || !jobDescription) {
      throw new Error('resumeId and jobDescription are required');
    }

    return this.coversService.generateAndSave(
      req.user.userId,
      resumeId,
      jobDescription,
      matchId,
    );
  }

  @Get()
  async getAllCovers(@Req() req: any) {
    return this.coversService.getUserCovers(req.user.userId);
  }

  @Get(':id')
  async getCoverById(@Req() req: any, @Param('id') id: string) {
    return this.coversService.getCoverById(id, req.user.userId);
  }

  @Delete(':id')
  async deleteCover(@Req() req: any, @Param('id') id: string) {
    return this.coversService.deleteCover(id, req.user.userId);
  }

  @Post(':id/regenerate')
  async regenerateCover(@Req() req: any, @Param('id') id: string) {
    return this.coversService.regenerateCover(id, req.user.userId);
  }

  @Get('match/:matchId')
  async getCoversByMatch(@Req() req: any, @Param('matchId') matchId: string) {
    return this.coversService.getCoversByMatch(matchId, req.user.userId);
  }
}
