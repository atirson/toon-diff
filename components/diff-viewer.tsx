'use client';

import { useMemo } from 'react';
import { ToonDiffResult } from '@/lib/types';
import { Diff } from 'lucide-react';

// ------------------------------
// TIPOS
// ------------------------------
type SideBySideLine = {
  lineA?: number;
  contentA?: string;
  typeA?: 'removed' | 'unchanged';
  lineB?: number;
  contentB?: string;
  typeB?: 'added' | 'unchanged';
  isChanged?: boolean; // Para casos onde há mudança entre A e B
};

// ------------------------------
// ALGORITMO PRINCIPAL: AGRUPA POR LINHA LÓGICA
// ------------------------------
function buildSideBySideLines(diffs: ToonDiffResult[]): SideBySideLine[] {
  // Mapas para acessar rapidamente por número de linha
  const removedByLineA = new Map<number, ToonDiffResult>();
  const addedByLineB = new Map<number, ToonDiffResult>();
  
  // Separa os diffs em mapas
  diffs.forEach(diff => {
    if (diff.type === 'removed' && diff.lineA !== undefined) {
      removedByLineA.set(diff.lineA, diff);
    } else if (diff.type === 'added' && diff.lineB !== undefined) {
      addedByLineB.set(diff.lineB, diff);
    }
  });

  // Coleta todos os números de linha únicos
  const allLineNumbers = new Set<number>();
  removedByLineA.forEach((_, lineA) => allLineNumbers.add(lineA));
  addedByLineB.forEach((_, lineB) => allLineNumbers.add(lineB));

  // Ordena as linhas
  const sortedLines = Array.from(allLineNumbers).sort((a, b) => a - b);

  // Constrói as linhas side-by-side
  const result: SideBySideLine[] = [];

  sortedLines.forEach(lineNum => {
    const removed = removedByLineA.get(lineNum);
    const added = addedByLineB.get(lineNum);

    if (removed && added) {
      // Caso 1: Linha existe em ambos os lados (mudança)
      result.push({
        lineA: removed.lineA,
        contentA: removed.contentA,
        typeA: 'removed',
        lineB: added.lineB,
        contentB: added.contentB,
        typeB: 'added',
        isChanged: true,
      });
    } else if (removed) {
      // Caso 2: Linha só existe no lado A (removida)
      result.push({
        lineA: removed.lineA,
        contentA: removed.contentA,
        typeA: 'removed',
      });
    } else if (added) {
      // Caso 3: Linha só existe no lado B (adicionada)
      result.push({
        lineB: added.lineB,
        contentB: added.contentB,
        typeB: 'added',
      });
    }
  });

  return result;
}

// ------------------------------
// DIFF POR CARACTERES (para linhas únicas)
// ------------------------------
function getCharDiff(a: string = '', b: string = '') {
  const maxLen = Math.max(a.length, b.length);
  const left: { char: string; type: 'unchanged' | 'removed' | 'changed' }[] = [];
  const right: { char: string; type: 'unchanged' | 'added' | 'changed' }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const ca = a[i];
    const cb = b[i];

    if (ca === cb) {
      if (ca !== undefined) {
        left.push({ char: ca, type: 'unchanged' });
        right.push({ char: cb!, type: 'unchanged' });
      }
    } else {
      if (ca !== undefined && cb !== undefined) {
        left.push({ char: ca, type: 'changed' });
        right.push({ char: cb, type: 'changed' });
      } else if (cb !== undefined) {
        left.push({ char: '', type: 'unchanged' });
        right.push({ char: cb, type: 'added' });
      } else if (ca !== undefined) {
        left.push({ char: ca, type: 'removed' });
        right.push({ char: '', type: 'unchanged' });
      }
    }
  }

  return { left, right };
}

// ------------------------------
// NORMALIZA MULTILINE PARA FICAR ALINHADO
// ------------------------------
function normalizeMultilineDiff(contentA?: string, contentB?: string) {
  const linesA = contentA ? contentA.split('\n') : [];
  const linesB = contentB ? contentB.split('\n') : [];

  const max = Math.max(linesA.length, linesB.length);
  const pairs: { left: string; right: string }[] = [];

  for (let i = 0; i < max; i++) {
    pairs.push({
      left: linesA[i] ?? '',
      right: linesB[i] ?? '',
    });
  }

  return pairs;
}

// ------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------
interface DiffViewerProps {
  diffResults: ToonDiffResult[];
}

