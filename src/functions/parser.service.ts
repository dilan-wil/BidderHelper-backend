import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ParserService {
  async extractText(file: Express.Multer.File): Promise<any> {
    if (file.mimetype === 'application/pdf') {
      const data = new PDFParse({ url: file.path });
      const result = await data.getText();
      return result.text;
    }

    if (file.mimetype.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      return result.value;
    }

    return file.buffer.toString();
  }
}
