import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export interface FileInfo {
  path: string;
  content: string;
  extension: string;
  isTypeScript: boolean;
  isJavaScript: boolean;
}

export class FileUtils {
  // Check if file exists
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Read file content
  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  // Write file content
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Get file info
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    const content = await this.readFile(filePath);
    const extension = path.extname(filePath);
    
    return {
      path: filePath,
      content,
      extension,
      isTypeScript: ['.ts', '.tsx'].includes(extension),
      isJavaScript: ['.js', '.jsx', '.ts', '.tsx'].includes(extension)
    };
  }

  // Find files matching patterns
  static async findFiles(patterns: string[], cwd: string = process.cwd()): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { 
        cwd,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
      });
      allFiles.push(...files.map(f => path.resolve(cwd, f)));
    }
    
    // Remove duplicates
    return [...new Set(allFiles)];
  }

  // Get JavaScript/TypeScript files in directory
  static async getJSFiles(directory: string = process.cwd()): Promise<string[]> {
    return this.findFiles([
      '**/*.js',
      '**/*.jsx', 
      '**/*.ts',
      '**/*.tsx'
    ], directory);
  }

  // Check if file is supported
  static isSupportedFile(filePath: string): boolean {
    const extension = path.extname(filePath);
    return ['.js', '.jsx', '.ts', '.tsx'].includes(extension);
  }

  // Get relative path from cwd
  static getRelativePath(filePath: string, basePath: string = process.cwd()): string {
    return path.relative(basePath, filePath);
  }

  // Ensure directory exists
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  // Get file stats
  static async getStats(filePath: string): Promise<fs.Stats> {
    return fs.stat(filePath);
  }

  // Check if path is directory
  static async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await this.getStats(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Get files modified in last N minutes
  static async getRecentlyModified(directory: string, minutes: number = 60): Promise<string[]> {
    const files = await this.getJSFiles(directory);
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentFiles: string[] = [];

    for (const file of files) {
      try {
        const stats = await this.getStats(file);
        if (stats.mtime.getTime() > cutoff) {
          recentFiles.push(file);
        }
      } catch {
        // Skip files that can't be accessed
      }
    }

    return recentFiles;
  }
}