export function DiffViewer({ diffResults }: DiffViewerProps) {
  const filteredDiffs = useMemo(
    () => diffResults.filter(d =>
      d.type === 'added' || d.type === 'removed' || d.type === 'changed'
    ),
    [diffResults]
  );

  const allUnchanged = diffResults.length > 0 && diffResults.every(d => d.type === 'unchanged');


  console.log('DiffViewer - filteredDiffs:', filteredDiffs);

  const sideBySideLines = useMemo(
    () => buildSideBySideLines(filteredDiffs),
    [filteredDiffs]
  );

  console.log('DiffViewer - sideBySideLines:', sideBySideLines);

  if (diffResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-3 p-6 text-center">
        <Diff className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Ready to Compare</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter content in both TOON A and B fields, then click "Compare Documents" to see differences
          </p>
        </div>
      </div>
    );
  }

  if (allUnchanged) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/20 gap-3 p-6 text-center">
        <span className="text-green-600 dark:text-green-300 text-3xl font-bold">✔</span>
        <div>
          <p className="text-lg font-semibold text-green-700 dark:text-green-200 mb-1">The documents are identical!</p>
          <p className="text-sm text-green-600 dark:text-green-300">No differences found between TOON A and B.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex gap-6 items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400 border border-green-600" />
          <span className="text-xs text-gray-700 dark:text-gray-200 font-mono">Added</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" />
          <span className="text-xs text-gray-700 dark:text-gray-200 font-mono">Changed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400 border border-red-600" />
          <span className="text-xs text-gray-700 dark:text-gray-200 font-mono">Removed</span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden border-gray-300 dark:border-gray-700">
        {/* Cabeçalho das colunas */}
        <div className="grid grid-cols-[80px_1fr_1fr] bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <div className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700">
            Line
          </div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700">
            Before (A)
          </div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            After (B)
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {sideBySideLines.map((line, idx) => {
            // Determina a classe de fundo baseada no tipo de mudança
            let bgClass = 'bg-white dark:bg-gray-900';
            
            if (line.isChanged) {
              bgClass = 'bg-yellow-50 dark:bg-yellow-950/20';
            } else if (line.typeA === 'removed' && !line.contentB) {
              bgClass = 'bg-red-50 dark:bg-red-950/20';
            } else if (line.typeB === 'added' && !line.contentA) {
              bgClass = 'bg-green-50 dark:bg-green-950/20';
            }

            const contentA = line.contentA ?? '';
            const contentB = line.contentB ?? '';

            // Verifica se é multiline
            const isMultiline = contentA.includes('\n') || contentB.includes('\n');
            const multilinePairs = isMultiline
              ? normalizeMultilineDiff(contentA, contentB)
              : null;

            // Diff por caractere (apenas para linhas únicas com mudança)
            const charDiffs = !isMultiline && line.isChanged
              ? getCharDiff(contentA, contentB)
              : null;

            return (
              <div
                key={idx}
                className={`grid grid-cols-[80px_1fr_1fr] border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${bgClass}`}
              >
                {/* Coluna de números de linha */}
                <div className="px-3 py-2 text-xs font-mono text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700 flex items-start">
                  <span className="inline-block min-w-[20px] text-right">
                    {line.lineA ?? ''}
                  </span>
                  <span className="mx-1">→</span>
                  <span className="inline-block min-w-[20px]">
                    {line.lineB ?? ''}
                  </span>
                </div>

                {/* Coluna A (Before) */}
                <div className="px-3 py-2 font-mono text-sm break-all border-r border-gray-300 dark:border-gray-700">
                  {contentA ? (
                    isMultiline ? (
                      // Multiline: mostra linha por linha
                      multilinePairs!.map((p, i) => (
                        <div key={i} className="whitespace-pre-wrap">
                          {p.left || <span className="text-gray-400 dark:text-gray-600">∅</span>}
                        </div>
                      ))
                    ) : line.isChanged && charDiffs ? (
                      // Linha única com mudança: diff por caractere
                      charDiffs.left.map((c, i) => {
                        let style = '';
                        if (c.type === 'removed') {
                          style = 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 rounded px-[1px]';
                        } else if (c.type === 'changed') {
                          style = 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded px-[1px]';
                        }
                        return (
                          <span key={i} className={style}>
                            {c.char}
                          </span>
                        );
                      })
                    ) : (
                      // Linha removida sem par
                      <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 rounded px-1 line-through">
                        {contentA}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>

                {/* Coluna B (After) */}
                <div className="px-3 py-2 font-mono text-sm break-all">
                  {contentB ? (
                    isMultiline ? (
                      // Multiline: mostra linha por linha
                      multilinePairs!.map((p, i) => (
                        <div key={i} className="whitespace-pre-wrap">
                          {p.right || <span className="text-gray-400 dark:text-gray-600">∅</span>}
                        </div>
                      ))
                    ) : line.isChanged && charDiffs ? (
                      // Linha única com mudança: diff por caractere
                      charDiffs.right.map((c, i) => {
                        let style = '';
                        if (c.type === 'added') {
                          style = 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded px-[1px]';
                        } else if (c.type === 'changed') {
                          style = 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 rounded px-[1px]';
                        }
                        return (
                          <span key={i} className={style}>
                            {c.char}
                          </span>
                        );
                      })
                    ) : (
                      // Linha adicionada sem par
                      <span className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded px-1">
                        {contentB}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}