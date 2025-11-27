'use client';

import { useState, useCallback } from 'react';
import { ToonDiffResult, TokenDiff } from '@/lib/types';

/* -----------------------------------------------------
 * Tokenization
 * ----------------------------------------------------- */
const tokenize = (text: string) => text.split(/\s+/).filter(Boolean);

const compareTokens = (tokensA: string[], tokensB: string[]): TokenDiff[] => {
  const out: TokenDiff[] = [];
  const max = Math.max(tokensA.length, tokensB.length);

  for (let i = 0; i < max; i++) {
    const a = tokensA[i];
    const b = tokensB[i];

    if (a === undefined) out.push({ type: 'added', value: b ?? '' });
    else if (b === undefined) out.push({ type: 'removed', value: a });
    else if (a === b) out.push({ type: 'unchanged', value: a });
    else out.push({ type: 'changed', value: b });
  }

  return out;
};

/* -----------------------------------------------------
 * LCS MATRIX
 * ----------------------------------------------------- */
function lcsMatrix(a: string[], b: string[]) {
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  return dp;
}

/* -----------------------------------------------------
 * BACKTRACK — versão corrigida e segura
 * gera alinhamento real 1-1 entre linhas
 * ----------------------------------------------------- */
function alignLines(a: string[], b: string[]) {
  const dp = lcsMatrix(a, b);

  let i = a.length;
  let j = b.length;

  const result: { a?: string; b?: string }[] = [];

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.push({ a: a[i - 1], b: b[j - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      result.push({ a: a[i - 1], b: undefined });
      i--;
    } else {
      result.push({ a: undefined, b: b[j - 1] });
      j--;
    }
  }

  while (i > 0) {
    result.push({ a: a[i - 1] });
    i--;
  }

  while (j > 0) {
    result.push({ b: b[j - 1] });
    j--;
  }

  return result.reverse();
}

/* -----------------------------------------------------
 * HOOK PRINCIPAL
 * ----------------------------------------------------- */
export function useToonDiff() {
  const [diffResults, setDiffResults] = useState<ToonDiffResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const compare = useCallback((contentA: string, contentB: string) => {
    setIsComparing(true);

    const linesA = contentA.split('\n');
    const linesB = contentB.split('\n');

    const aligned = alignLines(linesA, linesB);

    const results: ToonDiffResult[] = [];
    let lineA = 0;
    let lineB = 0;

    for (const pair of aligned) {
      const a = pair.a;
      const b = pair.b;

      // unchanged
      if (a !== undefined && b !== undefined && a === b) {
        lineA++;
        lineB++;
        results.push({
          type: 'unchanged',
          lineA,
          lineB,
          contentA: a,
          contentB: b,
        });
        continue;
      }

      // changed
      if (a !== undefined && b !== undefined && a !== b) {
        lineA++;
        lineB++;
        results.push({
          type: 'changed',
          lineA,
          lineB,
          contentA: a,
          contentB: b,
          tokens: compareTokens(tokenize(a), tokenize(b)),
        });
        continue;
      }

      // removed
      if (a !== undefined && b === undefined) {
        lineA++;
        results.push({
          type: 'removed',
          lineA,
          contentA: a,
        });
        continue;
      }

      // added
      if (a === undefined && b !== undefined) {
        lineB++;
        results.push({
          type: 'added',
          lineB,
          contentB: b,
        });
        continue;
      }
    }

    setDiffResults(results);
    setIsComparing(false);
    return results;
  }, []);

  return { diffResults, compare, isComparing };
}
