export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Descriptor length mismatch");
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function bestMatchIndex(query: number[], candidates: number[][]): { index: number; distance: number } | null {
  if (candidates.length === 0) return null;
  let bestIdx = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < candidates.length; i++) {
    const dist = euclideanDistance(query, candidates[i]);
    if (dist < best) {
      best = dist;
      bestIdx = i;
    }
  }
  return { index: bestIdx, distance: best };
}
