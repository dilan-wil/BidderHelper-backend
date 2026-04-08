// Create a feature-extraction pipeline
async function test() {
  const { pipeline } = await import('@huggingface/transformers');
  const extractor = await pipeline('feature-extraction');

  // Compute embeddings
  const texts = ['Hello'];

  const embeddings = await extractor(texts, {
    pooling: 'mean', // This does the pooling for you!
    normalize: true,
  });
  console.log(embeddings.ort_tensor.data.length);
  // [
  //   [-0.016986183822155, 0.03228696808218956, -0.0013630966423079371, ... ],
  //   [0.09050482511520386, 0.07207386940717697, 0.05762749910354614, ... ],
  // ]
}

test();
