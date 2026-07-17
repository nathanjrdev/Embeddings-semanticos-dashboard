export function vectorNorm(vector: number[]): number {
  let sumOfSquares = 0;
  for (let i = 0; i < vector.length; i += 1) {
    sumOfSquares += vector[i] * vector[i];
  }
  return Math.sqrt(sumOfSquares);
}

export function l2Normalize(vector: number[]): number[] {
  const norm = vectorNorm(vector);
  if (norm === 0) {
    return vector.slice();
  }
  return vector.map((value) => value / norm);
}

export function sampleDimensions(vector: number[], count: number): number[] {
  return vector.slice(0, count);
}
