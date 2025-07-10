import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
import path from 'path';
import { FileUtils } from '../utils/file-utils';
import { GitInfo, GitChange } from '../types/analysis';

export class GitManager {
  private git: SimpleGit;
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
    this.git = simpleGit(cwd);
  }

  // Check if current directory is a git repository
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  // Get git repository information
  async getGitInfo(): Promise<GitInfo> {
    try {
      const isRepo = await this.isGitRepository();
      
      if (!isRepo) {
        return {
          isRepository: false,
          hasChanges: false,
          stagedFiles: [],
          modifiedFiles: []
        };
      }

      const status = await this.git.status();
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      const commit = await this.git.revparse(['HEAD']).catch(() => undefined);

      return {
        isRepository: true,
        branch: branch.trim(),
        commit: commit?.trim(),
        hasChanges: status.files.length > 0,
        stagedFiles: status.staged,
        modifiedFiles: status.modified
      };

    } catch (error) {
      throw new Error(`Git operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get staged files (ready to commit)
  async getStagedFiles(): Promise<string[]> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return [];
      }

      const status = await this.git.status();
      
      // Get staged files and convert to absolute paths
      const stagedFiles = status.staged
        .filter(file => FileUtils.isSupportedFile(file))
        .map(file => path.resolve(this.cwd, file));

      return stagedFiles;

    } catch (error) {
      throw new Error(`Failed to get staged files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all modified files (staged + unstaged)
  async getModifiedFiles(): Promise<string[]> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return [];
      }

      const status = await this.git.status();
      
      // Combine staged and modified files
      const allModified = [...new Set([...status.staged, ...status.modified])]
        .filter(file => FileUtils.isSupportedFile(file))
        .map(file => path.resolve(this.cwd, file));

      return allModified;

    } catch (error) {
      throw new Error(`Failed to get modified files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all JavaScript/TypeScript files in repository
  async getAllJSFiles(): Promise<string[]> {
    try {
      const files = await FileUtils.getJSFiles(this.cwd);
      
      // Filter out files that are ignored by git
      const filteredFiles: string[] = [];
      
      for (const file of files) {
        const relativePath = path.relative(this.cwd, file);
        const isIgnored = await this.isFileIgnored(relativePath);
        
        if (!isIgnored) {
          filteredFiles.push(file);
        }
      }

      return filteredFiles;

    } catch (error) {
      throw new Error(`Failed to get JS files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if file is ignored by git
  async isFileIgnored(filePath: string): Promise<boolean> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return false;
      }

      const result = await this.git.raw(['check-ignore', filePath]).catch(() => null);
      return result !== null;

    } catch {
      return false;
    }
  }

  // Get diff for specific files
  async getDiff(files?: string[]): Promise<string> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return '';
      }

      if (files && files.length > 0) {
        // Get diff for specific files
        const relativePaths = files.map(file => path.relative(this.cwd, file));
        return await this.git.diff(['--cached', ...relativePaths]);
      } else {
        // Get diff for all staged files
        return await this.git.diff(['--cached']);
      }

    } catch (error) {
      throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get changes for analysis
  async getChanges(files?: string[]): Promise<GitChange[]> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return [];
      }

      const status = await this.git.status();
      const changes: GitChange[] = [];

      // Process staged files
      for (const file of status.staged) {
        if (!files || files.some(f => path.resolve(this.cwd, file) === f)) {
          const diff = await this.git.diff(['--cached', '--numstat', file]);
          const stats = this.parseNumstat(diff);
          
          changes.push({
            file: path.resolve(this.cwd, file),
            status: 'modified', // Staged files are considered modified
            additions: stats.additions,
            deletions: stats.deletions
          });
        }
      }

      return changes;

    } catch (error) {
      throw new Error(`Failed to get changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Parse numstat output to get additions/deletions
  private parseNumstat(numstat: string): { additions: number; deletions: number } {
    const lines = numstat.trim().split('\n').filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { additions: 0, deletions: 0 };
    }

    const parts = lines[0].split('\t');
    return {
      additions: parseInt(parts[0]) || 0,
      deletions: parseInt(parts[1]) || 0
    };
  }

  // Get recent commits (for AI pattern detection)
  async getRecentCommits(count: number = 10): Promise<any[]> {
    try {
      const isRepo = await this.isGitRepository();
      if (!isRepo) {
        return [];
      }

      const log = await this.git.log({ maxCount: count });
      return [...log.all];

    } catch (error) {
      throw new Error(`Failed to get recent commits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
