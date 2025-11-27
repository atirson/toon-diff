// Types for TOON Diff & Validator

export interface ToonValidationError {
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ToonParseResult {
  success: boolean;
  data?: any;
  errors: ToonValidationError[];
}

export interface ToonDiffResult {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  lineA?: number;
  lineB?: number;
  contentA?: string;
  contentB?: string;
  tokens?: TokenDiff[];
}

export interface TokenDiff {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  value: string;
}

export interface TokenCount {
  total: number;
  breakdown?: {
    keys: number;
    values: number;
    structure: number;
  };
}

export interface CompactnessScore {
  tokensA: number;
  tokensB: number;
  difference: number;
  percentageDiff: number;
  compactnessScore: number;
}

export interface ToonArrayDeclaration {
  name: string;
  count: number;
  fields?: string[];
  isTabular: boolean;
}
