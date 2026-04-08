import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as officeParser from 'officeparser';

@Injectable()
export class ParserService {
  async extractText(file: Express.Multer.File): Promise<any> {
    if (file) {
      const response = await fetch(file.path);
      const buffer = Buffer.from(await response.arrayBuffer());

      const ast = await officeParser.parseOffice(buffer);
      console.log(ast);

      return ast.toText();
    }

    // if (file.mimetype === 'application/pdf') {
    //   const data = new PDFParse({ url: file.path });
    //   const result = await data.getText();
    //   return result.text;
    // }

    // if (file.mimetype.includes('wordprocessingml')) {
    //   const result = await mammoth.extractRawText({
    //     buffer: file.buffer,
    //   });
    //   return result.value;
    // }

    return '';
  }
}
