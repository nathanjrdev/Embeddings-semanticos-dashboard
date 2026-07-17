function centerMatrixWithMeans(matrix: number[][]): {
  centered: number[][];
  means: number[];
} {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const means = new Array(cols).fill(0);

  for (let j = 0; j < cols; j += 1) {
    let sum = 0;
    for (let i = 0; i < rows; i += 1) {
      sum += matrix[i][j];
    }
    means[j] = sum / rows;
  }

  const centered: number[][] = [];
  for (let i = 0; i < rows; i += 1) {
    const row = new Array(cols);
    for (let j = 0; j < cols; j += 1) {
      row[j] = matrix[i][j] - means[j];
    }
    centered.push(row);
  }

  return { centered, means };
}

function computeGramMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const gram: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i += 1) {
    for (let k = i; k < n; k += 1) {
      let dotVal = 0;
      const rowI = matrix[i];
      const rowK = matrix[k];
      for (let d = 0; d < rowI.length; d += 1) {
        dotVal += rowI[d] * rowK[d];
      }
      gram[i][k] = dotVal;
      gram[k][i] = dotVal;
    }
  }

  return gram;
}

function matVecMul(matrix: number[][], vector: number[]): number[] {
  const n = matrix.length;
  const result = new Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    let sum = 0;
    const row = matrix[i];
    for (let j = 0; j < vector.length; j += 1) {
      sum += row[j] * vector[j];
    }
    result[i] = sum;
  }
  return result;
}

function normalizeVec(vector: number[]): { vector: number[]; norm: number } {
  let sumSquares = 0;
  for (let i = 0; i < vector.length; i += 1) {
    sumSquares += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSquares);
  if (norm === 0) {
    return { vector: vector.slice(), norm: 0 };
  }
  return { vector: vector.map((v) => v / norm), norm };
}

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    sum += a[i] * b[i];
  }
  return sum;
}

interface EigenPair {
  eigenvalue: number;
  eigenvector: number[];
}

function powerIteration(matrix: number[][], iterations = 200): EigenPair {
  const n = matrix.length;
  let vector = new Array(n).fill(0).map(() => Math.random() - 0.5);
  let normResult = normalizeVec(vector);
  vector = normResult.vector;

  let eigenvalue = 0;

  for (let iter = 0; iter < iterations; iter += 1) {
    const next = matVecMul(matrix, vector);
    const nextNormResult = normalizeVec(next);

    if (nextNormResult.norm === 0) {
      break;
    }

    eigenvalue = dotProduct(matVecMul(matrix, nextNormResult.vector), nextNormResult.vector);
    vector = nextNormResult.vector;
  }

  return { eigenvalue, eigenvector: vector };
}

function deflate(matrix: number[][], pair: EigenPair): number[][] {
  const n = matrix.length;
  const deflated: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      deflated[i][j] =
        matrix[i][j] - pair.eigenvalue * pair.eigenvector[i] * pair.eigenvector[j];
    }
  }

  return deflated;
}

export interface PcaResult {
  points: number[][];
  explainedVariance: number[];
  project: (vector: number[]) => number[];
}

export function pcaReduceGram(vectors: number[][], targetDimensions: number): PcaResult {
  const n = vectors.length;
  const d = vectors[0]?.length ?? 0;

  const identityProject = (_v: number[]) => new Array(targetDimensions).fill(0);

  if (n === 0) {
    return { points: [], explainedVariance: [], project: identityProject };
  }

  if (n === 1) {
    return {
      points: [new Array(targetDimensions).fill(0)],
      explainedVariance: new Array(targetDimensions).fill(0),
      project: identityProject
    };
  }

  const { centered, means } = centerMatrixWithMeans(vectors);
  let gram = computeGramMatrix(centered);

  const components: EigenPair[] = [];
  const effectiveDimensions = Math.min(targetDimensions, n - 1);

  for (let c = 0; c < effectiveDimensions; c += 1) {
    const pair = powerIteration(gram);
    components.push(pair);
    gram = deflate(gram, pair);
  }

  const points: number[][] = Array.from({ length: n }, () => new Array(targetDimensions).fill(0));

  components.forEach((pair, componentIndex) => {
    const scale = Math.sqrt(Math.max(pair.eigenvalue, 0));
    for (let i = 0; i < n; i += 1) {
      points[i][componentIndex] = pair.eigenvector[i] * scale;
    }
  });

  const loadings: number[][] = components.map((pair) => {
    const scale = Math.sqrt(Math.max(pair.eigenvalue, 0));
    if (scale === 0) return new Array(d).fill(0);
    const loading = new Array(d).fill(0);
    for (let j = 0; j < d; j += 1) {
      let val = 0;
      for (let i = 0; i < n; i += 1) {
        val += centered[i][j] * pair.eigenvector[i];
      }
      loading[j] = val / scale;
    }
    return loading;
  });

  const totalVariance = components.reduce((acc, c) => acc + Math.max(c.eigenvalue, 0), 0) || 1;
  const explainedVariance = components.map((c) => Math.max(c.eigenvalue, 0) / totalVariance);

  function project(vector: number[]): number[] {
    const coords = new Array(effectiveDimensions).fill(0);
    for (let k = 0; k < loadings.length; k += 1) {
      let coord = 0;
      for (let j = 0; j < d; j += 1) {
        coord += (vector[j] - means[j]) * loadings[k][j];
      }
      coords[k] = coord;
    }
    return coords;
  }

  return { points, explainedVariance, project };
}
