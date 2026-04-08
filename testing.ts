async function generateCoverLetter() {
  const { pipeline } = await import('@huggingface/transformers');

  // Use a better model
  const generator = await pipeline('text-generation');
  const resumeText =
    "John Doe - Software Engineer. Experienced in Node.js, TypeScript, React, and PostgreSQL. Previously worked at Tech Corp building REST APIs and microservices. Led a team of 3 developers. Bachelor's in Computer Science.";

  const jobDescription =
    'We need a Full Stack Developer with Node.js and React experience. Must be a team player and have good communication skills.';

  const prompt = `Write a short cover letter:

Resume: ${resumeText}
Job: ${jobDescription}
Cover letter:`;

  const result = await generator(prompt, {
    max_new_tokens: 200,
    temperature: 0.8,
  });

  console.log(result[0].generated_text);
}

generateCoverLetter();
