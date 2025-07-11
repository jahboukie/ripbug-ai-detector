import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { UsageTracker } from '../usage/usage-tracker';

interface AuthData {
  licenseKey: string;
  user: {
    email: string;
    plan: 'free' | 'pro' | 'team' | 'enterprise';
    id: string;
  };
  expiresAt: string;
  lastValidated: string;
}

interface LoginResult {
  user: {
    email: string;
    plan: 'free' | 'pro' | 'team' | 'enterprise';
    id: string;
  };
  limits: {
    validationsPerMonth: number;
    currentUsage: number;
  };
}

interface AuthStatus {
  authenticated: boolean;
  licenseKey?: string;
  user?: {
    email: string;
    plan: 'free' | 'pro' | 'team' | 'enterprise';
    id: string;
  };
  usage?: {
    current: number;
    limit: number;
  };
}

export class AuthManager {
  private authFile: string;
  private usageTracker: UsageTracker;

  constructor() {
    // Store auth data in user's home directory
    const rippleDir = path.join(os.homedir(), '.ripple');
    this.authFile = path.join(rippleDir, 'auth.json');
    this.usageTracker = new UsageTracker();
  }

  // Login with license key
  async login(licenseKey: string): Promise<LoginResult> {
    try {
      // Validate license key format
      if (!this.isValidLicenseKeyFormat(licenseKey)) {
        throw new Error('Invalid license key format');
      }

      // For MVP, we'll simulate license validation
      // In production, this would call the API
      const result = await this.validateLicenseKey(licenseKey);

      // Save auth data
      const authData: AuthData = {
        licenseKey,
        user: result.user,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        lastValidated: new Date().toISOString()
      };

      await this.saveAuthData(authData);

      // Update usage tracker with new plan
      await this.usageTracker.updatePlan(result.user.plan as any, licenseKey);

      return result;

    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get authentication status
  async getStatus(): Promise<AuthStatus> {
    try {
      const authData = await this.loadAuthData();
      
      if (!authData) {
        return { authenticated: false };
      }

      // Check if auth is expired
      if (new Date(authData.expiresAt) < new Date()) {
        await this.logout();
        return { authenticated: false };
      }

      // Get current usage
      const usage = await this.usageTracker.getUsage();

      return {
        authenticated: true,
        licenseKey: authData.licenseKey,
        user: authData.user,
        usage: {
          current: usage.current,
          limit: usage.limit
        }
      };

    } catch (error) {
      return { authenticated: false };
    }
  }

  // Logout and clear credentials
  async logout(): Promise<void> {
    try {
      if (await fs.pathExists(this.authFile)) {
        await fs.remove(this.authFile);
      }
    } catch (error) {
      // Fail silently
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const status = await this.getStatus();
    return status.authenticated;
  }

  // Get current license key
  async getLicenseKey(): Promise<string | null> {
    const status = await this.getStatus();
    return status.licenseKey || null;
  }

  // Validate license key (MVP implementation)
  private async validateLicenseKey(licenseKey: string): Promise<LoginResult> {
    // For MVP, we'll use a simple validation
    // In production, this would call the actual API
    
    if (licenseKey.startsWith('rpl_free_')) {
      return {
        user: {
          email: 'user@example.com',
          plan: 'free',
          id: 'user_123'
        },
        limits: {
          validationsPerMonth: 50,
          currentUsage: 0
        }
      };
    }

    if (licenseKey.startsWith('rpl_pro_')) {
      return {
        user: {
          email: 'pro@example.com',
          plan: 'pro',
          id: 'user_456'
        },
        limits: {
          validationsPerMonth: -1, // unlimited
          currentUsage: 0
        }
      };
    }

    // For demo purposes, accept any key that looks valid
    if (licenseKey.startsWith('rpl_') && licenseKey.length > 10) {
      return {
        user: {
          email: 'demo@example.com',
          plan: 'free',
          id: 'user_demo'
        },
        limits: {
          validationsPerMonth: 50,
          currentUsage: 0
        }
      };
    }

    throw new Error('Invalid license key');
  }

  // Check license key format
  private isValidLicenseKeyFormat(licenseKey: string): boolean {
    // License keys should start with 'rpl_' and be at least 10 characters
    return licenseKey.startsWith('rpl_') && licenseKey.length >= 10;
  }

  // Load auth data from file
  private async loadAuthData(): Promise<AuthData | null> {
    try {
      if (await fs.pathExists(this.authFile)) {
        return await fs.readJson(this.authFile);
      }
    } catch (error) {
      // If file is corrupted, treat as not authenticated
    }
    return null;
  }

  // Save auth data to file
  private async saveAuthData(data: AuthData): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.authFile));
      await fs.writeJson(this.authFile, data, { spaces: 2 });
      
      // Set restrictive permissions (user only)
      await fs.chmod(this.authFile, 0o600);
    } catch (error) {
      throw new Error(`Failed to save authentication data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
