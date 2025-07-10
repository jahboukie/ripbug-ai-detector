import { cosmiconfigSync } from 'cosmiconfig';
import path from 'path';
import { FileUtils } from '../utils/file-utils';

export interface RippleConfig {
  // Analysis settings
  analysis: {
    languages: string[];
    include: string[];
    exclude: string[];
    maxFiles: number;
  };
  
  // Detection rules
  rules: {
    functionSignatureChange: {
      enabled: boolean;
      severity: 'error' | 'warning';
    };
    importExportMismatch: {
      enabled: boolean;
      severity: 'error' | 'warning';
    };
    typeMismatch: {
      enabled: boolean;
      severity: 'error' | 'warning';
    };
  };

  // AI detection settings
  aiDetection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    patterns: string[];
  };

  // Output settings
  output: {
    format: 'console' | 'json';
    verbose: boolean;
    showConfidence: boolean;
  };

  // Usage tracking
  usage: {
    trackingEnabled: boolean;
    apiUrl: string;
  };
}

const DEFAULT_CONFIG: RippleConfig = {
  analysis: {
    languages: ['javascript', 'typescript'],
    include: ['src/**/*.{js,ts,jsx,tsx}', '**/*.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      '**/*.d.ts'
    ],
    maxFiles: 100
  },
  
  rules: {
    functionSignatureChange: {
      enabled: true,
      severity: 'error'
    },
    importExportMismatch: {
      enabled: true,
      severity: 'error'
    },
    typeMismatch: {
      enabled: true,
      severity: 'warning'
    }
  },

  aiDetection: {
    enabled: true,
    sensitivity: 'medium',
    patterns: [
      'multiple-file-changes',
      'function-signature-changes',
      'import-export-changes',
      'type-definition-changes'
    ]
  },

  output: {
    format: 'console',
    verbose: false,
    showConfidence: true
  },

  usage: {
    trackingEnabled: true,
    apiUrl: 'https://api.ripple.dev'
  }
};

export class ConfigManager {
  private static instance: ConfigManager;
  private config: RippleConfig;
  private configPath: string | null = null;

  private constructor() {
    this.config = DEFAULT_CONFIG;
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // Load configuration from file or use defaults
  async loadConfig(searchFrom?: string): Promise<RippleConfig> {
    const explorer = cosmiconfigSync('ripple');
    const result = explorer.search(searchFrom);

    if (result) {
      this.configPath = result.filepath;
      this.config = { ...DEFAULT_CONFIG, ...result.config };
    } else {
      this.config = DEFAULT_CONFIG;
    }

    return this.config;
  }

  // Get current configuration
  getConfig(): RippleConfig {
    return this.config;
  }

  // Create default config file
  async createDefaultConfig(directory: string = process.cwd()): Promise<string> {
    const configPath = path.join(directory, '.ripple.config.js');
    
    const configContent = `module.exports = ${JSON.stringify(DEFAULT_CONFIG, null, 2)};`;
    
    await FileUtils.writeFile(configPath, configContent);
    return configPath;
  }

  // Update configuration
  updateConfig(updates: Partial<RippleConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Get config file path
  getConfigPath(): string | null {
    return this.configPath;
  }

  // Check if config file exists
  async hasConfigFile(directory: string = process.cwd()): Promise<boolean> {
    const possiblePaths = [
      path.join(directory, '.ripple.config.js'),
      path.join(directory, '.ripple.config.json'),
      path.join(directory, 'ripple.config.js'),
      path.join(directory, 'ripple.config.json')
    ];

    for (const configPath of possiblePaths) {
      if (await FileUtils.exists(configPath)) {
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
