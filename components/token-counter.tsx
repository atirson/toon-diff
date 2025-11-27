'use client';

import { CompactnessScore } from '@/lib/types';
import { TrendingDown, TrendingUp, Hash } from 'lucide-react';

interface TokenCounterProps {
  compactness: CompactnessScore | null;
}

export function TokenCounter({ compactness }: TokenCounterProps) {
  if (!compactness) {
    return (
      <div className="flex flex-col items-center justify-center h-32 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-3 p-6 text-center">
        <Hash className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Token Analysis Ready</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add content to both fields and click "Count Tokens" to analyze compactness</p>
        </div>
      </div>
    );
  }

  const isCompact = compactness.difference < 0;
  const percentAbs = Math.abs(compactness.percentageDiff);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">TOON A</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {compactness.tokensA}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">tokens</p>
        </div>

        <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-300 dark:border-cyan-700 rounded-lg">
          <p className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">TOON B</p>
          <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">
            {compactness.tokensB}
          </p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">tokens</p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-700 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Difference</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {Math.abs(compactness.difference)}
            </p>
            {isCompact ? (
              <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {isCompact ? 'fewer' : 'more'} tokens
          </p>
        </div>
      </div>

      <div className={`p-6 rounded-lg border-2 ${
        isCompact
          ? 'bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-700'
          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-400 dark:border-orange-700'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-lg font-semibold ${
            isCompact ? 'text-green-800 dark:text-green-300' : 'text-orange-800 dark:text-orange-300'
          }`}>
            Compactness Score
          </h4>
          <span className={`text-2xl font-bold ${
            isCompact ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
          }`}>
            {percentAbs.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompact ? 'bg-green-500 dark:bg-green-600' : 'bg-orange-500 dark:bg-orange-600'
            }`}
            style={{ width: `${Math.min(percentAbs, 100)}%` }}
          />
        </div>
        
        <p className={`text-sm ${
          isCompact ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
        }`}>
          {isCompact
            ? `TOON B is ${percentAbs.toFixed(1)}% more compact (${Math.abs(compactness.difference)} fewer tokens)`
            : `TOON B is ${percentAbs.toFixed(1)}% less compact (${compactness.difference} more tokens)`
          }
        </p>
      </div>
    </div>
  );
}
