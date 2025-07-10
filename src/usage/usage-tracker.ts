import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { UsageInfo, ValidationEvent } from '../types/analysis';

interface UsageData {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  currentMonth: string;
  validationsThisMonth: number;
  lastReset: string;
  events: ValidationEvent[];
  licenseKey?: string;
}

export class UsageTracker {
  private usageFile: string;
  private defaultLimits = {
    free: 10,
    pro: -1, // unlimited
    team: -1, // unlimited
    enterprise: -1 // unlimited
  };

  constructor() {
    // Store usage data in user's home directory
    const rippleDir = path.join(os.homedir(), '.ripple');
    this.usageFile = path.join(rippleDir, 'usage.json');
  }

  // Get current usage information
  async getUsage(): Promise<UsageInfo> {
    const data = await this.loadUsageData();
    const currentMonth = this.getCurrentMonth();
    
    // Reset if new month
    if (data.currentMonth !== currentMonth) {
      data.currentMonth = currentMonth;
      data.validationsThisMonth = 0;
      data.lastReset = new Date().toISOString();
      data.events = [];
      await this.saveUsageData(data);
    }

    const limit = this.defaultLimits[data.plan];
    
    return {
      current: data.validationsThisMonth,
      limit: limit === -1 ? 999999 : limit, // Show large number for unlimited
      resetDate: this.getNextResetDate(),
      plan: data.plan
    };
  }

  // Check if user can perform validation
  async canValidate(): Promise<boolean> {
    const usage = await this.getUsage();
    
    // Pro and above have unlimited validations
    if (usage.plan !== 'free') {
      return true;
    }
    
    return usage.current < usage.limit;
  }

  // Track a validation event
  async trackValidation(filesCount: number, aiDetected: boolean, timeMs: number = 0): Promise<void> {
    const data = await this.loadUsageData();
    const currentMonth = this.getCurrentMonth();
    
    // Reset if new month
    if (data.currentMonth !== currentMonth) {
      data.currentMonth = currentMonth;
      data.validationsThisMonth = 0;
      data.lastReset = new Date().toISOString();
      data.events = [];
    }

    // Increment validation count
    data.validationsThisMonth++;

    // Add event
    const event: ValidationEvent = {
      timestamp: new Date().toISOString(),
      filesCount,
      aiDetected,
      issuesFound: 0, // Will be updated by caller if needed
      timeMs
    };

    data.events.push(event);

    // Keep only last 100 events
    if (data.events.length > 100) {
      data.events = data.events.slice(-100);
    }

    await this.saveUsageData(data);
  }

  // Update plan (when user upgrades)
  async updatePlan(plan: 'free' | 'pro' | 'team' | 'enterprise', licenseKey?: string): Promise<void> {
    const data = await this.loadUsageData();
    data.plan = plan;
    if (licenseKey) {
      data.licenseKey = licenseKey;
    }
    await this.saveUsageData(data);
  }

  // Get usage statistics
  async getStats(): Promise<{
    totalValidations: number;
    aiDetections: number;
    averageFiles: number;
    averageTime: number;
  }> {
    const data = await this.loadUsageData();
    
    if (data.events.length === 0) {
      return {
        totalValidations: 0,
        aiDetections: 0,
        averageFiles: 0,
        averageTime: 0
      };
    }

    const totalValidations = data.events.length;
    const aiDetections = data.events.filter(e => e.aiDetected).length;
    const totalFiles = data.events.reduce((sum, e) => sum + e.filesCount, 0);
    const totalTime = data.events.reduce((sum, e) => sum + e.timeMs, 0);

    return {
      totalValidations,
      aiDetections,
      averageFiles: Math.round(totalFiles / totalValidations),
      averageTime: Math.round(totalTime / totalValidations)
    };
  }

  // Load usage data from file
  private async loadUsageData(): Promise<UsageData> {
    try {
      await fs.ensureDir(path.dirname(this.usageFile));
      
      if (await fs.pathExists(this.usageFile)) {
        const data = await fs.readJson(this.usageFile);
        return {
          plan: 'free',
          currentMonth: this.getCurrentMonth(),
          validationsThisMonth: 0,
          lastReset: new Date().toISOString(),
          events: [],
          ...data
        };
      }
    } catch (error) {
      // If file is corrupted, start fresh
    }

    // Return default data
    return {
      plan: 'free',
      currentMonth: this.getCurrentMonth(),
      validationsThisMonth: 0,
      lastReset: new Date().toISOString(),
      events: []
    };
  }

  // Save usage data to file
  private async saveUsageData(data: UsageData): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.usageFile));
      await fs.writeJson(this.usageFile, data, { spaces: 2 });
    } catch (error) {
      // Fail silently - usage tracking is not critical
    }
  }

  // Get current month string (YYYY-MM)
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get next reset date (first day of next month)
  private getNextResetDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
  }

  // Clear all usage data (for testing)
  async clearUsage(): Promise<void> {
    try {
      if (await fs.pathExists(this.usageFile)) {
        await fs.remove(this.usageFile);
      }
    } catch (error) {
      // Fail silently
    }
  }
}
