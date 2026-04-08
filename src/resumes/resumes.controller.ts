import {
  Controller,
  Post,
  Get,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
  Param,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storage } from '../cloudinary/cloudinary.storage';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ResumesService } from './resumes.service';

@Controller('resumes')
export class ResumesController {
  constructor(private service: ResumesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async upload(@UploadedFiles() files: any, @Req() req: any) {
    try {
      return await this.service.upload(files, req.user.userId);
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllByUserId(@Req() req: any) {
    return this.service.findAllByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteOne(@Param('id') id: string, @Req() req) {
    return this.service.deleteOne(id, req.user.userId);
  }
}
