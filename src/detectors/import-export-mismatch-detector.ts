import { ImportInfo, ExportInfo, Issue, FunctionInfo } from '../types/analysis';
import { Detector } from '../types/detector';
import { EnhancedASTParser } from '../analysis/ast-parser-enhanced';
import { FileUtils } from '../utils/file-utils';
import * as path from 'path';

export class ImportExportMismatchDetector implements Detector {
  private parser: EnhancedASTParser;

  constructor() {
    this.parser = new EnhancedASTParser({
      enableTreeSitter: true,
      fallbackToRegex: true,
      debugMode: false
    });
  }

  /**
   * Detect import/export mismatches across all files
   * @param files - All files to analyze
   * @param functions - Optional function info (not used by this detector)
   * @returns Array of issues for import/export mismatches
   */
  async detect(files: string[], functions?: FunctionInfo[]): Promise<Issue[]> {
    const issues: Issue[] = [];

    // Extract all imports and exports from all files
    const { imports, exports } = await this.extractImportsAndExports(files);

    // Create export map for quick lookup by file
    const exportMap = this.createExportMap(exports);

    // Check each import against available exports
    for (const importInfo of imports) {
      const mismatchIssue = await this.checkImportMismatch(importInfo, exportMap, files);
      if (mismatchIssue) {
        issues.push(mismatchIssue);
      }
    }

    return issues;
  }

  /**
   * Extract all imports and exports from the provided files
   */
  private async extractImportsAndExports(allFiles: string[]): Promise<{
    imports: ImportInfo[];
    exports: ExportInfo[];
  }> {
    const imports: ImportInfo[] = [];
    const exports: ExportInfo[] = [];

    for (const file of allFiles) {
      try {
        const fileInfo = await FileUtils.getFileInfo(file);
        if (!fileInfo.isJavaScript) {
          continue;
        }

        // Extract imports and exports using AST parser
        const fileImports = await this.extractImportsFromFile(fileInfo.content, file);
        const fileExports = await this.extractExportsFromFile(fileInfo.content, file);

        imports.push(...fileImports);
        exports.push(...fileExports);
      } catch (error) {
        console.warn(`Failed to extract imports/exports from ${file}:`, error);
      }
    }

    return { imports, exports };
  }

  /**
   * Extract import statements from a file
   */
  private async extractImportsFromFile(content: string, filePath: string): Promise<ImportInfo[]> {
    const imports: ImportInfo[] = [];
    const lines = content.split('\n');

    // Simple regex-based extraction for MVP
    // TODO: Replace with proper AST parsing when tree-sitter import extraction is ready
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      
      if (importMatch) {
        const [, namedImports, namespaceImport, defaultImport, modulePath] = importMatch;
        
        if (namedImports) {
          // Named imports: import { a, b, c } from './module'
          const names = namedImports.split(',').map(name => name.trim());
          for (const name of names) {
            imports.push({
              importName: name,
              modulePath,
              isDefault: false,
              isNamespace: false,
              file: filePath,
              line: i + 1,
              column: line.indexOf(name)
            });
          }
        } else if (namespaceImport) {
          // Namespace import: import * as name from './module'
          imports.push({
            importName: namespaceImport,
            modulePath,
            isDefault: false,
            isNamespace: true,
            file: filePath,
            line: i + 1,
            column: line.indexOf(namespaceImport)
          });
        } else if (defaultImport) {
          // Default import: import name from './module'
          imports.push({
            importName: defaultImport,
            modulePath,
            isDefault: true,
            isNamespace: false,
            file: filePath,
            line: i + 1,
            column: line.indexOf(defaultImport)
          });
        }
      }
    }

