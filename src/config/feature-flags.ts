// Feature Flags for Gradual Tree-sitter Rollout
// Following Claude S4's smart rollout strategy

import fs from 'fs';
import path from 'path';

export interface FeatureFlagConfig {
  treeSitterEnabled: boolean;
  treeSitterPercentage: number;
  complexityThreshold: number;
  enableForTypeScript: boolean;
  enableForComplexFiles: boolean;
  debugMode: boolean;
}

export class FeatureFlags {
  private static config: FeatureFlagConfig = {
    treeSitterEnabled: true,
    treeSitterPercentage: 0.3, // 30% rollout for simple files
    complexityThreshold: 0.7,
    enableForTypeScript: true,
    enableForComplexFiles: true,
    debugMode: false
  };

  // Main decision method - should we use tree-sitter for this file?
  static shouldUseTreeSitter(filePath: string): boolean {
    if (!this.config.treeSitterEnabled) {
      return false;
    }

    try {
      // Always enable for TypeScript files (tree-sitter excels here)
      if (this.config.enableForTypeScript && this.isTypeScriptFile(filePath)) {
        if (this.config.debugMode) {
          console.log(`🌳 Tree-sitter enabled for TypeScript file: ${filePath}`);
        }
        return true;
      }

      // Enable for complex files first (where tree-sitter shines)
      if (this.config.enableForComplexFiles) {
        const complexity = this.assessFileComplexity(filePath);
        if (complexity > this.config.complexityThreshold) {
          if (this.config.debugMode) {
            console.log(`🌳 Tree-sitter enabled for complex file (${complexity.toFixed(2)}): ${filePath}`);
          }
          return true;
        }
      }

      // Random percentage rollout for remaining files
      const shouldEnable = Math.random() < this.config.treeSitterPercentage;
      if (this.config.debugMode && shouldEnable) {
        console.log(`🌳 Tree-sitter enabled via random rollout: ${filePath}`);
      }
      
      return shouldEnable;
    } catch (error) {
      if (this.config.debugMode) {
        console.warn(`⚠️ Error in feature flag decision for ${filePath}:`, error);
      }
      return false;
    }
  }

  // Assess file complexity using heuristics
  private static assessFileComplexity(filePath: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let score = 0;

      // Complex patterns increase score
      if (content.includes('interface ')) score += 0.2;
      if (content.includes('type ')) score += 0.15;
      if (content.includes('<') && content.includes('>')) score += 0.2; // Generics
      if (content.includes('destructur') || content.includes('...')) score += 0.2;
      if (content.includes('async ') || content.includes('await ')) score += 0.1;
      if (content.match(/\{[^}]{50,}\}/)) score += 0.3; // Complex objects
      if (content.includes('class ')) score += 0.15;
      if (content.includes('extends ') || content.includes('implements ')) score += 0.1;
      
      // File size factor
      const lines = content.split('\n').length;
      if (lines > 100) score += 0.1;
      if (lines > 300) score += 0.1;

      // Import complexity
      const importCount = (content.match(/import .* from/g) || []).length;
      if (importCount > 5) score += 0.1;
      if (importCount > 10) score += 0.1;

      return Math.min(score, 1.0);
    } catch (error) {
      return 0; // Default to simple if can't read file
    }
  }

  // Check if file is TypeScript
  private static isTypeScriptFile(filePath: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  }

  // Runtime configuration methods
  static setTreeSitterEnabled(enabled: boolean): void {
    this.config.treeSitterEnabled = enabled;
    if (this.config.debugMode) {
      console.log(`🔧 Tree-sitter globally ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  static setTreeSitterPercentage(percentage: number): void {
    this.config.treeSitterPercentage = Math.max(0, Math.min(1, percentage));
    if (this.config.debugMode) {
      console.log(`🔧 Tree-sitter rollout percentage set to ${(percentage * 100).toFixed(1)}%`);
    }
  }

  static increaseTreeSitterPercentage(increment: number = 0.1): void {
    const newPercentage = Math.min(1.0, this.config.treeSitterPercentage + increment);
    this.setTreeSitterPercentage(newPercentage);
  }

  static decreaseTreeSitterPercentage(decrement: number = 0.1): void {
    const newPercentage = Math.max(0.0, this.config.treeSitterPercentage - decrement);
    this.setTreeSitterPercentage(newPercentage);
  }

  static setComplexityThreshold(threshold: number): void {
    this.config.complexityThreshold = Math.max(0, Math.min(1, threshold));
    if (this.config.debugMode) {
      console.log(`🔧 Complexity threshold set to ${threshold.toFixed(2)}`);
    }
  }

  static setDebugMode(enabled: boolean): void {
    this.config.debugMode = enabled;
    console.log(`🔧 Feature flags debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get current configuration
  static getConfig(): FeatureFlagConfig {
    return { ...this.config };
  }

  // Get statistics for monitoring
  static getStats(): {
    enabled: boolean;
    rolloutPercentage: number;
    complexityThreshold: number;
    typeScriptEnabled: boolean;
    complexFilesEnabled: boolean;
  } {
    return {
      enabled: this.config.treeSitterEnabled,
      rolloutPercentage: this.config.treeSitterPercentage,
      complexityThreshold: this.config.complexityThreshold,
      typeScriptEnabled: this.config.enableForTypeScript,
      complexFilesEnabled: this.config.enableForComplexFiles
    };
  }

  // Load configuration from file (for production deployment)
  static loadConfig(configPath?: string): void {
    try {
      const configFile = configPath || path.join(process.cwd(), '.ripbug-features.json');
      if (fs.existsSync(configFile)) {
        const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        this.config = { ...this.config, ...fileConfig };
        
        if (this.config.debugMode) {
          console.log(`🔧 Feature flags loaded from ${configFile}:`, this.config);
        }
      }
    } catch (error) {
      if (this.config.debugMode) {
        console.warn('⚠️ Failed to load feature flag config:', error);
      }
    }
  }

  // Save current configuration to file
  static saveConfig(configPath?: string): void {
    try {
      const configFile = configPath || path.join(process.cwd(), '.ripbug-features.json');
      fs.writeFileSync(configFile, JSON.stringify(this.config, null, 2));
      
      if (this.config.debugMode) {
        console.log(`💾 Feature flags saved to ${configFile}`);
      }
    } catch (error) {
      if (this.config.debugMode) {
        console.warn('⚠️ Failed to save feature flag config:', error);
      }
    }
  }

  // Emergency rollback - disable tree-sitter immediately
  static emergencyRollback(): void {
    this.config.treeSitterEnabled = false;
    this.config.treeSitterPercentage = 0;
    console.warn('🚨 EMERGENCY ROLLBACK: Tree-sitter disabled');
    
    // Save rollback state
    this.saveConfig();
  }

  // Smart rollout based on success metrics
  static adjustRolloutBasedOnMetrics(successRate: number, errorRate: number): void {
    if (successRate > 0.95 && errorRate < 0.02) {
      // High success, low errors - increase rollout
      this.increaseTreeSitterPercentage(0.1);
      if (this.config.debugMode) {
        console.log(`📈 Increasing tree-sitter rollout due to high success rate (${(successRate * 100).toFixed(1)}%)`);
      }
    } else if (successRate < 0.85 || errorRate > 0.05) {
      // Low success or high errors - decrease rollout
      this.decreaseTreeSitterPercentage(0.1);
      if (this.config.debugMode) {
        console.log(`📉 Decreasing tree-sitter rollout due to issues (success: ${(successRate * 100).toFixed(1)}%, errors: ${(errorRate * 100).toFixed(1)}%)`);
      }
    }
  }
}
