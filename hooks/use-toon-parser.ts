'use client';

import { useState, useCallback } from 'react';
import { ToonParseResult, ToonValidationError } from '@/lib/types';

export function useToonParser() {
  const [parseResult, setParseResult] = useState<ToonParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseToon = useCallback((content: string): ToonParseResult => {
    setIsLoading(true);
    const errors: ToonValidationError[] = [];
    const lines = content.split('\n');
    let currentIndent = 0;
    const result: any = {};
    const stack: { obj: any; indent: number }[] = [{ obj: result, indent: -1 }];

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) continue;

        const indent = line.search(/\S/);
        const indentLevel = indent === -1 ? 0 : Math.floor(indent / 2);

        // Handle array declarations
        if (trimmed.match(/^\w+\[\d+\]/)) {
          const match = trimmed.match(/^(\w+)\[(\d+)\](?:\{([^}]+)\})?:?\s*(.*)$/);
          if (match) {
            const [, name, count, fields, inlineContent] = match;
            const arrayCount = parseInt(count ?? '0', 10);
            
            // Pop stack to appropriate level
            while (stack.length > 0 && (stack[stack.length - 1]?.indent ?? 0) >= indentLevel) {
              stack.pop();
            }
            
            const parent = stack[stack.length - 1]?.obj ?? result;
            
            if (fields) {
              // Tabular array
              const fieldList = fields.split(',').map(f => f.trim());
              const arrayData: any[] = [];
              
              // Parse following lines as data rows
              for (let j = i + 1; j < lines.length; j++) {
                const dataLine = lines[j]?.trim() ?? '';
                if (!dataLine) continue;
                
                // Check if it's still part of this array
                const dataIndent = (lines[j] ?? '').search(/\S/);
                if (dataIndent <= indent) break;
                
                const values = dataLine.split(',').map(v => v.trim());
                const rowObj: any = {};
                
                fieldList.forEach((field, idx) => {
                  rowObj[field] = values[idx] ?? '';
                });
                
                arrayData.push(rowObj);
                i = j;
              }
              
              if (parent) parent[name ?? 'array'] = arrayData;
            } else if (inlineContent) {
              // Inline array
              const items = inlineContent.split(',').map(v => v.trim()).filter(Boolean);
              if (parent) parent[name ?? 'array'] = items;
            } else {
              // Regular array
              if (parent) parent[name ?? 'array'] = [];
            }
          }
        } else if (trimmed.includes(':')) {
          // Object property
          const colonIndex = trimmed.indexOf(':');
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          // Pop stack to appropriate level
          while (stack.length > 0 && (stack[stack.length - 1]?.indent ?? 0) >= indentLevel) {
            stack.pop();
          }
          
          const parent = stack[stack.length - 1]?.obj ?? result;
          
          if (value) {
            // Simple key-value
            if (parent) parent[key] = value;
          } else {
            // Nested object
            const newObj = {};
            if (parent) parent[key] = newObj;
            stack.push({ obj: newObj, indent: indentLevel });
          }
        }
      }

      const parseResult = {
        success: errors.length === 0,
        data: result,
        errors
      };
      
      setParseResult(parseResult);
      setIsLoading(false);
      return parseResult;
    } catch (error) {
      const errorResult = {
        success: false,
        errors: [{
          line: 0,
          message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error' as const
        }]
      };
      setParseResult(errorResult);
      setIsLoading(false);
      return errorResult;
    }
  }, []);

  return { parseToon, parseResult, isLoading };
}