    return imports;
  }

  /**
   * Extract export statements from a file
   */
  private async extractExportsFromFile(content: string, filePath: string): Promise<ExportInfo[]> {
    const exports: ExportInfo[] = [];
    const lines = content.split('\n');

    // Simple regex-based extraction for MVP
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Named exports: export function name() {} or export const name = ...
      const namedExportMatch = line.match(/export\s+(?:function|const|let|var|class)\s+(\w+)/);
      if (namedExportMatch) {
        exports.push({
          exportName: namedExportMatch[1],
          isDefault: false,
          file: filePath,
          line: i + 1,
          column: line.indexOf(namedExportMatch[1])
        });
      }

      // Default exports: export default ...
      const defaultExportMatch = line.match(/export\s+default\s+(?:function\s+(\w+)|(\w+))/);
      if (defaultExportMatch) {
        const name = defaultExportMatch[1] || defaultExportMatch[2] || 'default';
        exports.push({
          exportName: name,
          isDefault: true,
          file: filePath,
          line: i + 1,
          column: line.indexOf('default')
        });
      }

      // Export lists: export { a, b, c }
      const exportListMatch = line.match(/export\s+{([^}]+)}/);
      if (exportListMatch) {
        const names = exportListMatch[1].split(',').map(name => name.trim());
        for (const name of names) {
          exports.push({
            exportName: name,
            isDefault: false,
            file: filePath,
            line: i + 1,
            column: line.indexOf(name)
          });
        }
      }
    }

    return exports;
  }

  /**
   * Create a map of exports by file path for quick lookup
   */
  private createExportMap(exports: ExportInfo[]): Map<string, ExportInfo[]> {
    const exportMap = new Map<string, ExportInfo[]>();

    for (const exportInfo of exports) {
      if (!exportMap.has(exportInfo.file)) {
        exportMap.set(exportInfo.file, []);
      }
      exportMap.get(exportInfo.file)!.push(exportInfo);
    }

    return exportMap;
  }

  /**
   * Check if an import has a corresponding export
   */
  private async checkImportMismatch(
    importInfo: ImportInfo,
    exportMap: Map<string, ExportInfo[]>,
    allFiles: string[]
  ): Promise<Issue | null> {
    // Resolve the module path to absolute path
    const resolvedPath = this.resolveModulePath(importInfo.modulePath, importInfo.file, allFiles);
    
    if (!resolvedPath) {
      // Module file not found
      return this.createMismatchIssue(
        importInfo,
        `Module '${importInfo.modulePath}' not found`,
        []
      );
    }

    // Get exports from the target file
    const availableExports = exportMap.get(resolvedPath) || [];

    // Check if the import exists in the exports
    const matchingExport = this.findMatchingExport(importInfo, availableExports);

    if (!matchingExport) {
      // Import not found in exports
      const availableNames = availableExports.map(exp => exp.exportName);
      return this.createMismatchIssue(
        importInfo,
        `Function '${importInfo.importName}' is imported but not exported from '${importInfo.modulePath}'.`,
        availableNames
      );
    }

    return null;
  }

  /**
   * Find matching export for an import
   */
  private findMatchingExport(importInfo: ImportInfo, availableExports: ExportInfo[]): ExportInfo | null {
    return availableExports.find(exp => {
      // Default imports match default exports
      if (importInfo.isDefault && exp.isDefault) {
        return true;
      }
      
      // Named imports match named exports
      if (!importInfo.isDefault && !exp.isDefault && importInfo.importName === exp.exportName) {
        return true;
      }

      return false;
    }) || null;
  }

  /**
   * Resolve module path to absolute file path
   */
  private resolveModulePath(modulePath: string, fromFile: string, allFiles: string[]): string | null {
    // Handle relative paths
    if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      const resolved = path.resolve(fromDir, modulePath);

      // Try different extensions
      const candidates = [
        resolved + '.ts',
        resolved + '.js',
        resolved + '.tsx',
        resolved + '.jsx',
        resolved + '/index.ts',
        resolved + '/index.js'
      ];

      for (const candidate of candidates) {
        if (allFiles.includes(candidate)) {
          return candidate;
        }
      }
    }

    return null;
  }

  /**
   * Create an import/export mismatch issue
   */
  private createMismatchIssue(
    importInfo: ImportInfo,
    message: string,
    availableExports: string[]
  ): Issue {
    return {
      id: `import-mismatch-${importInfo.importName}-${importInfo.line}-${Date.now()}`,
      type: 'MissingExport',
      severity: 'error',
      message,
      file: importInfo.file,
      line: importInfo.line,
      column: importInfo.column,
      details: {
        importName: importInfo.importName,
        modulePath: importInfo.modulePath,
        availableExports,
        context: `Import statement at ${importInfo.file}:${importInfo.line}`,
        isDefault: importInfo.isDefault
      },
      suggestions: [
        availableExports.length > 0 
          ? `Available exports: ${availableExports.join(', ')}`
          : 'No exports found in target module',
        `Check if '${importInfo.importName}' was renamed or removed`,
        'Verify the module path is correct',
        'This may be an AI-generated import that doesn\'t match the actual exports'
      ],
      confidence: 0.95
    };
  }
}
