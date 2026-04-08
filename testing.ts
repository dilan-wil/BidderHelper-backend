// Create a text-generation pipeline
async function generateCoverLetter() {
  const { pipeline } = await import('@huggingface/transformers');

  // Specify a model for text generation
  const generator = await pipeline(
    'text-generation',
    'Xenova/llama2.c-stories15M',
  );

  const resumeText =
    'Software engineer with 5 years experience in Node.js, React, and PostgreSQL. Led a team of 4 developers. Built scalable microservices.';
  const jobDescription =
    'Looking for a senior developer with Node.js and React expertise. Must have leadership experience.';

  const prompt = `Write a professional cover letter based on this resume and job description.
  RESUME:
  ${resumeText}

  JOB DESCRIPTION:
  ${jobDescription}

  COVER LETTER:`;

  const result = await generator(prompt, {
    max_new_tokens: 300,
    temperature: 0.7,
  });

  console.log(result[0].generated_text);
}

generateCoverLetter();
