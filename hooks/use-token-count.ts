'use client';

import { useState, useCallback } from 'react';
import { TokenCount, CompactnessScore } from '@/lib/types';

export function useTokenCount() {
  const [tokenCountA, setTokenCountA] = useState<TokenCount | null>(null);
  const [tokenCountB, setTokenCountB] = useState<TokenCount | null>(null);
  const [compactness, setCompactness] = useState<CompactnessScore | null>(null);

  const countTokens = useCallback((content: string): TokenCount => {
    // Simple tokenization by whitespace
    const tokens = content.split(/\s+/).filter(Boolean);
    return {
      total: tokens.length
    };
  }, []);

  const calculateCompactness = useCallback((contentA: string, contentB: string): CompactnessScore => {
    const tokensA = countTokens(contentA).total;
    const tokensB = countTokens(contentB).total;
    
    const difference = tokensB - tokensA;
    const percentageDiff = tokensA > 0 ? ((difference / tokensA) * 100) : 0;
    const compactnessScore = tokensA > 0 ? ((tokensB / tokensA) * 100) : 0;
    
    setTokenCountA({ total: tokensA });
    setTokenCountB({ total: tokensB });
    
    const result = {
      tokensA,
      tokensB,
      difference,
      percentageDiff,
      compactnessScore
    };
    
    setCompactness(result);
    return result;
  }, [countTokens]);

  return { countTokens, calculateCompactness, tokenCountA, tokenCountB, compactness };
}
