<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ripple Wireframes & UI Mockups</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 40px;
            font-size: 2.5rem;
        }
        
        h2 {
            color: #34495e;
            margin: 40px 0 20px 0;
            font-size: 1.8rem;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        h3 {
            color: #2c3e50;
            margin: 30px 0 15px 0;
            font-size: 1.3rem;
        }
        
        .wireframe {
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 20px 0;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .terminal {
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            padding: 20px;
            border-radius: 6px;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        .terminal .prompt {
            color: #4a9eff;
        }
        
        .terminal .success {
            color: #4caf50;
        }
        
        .terminal .error {
            color: #f44336;
        }
        
        .terminal .warning {
            color: #ff9800;
        }
        
        .vscode-mockup {
            background: #1e1e1e;
            color: #d4d4d4;
            border-radius: 6px;
            overflow: hidden;
            margin: 15px 0;
            font-family: 'Consolas', 'Monaco', monospace;
        }
        
        .vscode-titlebar {
            background: #3c3c3c;
            padding: 8px 15px;
            font-size: 12px;
            border-bottom: 1px solid #555;
        }
        
        .vscode-statusbar {
            background: #007acc;
            color: white;
            padding: 4px 15px;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .vscode-editor {
            padding: 15px;
            min-height: 200px;
        }
        
        .vscode-problems {
            background: #252526;
            border-top: 1px solid #555;
            padding: 10px 15px;
            max-height: 120px;
            overflow-y: auto;
        }
        
        .problem-item {
            padding: 3px 0;
            font-size: 12px;
            border-left: 3px solid transparent;
            padding-left: 8px;
            margin: 2px 0;
        }
        
        .problem-error {
            border-left-color: #f44336;
            color: #f44336;
        }
        
        .problem-warning {
            border-left-color: #ff9800;
            color: #ff9800;
        }
        
        .dashboard-mockup {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .dashboard-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .dashboard-content {
            padding: 20px;
        }
        
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
            padding: 15px;
            margin: 10px;
            text-align: center;
            min-width: 120px;
            display: inline-block;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: #7f8c8d;
            margin-top: 5px;
        }
        
        .chart-placeholder {
            background: #ecf0f1;
            border: 2px dashed #bdc3c7;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7f8c8d;
            margin: 15px 0;
            border-radius: 6px;
        }
        
        .button {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        
        .button:hover {
            background: #2980b9;
        }
        
        .button.success {
            background: #2ecc71;
        }
        
        .button.danger {
            background: #e74c3c;
        }
        
        .code-snippet {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            margin: 10px 0;
        }
        
        .line-number {
            color: #7f8c8d;
            margin-right: 15px;
            user-select: none;
        }
        
        .highlight-error {
            background: rgba(244, 67, 54, 0.1);
            border-left: 3px solid #f44336;
            padding-left: 8px;
        }
        
        .highlight-warning {
            background: rgba(255, 152, 0, 0.1);
            border-left: 3px solid #ff9800;
            padding-left: 8px;
        }
        
        .ai-indicator {
            background: #9b59b6;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .confidence-bar {
            background: #ecf0f1;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin: 5px 0;
        }
        
        .confidence-fill {
            background: #3498db;
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .confidence-fill.high {
            background: #e74c3c;
        }
        
        .confidence-fill.medium {
            background: #f39c12;
        }
        
        .confidence-fill.low {
            background: #27ae60;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .flow-diagram {
            display: flex;
            align-items: center;
            gap: 20px;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
        }
        
        .flow-step {
            background: #3498db;
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            text-align: center;
            min-width: 120px;
        }
        
        .flow-arrow {
            color: #7f8c8d;
            font-size: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 Ripple UI Wireframes & Mockups</h1>
        
        <h2>1. CLI Terminal Interface</h2>
        
        <h3>1.1 Basic Validation Output</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> ripple validate

<span class="success">✓</span> Ripple AI Code Validator v1.0.0

Analyzing 3 files...
<span class="warning">⚠️  AI-generated changes detected (87% confidence)</span>

Issues found:
<span class="error">❌ Function signature changed without updating callers</span>
   File: src/utils/helpers.ts:23
   Function: processData(data: string) → processData(data: string, options: Options)
   Affected files: 
   - src/components/DataTable.tsx:45
   - src/pages/Dashboard.tsx:12

<span class="warning">⚠️  Import statement may be incorrect</span>
   File: src/components/Button.tsx:1
   Import: import { theme } from '../styles/theme'
   Issue: '../styles/theme' exports 'defaultTheme', not 'theme'

Summary: 1 error, 1 warning
Confidence: 87% this analysis is accurate
Recommendation: Review AI-generated changes before committing

<span class="prompt">$</span> 
            </div>
        </div>

        <h3>1.2 Successful Validation</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> ripple validate

<span class="success">✓</span> Ripple AI Code Validator v1.0.0

Analyzing 2 files...
<span class="success">✓ No issues detected</span>

AI Detection: Low confidence (23%) - likely human-written code
Files analyzed: src/components/Header.tsx, src/styles/main.css
Analysis time: 0.8s

<span class="success">✓ Safe to commit</span>

<span class="prompt">$</span> 
            </div>
        </div>

        <h3>1.3 Git Hook Prevention</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> git commit -m "Update user authentication logic"

Running Ripple pre-commit validation...
<span class="error">❌ Validation failed - commit blocked</span>

Issues found:
<span class="error">❌ Function signature change detected</span>
   File: src/auth/login.ts:15
   Function: validateUser(email, password) → validateUser(credentials)
   Affected files: 2 locations need updating

Run <span style="color: #4a9eff;">ripple validate --fix</span> for suggested repairs
Or use <span style="color: #4a9eff;">git commit --no-verify</span> to bypass (not recommended)

<span class="prompt">$</span> 
            </div>
        </div>

        <h2>2. VS Code Extension Interface</h2>

        <h3>2.1 Main Editor with AI Detection</h3>
        <div class="wireframe">
            <div class="vscode-mockup">
                <div class="vscode-titlebar">
                    helpers.ts - myproject - Visual Studio Code
                </div>
                <div class="vscode-editor">
<span class="line-number">20</span>export interface ProcessOptions {
<span class="line-number">21</span>  format: 'json' | 'csv';
<span class="line-number">22</span>}
<span class="line-number">23</span>
<span class="line-number">24</span><span class="highlight-error">export function processData(data: string, options: ProcessOptions) {</span>
<span class="line-number">25</span>  // Implementation here
<span class="line-number">26</span>}
<span class="line-number">27</span>
<span class="line-number">28</span>export function helper() {
<span class="line-number">29</span>  return "test";
<span class="line-number">30</span>}
                </div>
                <div class="vscode-problems">
                    <div class="problem-item problem-error">
                        ❌ helpers.ts:24 - Function signature changed without updating callers (Ripple)
                    </div>
                    <div class="problem-item problem-warning">
                        ⚠️ Button.tsx:1 - Import statement may be incorrect (Ripple)
                    </div>
                </div>
                <div class="vscode-statusbar">
                    <div>
                        <span class="ai-indicator">AI CODE 87%</span>
                        Ripple: 1 error, 1 warning
                    </div>
                    <div>
                        <button class="button success">AI Safety Check</button>
                    </div>
                </div>
            </div>
        </div>

        <h3>2.2 Command Palette Integration</h3>
        <div class="wireframe">
            <div class="vscode-mockup">
                <div class="vscode-titlebar">
                    Command Palette
                </div>
                <div class="vscode-editor" style="background: #2d2d30; padding: 10px;">
                    <div style="background: #3c3c3c; padding: 10px; border-radius: 4px;">
                        <div style="color: #cccccc; margin-bottom: 10px;">
                            > <input type="text" value="ripple" style="background: transparent; border: none; color: white; width: 200px;">
                        </div>
                        <div style="color: #4a9eff; margin: 5px 0;">▶ Ripple: AI Safety Check</div>
                        <div style="color: #cccccc; margin: 5px 0;">▶ Ripple: Validate Staged Changes</div>
                        <div style="color: #cccccc; margin: 5px 0;">▶ Ripple: Configure Settings</div>
                        <div style="color: #cccccc; margin: 5px 0;">▶ Ripple: View Dashboard</div>
                    </div>
                </div>
            </div>
        </div>

        <h3>2.3 Results Panel</h3>
        <div class="wireframe">
            <div class="vscode-mockup">
                <div class="vscode-titlebar">
                    Ripple Results
                </div>
                <div class="vscode-editor" style="background: #252526;">
                    <div style="padding: 15px;">
                        <div style="color: #ff9800; margin-bottom: 15px;">
                            ⚠️ AI-Generated Changes Detected (87% confidence)
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="color: #f44336; font-weight: bold;">❌ Function Signature Change</div>
                            <div style="color: #cccccc; margin: 5px 0 10px 20px;">
                                File: helpers.ts:24<br>
                                Function: processData(data: string) → processData(data: string, options: ProcessOptions)<br>
                                Impact: 2 call sites need updating
                            </div>
                            <button class="button" style="margin-left: 20px;">Show Affected Files</button>
                            <button class="button success" style="margin-left: 10px;">Suggest Fix</button>
                        </div>
                        
                        <div>
                            <div style="color: #ff9800; font-weight: bold;">⚠️ Import Mismatch</div>
                            <div style="color: #cccccc; margin: 5px 0 10px 20px;">
                                File: Button.tsx:1<br>
                                Issue: Importing 'theme' but export is 'defaultTheme'
                            </div>
                            <button class="button success" style="margin-left: 20px;">Auto-fix Import</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h2>3. Web Dashboard</h2>

        <h3>3.1 Team Overview Dashboard</h3>
        <div class="wireframe">
            <div class="dashboard-mockup">
                <div class="dashboard-header">
                    <h2 style="margin: 0; color: #2c3e50;">Engineering Team Dashboard</h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0;">AI Code Safety Analytics - Last 30 Days</p>
                </div>
                <div class="dashboard-content">
                    <div style="margin-bottom: 30px;">
                        <div class="metric-card">
                            <div class="metric-value">234</div>
                            <div class="metric-label">Total Validations</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">67</div>
                            <div class="metric-label">AI Detections</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">12</div>
                            <div class="metric-label">Issues Caught</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">95%</div>
                            <div class="metric-label">Accuracy Rate</div>
                        </div>
                    </div>
                    
                    <div class="grid">
                        <div>
                            <h3>AI Detection Trends</h3>
                            <div class="chart-placeholder">
                                📊 Line Chart: AI Detection Over Time
                            </div>
                        </div>
                        <div>
                            <h3>Most Common Issues</h3>
                            <div style="padding: 15px; background: #f8f9fa; border-radius: 6px;">
                                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                    <strong>Function Signature Changes</strong><br>
                                    <span style="color: #7f8c8d;">45% of all issues</span>
                                </div>
                                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                    <strong>Import/Export Mismatches</strong><br>
                                    <span style="color: #7f8c8d;">32% of all issues</span>
                                </div>
                                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                    <strong>Type Mismatches</strong><br>
                                    <span style="color: #7f8c8d;">23% of all issues</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <h3>Team Member Activity</h3>
                        <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; padding: 10px 0; border-bottom: 1px solid #e1e5e9; font-weight: bold;">
                                <div>Developer</div>
                                <div>Validations</div>
                                <div>AI Detected</div>
                                <div>Issues Found</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; padding: 10px 0; border-bottom: 1px solid #e1e5e9;">
                                <div>alex@company.com</div>
                                <div>45</div>
                                <div>12</div>
                                <div>3</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; padding: 10px 0; border-bottom: 1px solid #e1e5e9;">
                                <div>sarah@company.com</div>
                                <div>38</div>
                                <div>9</div>
                                <div>2</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; padding: 10px 0;">
                                <div>mike@company.com</div>
                                <div>52</div>
                                <div>15</div>
                                <div>4</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h3>3.2 Individual Developer Dashboard</h3>
        <div class="wireframe">
            <div class="dashboard-mockup">
                <div class="dashboard-header">
                    <h2 style="margin: 0; color: #2c3e50;">My AI Code Safety Report</h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0;">alex@company.com - Personal Analytics</p>
                </div>
                <div class="dashboard-content">
                    <div style="margin-bottom: 30px;">
                        <div class="metric-card">
                            <div class="metric-value">45</div>
                            <div class="metric-label">Validations This Month</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">12</div>
                            <div class="metric-label">AI Code Detected</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">3</div>
                            <div class="metric-label">Issues Prevented</div>
                        </div>
                        <div class="metric-card" style="background: #d5f4e6;">
                            <div class="metric-value" style="color: #27ae60;">0</div>
                            <div class="metric-label">Bugs Shipped</div>
                        </div>
                    </div>
                    
                    <div class="grid">
                        <div>
                            <h3>Recent Validations</h3>
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                                <div style="margin: 10px 0; padding: 15px; background: white; border-radius: 4px; border-left: 4px solid #27ae60;">
                                    <div style="font-weight: bold;">✓ User authentication refactor</div>
                                    <div style="color: #7f8c8d; font-size: 0.9rem;">2 hours ago • No issues found</div>
                                </div>
                                <div style="margin: 10px 0; padding: 15px; background: white; border-radius: 4px; border-left: 4px solid #f39c12;">
                                    <div style="font-weight: bold;">⚠️ API endpoint updates</div>
                                    <div style="color: #7f8c8d; font-size: 0.9rem;">1 day ago • 1 warning (fixed)</div>
                                </div>
                                <div style="margin: 10px 0; padding: 15px; background: white; border-radius: 4px; border-left: 4px solid #e74c3c;">
                                    <div style="font-weight: bold;">❌ Database schema changes</div>
                                    <div style="color: #7f8c8d; font-size: 0.9rem;">3 days ago • 2 errors (prevented commit)</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3>AI Detection Insights</h3>
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                                <div style="margin-bottom: 15px;">
                                    <strong>AI Usage Pattern</strong>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill medium" style="width: 27%;"></div>
                                    </div>
                                    <span style="font-size: 0.9rem; color: #7f8c8d;">27% of your code changes are AI-generated</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <strong>Accuracy Trend</strong>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill low" style="width: 92%;"></div>
                                    </div>
                                    <span style="font-size: 0.9rem; color: #7f8c8d;">92% of flagged issues were actual problems</span>
                                </div>
                                <div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-top: 15px;">
                                    <strong style="color: #27ae60;">💡 Insight</strong><br>
                                    <span style="font-size: 0.9rem;">You're using AI tools effectively! Your validation habit is preventing bugs.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h3>3.3 Team Configuration Panel</h3>
        <div class="wireframe">
            <div class="dashboard-mockup">
                <div class="dashboard-header">
                    <h2 style="margin: 0; color: #2c3e50;">Team Configuration</h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0;">Customize validation rules for your team</p>
                </div>
                <div class="dashboard-content">
                    <div class="grid">
                        <div>
                            <h3>Validation Rules</h3>
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                                <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <strong>Function Signature Changes</strong><br>
                                            <span style="color: #7f8c8d; font-size: 0.9rem;">Detect when function parameters change</span>
                                        </div>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" checked style="margin-right: 8px;">
                                            <span style="color: #e74c3c;">Error</span>
                                        </label>
                                    </div>
                                </div>
                                <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <strong>Import/Export Mismatches</strong><br>
                                            <span style="color: #7f8c8d; font-size: 0.9rem;">Check for module import errors</span>
                                        </div>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" checked style="margin-right: 8px;">
                                            <span style="color: #e74c3c;">Error</span>
                                        </label>
                                    </div>
                                </div>
                                <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <strong>Type Mismatches</strong><br>
                                            <span style="color: #7f8c8d; font-size: 0.9rem;">TypeScript type inconsistencies</span>
                                        </div>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" checked style="margin-right: 8px;">
                                            <span style="color: #f39c12;">Warning</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3>AI Detection Settings</h3>
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Detection Sensitivity</label>
                                    <select style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <option>Low (Less false positives)</option>
                                        <option selected>Medium (Balanced)</option>
                                        <option>High (Catch more AI code)</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">File Count Threshold</label>
                                    <input type="number" value="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    <span style="color: #7f8c8d; font-size: 0.9rem;">Flag as AI-generated when this many files change together</span>
                                </div>
                            </div>
                            
                            <h3 style="margin-top: 30px;">Team Members</h3>
                            <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>alex@company.com</strong><br>
                                        <span style="color: #7f8c8d; font-size: 0.9rem;">Admin</span>
                                    </div>
                                    <button class="button danger" style="font-size: 12px;">Remove</button>
                                </div>
                                <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>sarah@company.com</strong><br>
                                        <span style="color: #7f8c8d; font-size: 0.9rem;">Member</span>
                                    </div>
                                    <button class="button danger" style="font-size: 12px;">Remove</button>
                                </div>
                                <button class="button" style="width: 100%; margin-top: 10px;">+ Add Team Member</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="button" style="margin-right: 10px;">Reset to Defaults</button>
                        <button class="button success">Save Configuration</button>
                    </div>
                </div>
            </div>
        </div>

        <h2>4. Mobile/Responsive Views</h2>

        <h3>4.1 Mobile Dashboard</h3>
        <div class="wireframe" style="max-width: 375px; margin: 0 auto;">
            <div class="dashboard-mockup">
                <div class="dashboard-header" style="text-align: center;">
                    <h3 style="margin: 0; color: #2c3e50;">Ripple Dashboard</h3>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 0.9rem;">Engineering Team</p>
                </div>
                <div class="dashboard-content">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <div class="metric-card" style="margin: 0;">
                            <div class="metric-value" style="font-size: 1.5rem;">234</div>
                            <div class="metric-label" style="font-size: 0.8rem;">Validations</div>
                        </div>
                        <div class="metric-card" style="margin: 0;">
                            <div class="metric-value" style="font-size: 1.5rem;">67</div>
                            <div class="metric-label" style="font-size: 0.8rem;">AI Detected</div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0;">Recent Activity</h4>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">
                            • 3 validations today<br>
                            • 1 AI code detected<br>
                            • 0 issues found
                        </div>
                    </div>
                    
                    <button class="button" style="width: 100%;">View Full Dashboard</button>
                </div>
            </div>
        </div>

        <h2>5. User Flow Diagrams</h2>

        <h3>5.1 First-Time User Flow</h3>
        <div class="wireframe">
            <div class="flow-diagram">
                <div class="flow-step">Install CLI</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">Run First Validation</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">See AI Detection</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">Purchase License</div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4>Step Details:</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                    <strong>1. Install CLI:</strong> <code>npm install -g ripple-validator</code><br>
                    <strong>2. First Validation:</strong> User runs <code>ripple validate</code> on current project<br>
                    <strong>3. AI Detection:</strong> Tool shows "AI code detected" with confidence score<br>
                    <strong>4. Purchase:</strong> User upgrades to paid plan for unlimited validations
                </div>
            </div>
        </div>

        <h3>5.2 Daily Developer Workflow</h3>
        <div class="wireframe">
            <div class="flow-diagram">
                <div class="flow-step">Write Code</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">Stage Changes</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">Auto Validation</div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">Commit/Fix</div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4>Integration Points:</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                    <strong>VS Code:</strong> Real-time status bar updates, problem panel integration<br>
                    <strong>Git Hooks:</strong> Pre-commit validation prevents broken commits<br>
                    <strong>CLI:</strong> Manual validation for specific files or changes<br>
                    <strong>Dashboard:</strong> Weekly review of team patterns and improvements
                </div>
            </div>
        </div>

        <h2>6. Key UI/UX Principles</h2>

        <div class="wireframe">
            <h3>Design Guidelines for Development Team</h3>
            
            <div class="grid">
                <div>
                    <h4>🎯 Clarity First</h4>
                    <p>Every error message must be immediately actionable. Users should never wonder "what do I do next?"</p>
                    
                    <div class="code-snippet">
                        <div style="color: #e74c3c;">❌ Bad: "Import error detected"</div>
                        <div style="color: #27ae60;">✅ Good: "Import 'theme' not found. Did you mean 'defaultTheme'?"</div>
                    </div>
                </div>
                
                <div>
                    <h4>⚡ Speed Matters</h4>
                    <p>Analysis must feel instant. Any delay over 2 seconds requires a progress indicator.</p>
                    
                    <div class="code-snippet">
                        <div>Target Performance:</div>
                        <div>• 1-5 files: < 1 second</div>
                        <div>• 6-20 files: < 2 seconds</div>
                        <div>• 21+ files: Progress bar</div>
                    </div>
                </div>
                
                <div>
                    <h4>🤖 AI-First Messaging</h4>
                    <p>Frame messages around AI usage, not general code quality. This is our differentiator.</p>
                    
                    <div class="code-snippet">
                        <div style="color: #e74c3c;">❌ Generic: "Function signature changed"</div>
                        <div style="color: #27ae60;">✅ AI-focused: "AI changed function signature - 2 callers need updates"</div>
                    </div>
                </div>
                
                <div>
                    <h4>🎨 Progressive Disclosure</h4>
                    <p>Show summary first, details on demand. Don't overwhelm with information.</p>
                    
                    <div class="code-snippet">
                        <div>1. Show: "1 error, 2 warnings"</div>
                        <div>2. Click to expand: Detailed file/line info</div>
                        <div>3. Click again: Suggested fixes</div>
                    </div>
                </div>
            </div>
        </div>

        <h2>7. Error States & Edge Cases</h2>

        <h3>7.1 Network Error (CLI)</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> ripple validate

<span class="success">✓</span> Ripple AI Code Validator v1.0.0

Analyzing 3 files...
<span class="warning">⚠️  License validation failed (network error)</span>
Running in offline mode with cached license...

<span class="success">✓ Analysis complete (offline mode)</span>
<span class="warning">⚠️  Usage tracking disabled until reconnected</span>

Issues found: 0 errors, 1 warning
Note: Some features require internet connection

<span class="prompt">$</span>
            </div>
        </div>

        <h3>7.2 Large File Warning</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> ripple validate

<span class="success">✓</span> Ripple AI Code Validator v1.0.0

<span class="warning">⚠️  Large codebase detected (127 files)</span>
This may take a few moments...

[████████████░░░░] 75% - Analyzing dependencies...

<span class="success">✓ Analysis complete</span> (4.2s)

Summary: 0 errors, 3 warnings
Tip: Use <span style="color: #4a9eff;">ripple validate src/</span> to analyze specific directories

<span class="prompt">$</span>
            </div>
        </div>

        <h3>7.3 Plan Limit Reached</h3>
        <div class="wireframe">
            <div class="terminal">
<span class="prompt">$</span> ripple validate

<span class="error">❌ Monthly validation limit reached (10/10)</span>

Your current plan allows 10 validations per month.
Upgrade to Individual Pro for unlimited validations.

Visit: https://ripple.dev/upgrade?key=rpl_1234567890
Or run: <span style="color: #4a9eff;">ripple upgrade</span>

<span class="prompt">$</span>
            </div>
        </div>

        <p style="text-align: center; margin: 40px 0; color: #7f8c8d; font-style: italic;">
            These wireframes provide a complete visual guide for implementing Ripple's user interface across all platforms and user scenarios.
        </p>
    </div>
</body>
</html>
