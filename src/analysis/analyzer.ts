import { AnalysisResult, Issue, AnalysisSummary, AnalysisMetadata, FunctionInfo } from '../types/analysis';
import { Detector } from '../types/detector';
import { EnhancedASTParser } from './ast-parser-enhanced';
import { FileUtils } from '../utils/file-utils';

export class RipBugAnalyzer {
  private parser: EnhancedASTParser;

  constructor(private detectors: Detector[]) {
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  async analyze(files: string[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    const validFiles = await this.filterValidFiles(files);

    if (validFiles.length === 0) return this.createEmptyResult(startTime);

    const issues: Issue[] = [];

    // Parse functions for detectors that need them
    const functions = await this.parseFunctionsFromFiles(validFiles);

    // Run all detectors
    for (const detector of this.detectors) {
      try {
        const detectorIssues = await detector.detect(validFiles, functions);
        issues.push(...detectorIssues);
      } catch (error) {
        console.warn(`Detector ${detector.constructor.name} failed:`, error);
      }
    }

    const endTime = Date.now();

    const summary: AnalysisSummary = {
      filesAnalyzed: validFiles.length,
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      aiDetections: issues.filter(i => i.type === 'ai-pattern-detected').length,
      timeMs: endTime - startTime
    };

    const metadata: AnalysisMetadata = {
      version: '0.1',
      timestamp: new Date().toISOString(),
      aiDetectionEnabled: false,
      rulesUsed: this.detectors.map(d => d.constructor.name)
    };

    return {
      success: summary.errors === 0,
      confidence: 1,
      aiGenerated: false,
      issues,
      summary,
      metadata
    };
  }

  private async filterValidFiles(files: string[]): Promise<string[]> {
    const validFiles: string[] = [];

    for (const file of files) {
      try {
        const exists = await FileUtils.exists(file);
        const isSupported = FileUtils.isSupportedFile(file);
        const shouldInclude = this.shouldIncludeFile(file);

        if (exists && isSupported && shouldInclude) {
          validFiles.push(file);
        }
      } catch {}
    }

    return validFiles;
  }

  private shouldIncludeFile(file: string): boolean {
    const relativePath = FileUtils.getRelativePath(file);
    return relativePath.endsWith('.js') || relativePath.endsWith('.ts') ||
           relativePath.endsWith('.jsx') || relativePath.endsWith('.tsx');
  }

  private calculateOverallConfidence(issues: Issue[], aiConfidence: number): number {
    if (issues.length === 0) return 0.95;

    const issueConfidences = issues.map(i => i.confidence);
    const avgIssueConfidence = issueConfidences.reduce((sum, conf) => sum + conf, 0) / issueConfidences.length;
    return Math.min((avgIssueConfidence + aiConfidence) / 2, 0.99);
  }

  private async parseFunctionsFromFiles(files: string[]): Promise<FunctionInfo[]> {
    const allFunctions: FunctionInfo[] = [];

    for (const file of files) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (fileInfo.isJavaScript) {
          const functions = this.parser.extractFunctions(fileInfo.content, file);
          allFunctions.push(...functions);
        }
      } catch (error) {
        console.warn(`Failed to parse functions from ${file}:`, error);
      }
    }

    return allFunctions;
  }



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
        version: '0.1',
        timestamp: new Date().toISOString(),
        aiDetectionEnabled: false,
        rulesUsed: this.detectors.map(d => d.constructor.name)
      }
    };
  }
}
