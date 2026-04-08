// cover-letter.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoversService {
  private generator: any = null;

  private async getGenerator() {
    if (!this.generator) {
      const { pipeline } = await import('@huggingface/transformers');
      this.generator = await pipeline('text-generation');
    }
    return this.generator;
  }

  async generateCoverLetter(resumeText: string, jobDescription: string) {
    const generator = await this.getGenerator();

    const prompt = `Write a professional cover letter based on the following resume and job description.

RESUME:
${resumeText.slice(0, 1000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 500)}

COVER LETTER:`;

    const result = await generator(prompt, {
      max_new_tokens: 400,
      temperature: 0.7,
      do_sample: true,
    });

    // Extract just the generated part (remove the prompt)
    let coverLetter = result[0].generated_text;
    coverLetter = coverLetter.replace(prompt, '').trim();

    return { coverLetter };
  }
}
