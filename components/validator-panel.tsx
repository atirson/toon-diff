'use client';

import { ToonValidationError } from '@/lib/types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ValidatorPanelProps {
  errors: ToonValidationError[];
  isValid: boolean | null;
}

export function ValidatorPanel({ errors, isValid }: ValidatorPanelProps) {
  if (isValid === null) {
    return (
      <div className="flex flex-col items-center justify-center h-32 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-3 p-6 text-center">
        <Info className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click "Validate TOON" to check this document for structural issues</p>
        </div>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-green-800 dark:text-green-300">Valid TOON</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            No validation errors found. Your TOON is well-formed!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-300">
            {errors.length} Validation {errors.length === 1 ? 'Error' : 'Errors'}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-400">
            Your TOON has structural issues that need fixing
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {errors.map((error, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                    Line {error.line}
                  </span>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {error.message}
                  </span>
                </div>
                
                {error.suggestion && (
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {error.suggestion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
