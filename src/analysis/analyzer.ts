import { AnalysisResult, Issue, AnalysisSummary, AnalysisMetadata } from '../types/analysis';
import { RippleConfig } from '../config/config';
import { FunctionSignatureDetector } from '../detectors/function-signature-detector';
import { AIDetector } from '../detectors/ai-detector';
import { FileUtils } from '../utils/file-utils';

export class RippleAnalyzer {
  private config: RippleConfig;
  private functionDetector: FunctionSignatureDetector;
  private aiDetector: AIDetector;

  constructor(config: RippleConfig) {
    this.config = config;
    this.functionDetector = new FunctionSignatureDetector();
    this.aiDetector = new AIDetector();
  }

  // Main analysis method
  async analyze(files: string[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Filter and validate files
    const validFiles = await this.filterValidFiles(files);
    
    if (validFiles.length === 0) {
      return this.createEmptyResult(startTime);
    }

    // Limit number of files to analyze
    const filesToAnalyze = validFiles.slice(0, this.config.analysis.maxFiles);
    
    const issues: Issue[] = [];

    // Run function signature detection
    if (this.config.rules.functionSignatureChange.enabled) {
      const functionIssues = await this.functionDetector.detect(filesToAnalyze);
      issues.push(...functionIssues);
    }

    // Run AI detection
    let aiGenerated = false;
    let aiConfidence = 0;
    
    if (this.config.aiDetection.enabled) {
      const aiResult = await this.aiDetector.detect(filesToAnalyze);
      aiGenerated = aiResult.isAIGenerated;
      aiConfidence = aiResult.confidence;
      
      // Add AI detection as an issue if confidence is high
      if (aiGenerated && aiConfidence > 0.7) {
        issues.push({
          id: `ai-detection-${Date.now()}`,
          type: 'ai-pattern-detected',
          severity: 'warning',
          message: `AI-generated changes detected (${Math.round(aiConfidence * 100)}% confidence)`,
          file: filesToAnalyze[0], // Primary file
          details: {
            aiPatterns: aiResult.patterns.map(p => p.type),
            aiConfidence,
            context: aiResult.reasoning.join('; ')
          },
          suggestions: [
            'Review changes carefully before committing',
            'Test all affected functionality',
            'Consider running additional validation'
          ],
          confidence: aiConfidence
        });
      }
    }

    const endTime = Date.now();
    
    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(issues, aiConfidence);
    
    // Create summary
    const summary: AnalysisSummary = {
      filesAnalyzed: filesToAnalyze.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      aiDetections: aiGenerated ? 1 : 0,
      timeMs: endTime - startTime
    };

    // Create metadata
    const metadata: AnalysisMetadata = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      aiDetectionEnabled: this.config.aiDetection.enabled,
      rulesUsed: this.getEnabledRules()
    };

    return {
      success: issues.filter(i => i.severity === 'error').length === 0,
      confidence: overallConfidence,
      aiGenerated,
      issues,
      summary,
      metadata
    };
  }

  // Filter files to only include valid, supported files
  private async filterValidFiles(files: string[]): Promise<string[]> {
    const validFiles: string[] = [];

    for (const file of files) {
      try {
        // Check if file exists and is supported
        if (await FileUtils.exists(file) && FileUtils.isSupportedFile(file)) {
          // Check against include/exclude patterns
          if (this.shouldIncludeFile(file)) {
            validFiles.push(file);
          }
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    }

    return validFiles;
  }

  // Check if file should be included based on config patterns
  private shouldIncludeFile(file: string): boolean {
    const relativePath = FileUtils.getRelativePath(file);

    // Check exclude patterns first
    for (const pattern of this.config.analysis.exclude) {
      if (this.matchesPattern(relativePath, pattern)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.config.analysis.include) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  // Simple pattern matching (in production, use a proper glob library)
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex (simplified)
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  // Calculate overall confidence score
  private calculateOverallConfidence(issues: Issue[], aiConfidence: number): number {
    if (issues.length === 0) {
      return 0.95; // High confidence when no issues found
    }

    // Average confidence of all issues
    const issueConfidences = issues.map(i => i.confidence);
    const avgIssueConfidence = issueConfidences.reduce((sum, conf) => sum + conf, 0) / issueConfidences.length;

    // Combine with AI detection confidence
    const combinedConfidence = (avgIssueConfidence + aiConfidence) / 2;

    return Math.min(combinedConfidence, 0.99); // Cap at 99%
  }

  // Get list of enabled rules
  private getEnabledRules(): string[] {
    const rules: string[] = [];

    if (this.config.rules.functionSignatureChange.enabled) {
      rules.push('function-signature-change');
    }
    if (this.config.rules.importExportMismatch.enabled) {
      rules.push('import-export-mismatch');
    }
    if (this.config.rules.typeMismatch.enabled) {
      rules.push('type-mismatch');
    }

    return rules;
  }

  // Create empty result when no files to analyze
  private createEmptyResult(startTime: number): AnalysisResult {
    return {
      success: true,
      confidence: 1.0,
      aiGenerated: false,
      issues: [],
      summary: {
        filesAnalyzed: 0,
        errors: 0,
        warnings: 0,
        aiDetections: 0,
        timeMs: Date.now() - startTime
      },
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        aiDetectionEnabled: this.config.aiDetection.enabled,
        rulesUsed: this.getEnabledRules()
      }
    };
  }
}
