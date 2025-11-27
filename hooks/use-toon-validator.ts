'use client';

import { useState, useCallback } from 'react';
import { ToonValidationError } from '@/lib/types';

export function useToonValidator() {
  const [errors, setErrors] = useState<ToonValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = useCallback((content: string): ToonValidationError[] => {
    const validationErrors: ToonValidationError[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Validate array declarations
      const arrayMatch = trimmed.match(/^(\w+)\[(\d+)\](?:\{([^}]+)\})?:?\s*(.*)$/);
      if (arrayMatch) {
        const [, name, count, fields, inlineContent] = arrayMatch;
        const declaredCount = parseInt(count ?? '0', 10);
        
        if (fields) {
          // Tabular array validation
          const fieldList = fields.split(',').map(f => f.trim());
          const fieldCount = fieldList.length;
          let actualRows = 0;
          
          // Count and validate data rows
          const indent = line.search(/\S/);
          for (let j = i + 1; j < lines.length; j++) {
            const dataLine = lines[j]?.trim() ?? '';
            if (!dataLine) continue;
            
            const dataIndent = (lines[j] ?? '').search(/\S/);
            if (dataIndent <= indent) break;
            
            actualRows++;
            const values = dataLine.split(',').map(v => v.trim());
            
            // Check column count
            if (values.length !== fieldCount) {
              validationErrors.push({
                line: j + 1,
                message: `Row has ${values.length} columns but ${fieldCount} fields declared`,
                severity: 'error',
                suggestion: `Ensure this row has exactly ${fieldCount} comma-separated values`
              });
            }
          }
          
          // Validate row count
          if (actualRows !== declaredCount) {
            validationErrors.push({
              line: i + 1,
              message: `Array '${name}' declares [${declaredCount}] but has ${actualRows} rows`,
              severity: 'error',
              suggestion: `Change [${declaredCount}] to [${actualRows}] or add/remove rows`
            });
          }
        } else if (inlineContent) {
          // Inline array validation
          const items = inlineContent.split(',').map(v => v.trim()).filter(Boolean);
          if (items.length !== declaredCount) {
            validationErrors.push({
              line: i + 1,
              message: `Array '${name}' declares [${declaredCount}] but has ${items.length} items`,
              severity: 'error',
              suggestion: `Change [${declaredCount}] to [${items.length}] or adjust items`
            });
          }
        }
      }
      
      // Validate proper key:value format
      if (trimmed.includes(':') && !trimmed.match(/^\w+\[\d+\]/)) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        
        if (!key || !/^\w+$/.test(key)) {
          validationErrors.push({
            line: i + 1,
            message: 'Invalid key format',
            severity: 'error',
            suggestion: 'Keys should contain only letters, numbers, and underscores'
          });
        }
      }
    }
    
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
    return validationErrors;
  }, []);

  return { validate, errors, isValid };
}
