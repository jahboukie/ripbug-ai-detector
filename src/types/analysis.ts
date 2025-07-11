// Core analysis types and interfaces

export interface AnalysisResult {
  success: boolean;
  confidence: number;
  aiGenerated: boolean;
  issues: Issue[];
  summary: AnalysisSummary;
  metadata: AnalysisMetadata;
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: 'error' | 'warning';
  message: string;
  file: string;
  line?: number;
  column?: number;
  details: IssueDetails;
  suggestions?: string[];
  confidence: number;
}

export type IssueType = 
  | 'function-signature-change'
  | 'import-export-mismatch'
  | 'type-mismatch'
  | 'cascading-change'
  | 'test-break'
  | 'ai-pattern-detected';

export interface IssueDetails {
  // Function signature changes
  functionName?: string;
  oldSignature?: string;
  newSignature?: string;
  affectedFiles?: AffectedFile[];

  // Import/export issues
  importName?: string;
  exportName?: string;
  modulePath?: string;
  availableExports?: string[];

  // Type issues
  typeName?: string;
  expectedType?: string;
  actualType?: string;

  // AI detection
  aiPatterns?: string[];
  aiConfidence?: number;

  // Enhanced tree-sitter analysis
  breakingChangeType?: string;
  treeSitterDetected?: boolean;

  // General
  context?: string;
  codeSnippet?: string;
}

export interface AffectedFile {
  path: string;
  line: number;
  column?: number;
  context: string;
  suggestion?: string;
}

export interface AnalysisSummary {
  filesAnalyzed: number;
  errors: number;
  warnings: number;
  aiDetections: number;
  timeMs: number;
}

export interface AnalysisMetadata {
  version: string;
  timestamp: string;
  gitCommit?: string;
  branch?: string;
  aiDetectionEnabled: boolean;
  rulesUsed: string[];
}

// AST-related types
export interface FunctionInfo {
  name: string;
  parameters: Parameter[];
  returnType?: string;
  file: string;
  line: number;
  column: number;
  isExported: boolean;
  isAsync: boolean;
  isArrow: boolean;
}

export interface Parameter {
  name: string;
  type?: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ImportInfo {
  importName: string;
  modulePath: string;
  isDefault: boolean;
  isNamespace: boolean;
  file: string;
  line: number;
  column: number;
}

export interface ExportInfo {
  exportName: string;
  isDefault: boolean;
  file: string;
  line: number;
  column: number;
  type?: string;
}

export interface TypeInfo {
  name: string;
  definition: string;
  file: string;
  line: number;
  column: number;
  isInterface: boolean;
  isType: boolean;
  isEnum: boolean;
}

// AI Detection types
export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  patterns: AIPattern[];
  reasoning: string[];
}

export interface AIPattern {
  type: string;
  confidence: number;
  evidence: string;
  weight: number;
}

// Git-related types
export interface GitChange {
  file: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff?: string;
}

export interface GitInfo {
  isRepository: boolean;
  branch?: string;
  commit?: string;
  hasChanges: boolean;
  stagedFiles: string[];
  modifiedFiles: string[];
}

// Configuration types (re-export from config)
export interface DetectionRule {
  enabled: boolean;
  severity: 'error' | 'warning';
  options?: Record<string, any>;
}

// Usage tracking types
export interface UsageInfo {
  current: number;
  limit: number;
  resetDate: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
}

export interface ValidationEvent {
  timestamp: string;
  filesCount: number;
  aiDetected: boolean;
  issuesFound: number;
  timeMs: number;
}
