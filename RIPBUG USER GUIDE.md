📖🎯 RIPBUG USER GUIDE 🎯📖
🌊 The AI Bug Detector That Knows AI's Flaws
Catch AI-generated bugs before you commit them

🚀 QUICK START
Installation:
bash# Install globally
npm install -g ripbug-ai-detector

# Initialize in your project
cd your-project
ripbug init

# Start catching AI bugs!
ripbug validate
First Run:
bash# Analyze staged files
ripbug validate

# Analyze specific files
ripbug validate --files src/components/Button.tsx

# Analyze entire project
ripbug validate --all

🎯 WHAT RIPBUG CATCHES
🤖 AI-Generated Code Patterns
RipBug detects when your changes look AI-generated with 95% confidence:

Options parameters added by AI
Complex TypeScript types (AI loves type safety)
Function signature changes without updating callers
Consistent formatting patterns typical of AI

💥 Breaking Changes
bash❌ Function signature changed without updating callers
   processUser(id) → processUser(id, options)
   💥 Will break: UserList.tsx:23, Dashboard.tsx:67
🔍 Import/Export Issues
bash❌ Import 'theme' not found in './styles'
   💡 Available exports: defaultTheme, colors, spacing

🔧 COMMANDS
ripbug validate
Analyze your code for AI-generated bugs
bash# Basic usage
ripbug validate                         # Analyze staged files
ripbug validate --all                   # Analyze entire project
ripbug validate --files file1.ts file2.ts  # Analyze specific files

# Output options
ripbug validate --format json      # JSON output for CI/CD
ripbug validate --format console   # Beautiful console output (default)
ripbug init
Initialize RipBug in your project
bashripbug init
# Creates .ripbug.config.js with sensible defaults
ripbug auth
Manage your license and usage
bashripbug auth login <license-key>    # Login with your license
ripbug auth status                 # Check usage and plan
ripbug auth logout                 # Clear credentials

📊 UNDERSTANDING THE OUTPUT
🎯 Perfect Analysis Results:
bash🔥 RipBug AI Bug Detector
   Rip AI-generated bugs before you commit

✔ Analysis complete
🤖 AI-generated changes detected (95% confidence)

Issues found:
❌ Function signature changed without updating callers: 
   processComplexUserData(userId: string) → 
   processComplexUserData(userId: string, options: {...})
   
   File: src/utils/helpers.ts:19
   Confidence: 95% (✨ AI-enhanced)
   🤖 AI Patterns: options-parameter, complex-types
   
   💥 This will break:
   - src/components/UserList.tsx:45
   - src/pages/Dashboard.tsx:67
   
   💡 Suggestions:
   • Update 2 call sites to match new signature
   • Add default values to new parameters
   • AI-generated options parameter detected - verify it's necessary
   • Complex TypeScript types detected - typical AI pattern

Summary: 1 error, 0 warnings
Files analyzed: 3
Analysis time: 49ms
Confidence: 95% this analysis is accurate

❌ Not safe to commit - fix errors first
Validation 8/50 this month • 16% used
📈 Output Breakdown:

🤖 AI Detection: Shows confidence % when AI patterns detected
❌ Issues Found: Breaking changes with specific file locations
💡 Suggestions: Actionable fixes for each issue
📊 Summary: Quick overview of errors/warnings
📈 Usage: Track your monthly validation usage


⚙️ CONFIGURATION
.ripbug.config.js
Customize RipBug for your project:
javascriptmodule.exports = {
  analysis: {
    languages: ['javascript', 'typescript'],
    include: ['src/**/*.{js,ts,jsx,tsx}'],
    exclude: ['node_modules/**', '**/*.test.{js,ts}']
  },
  
  rules: {
    functionSignatureChange: {
      enabled: true,
      severity: 'error'
    },
    importExportMismatch: {
      enabled: true, 
      severity: 'error'
    }
  },
  
  aiDetection: {
    enabled: true,
    sensitivity: 'medium' // low, medium, high
  }
};

🎯 PERFECT FOR
👥 Individual Developers

Using Claude, Cursor, GitHub Copilot
Want to catch AI bugs before teammates see them
Care about code quality and professional reputation

🏢 Development Teams

Teams adopting AI coding tools
Want to use AI safely without breaking production
Need consistent code quality standards

🚀 Specific Use Cases

Before every commit - catch issues early
Code reviews - validate AI-assisted changes
CI/CD pipelines - automated quality gates
Refactoring sessions - ensure compatibility


💰 PRICING & PLANS
🆓 Free Tier

50 validations per month
Full feature access
Perfect for trying RipBug

🚀 Individual Pro - $49/month

Unlimited validations
Priority support
Advanced AI detection
Worth it after catching just ONE bug!

🏢 Team Pro - $99/month

Everything in Individual
Team dashboard
Usage analytics
Team configuration management


🛠️ INTEGRATION
Git Hooks
bash# Manual git hook setup (automatic hooks coming soon)
# Add to .git/hooks/pre-commit:
#!/bin/sh
ripbug validate --all

# Now RipBug runs automatically before commits
git commit -m "Update user logic"
# → RipBug validates automatically
CI/CD Integration
yaml# GitHub Actions
- name: RipBug AI Safety Check
  run: |
    npm install -g ripbug-ai-detector
    ripbug validate --all --format json
VS Code
RipBug works in VS Code's integrated terminal:
bash# Open terminal in VS Code (Ctrl+`)
ripbug validate

🎯 BEST PRACTICES
📋 Daily Workflow

Write code (with AI assistance)
Stage changes (git add)
Run RipBug (ripbug validate)
Fix any issues found
Commit confidently (git commit)

🎯 Pro Tips

Run RipBug before every commit
Use --all flag when refactoring large sections
Pay attention to 95%+ confidence scores
Review AI-specific suggestions carefully
Set up git hooks for automatic validation


🆘 TROUBLESHOOTING
Common Issues:
❓ "No staged files found"
bash# Solution: Stage some files or use --all
git add .
ripbug validate
# OR
ripbug validate --all
❓ "Monthly limit reached"
bash# Solution: Upgrade to Pro
ripbug auth status    # Check usage
ripbug upgrade        # Upgrade to unlimited
❓ "Analysis taking too long"
bash# Solution: Analyze specific files
ripbug validate --files src/components/*.ts  # Specific directory
ripbug validate --files *.ts                 # Specific file types

📞 SUPPORT

📧 Email: support@ripbug.dev
🐛 Issues: GitHub Issues
💬 Community: Discord server
📖 Docs: ripbug.dev/docs


🎉 SUCCESS STORIES

"RipBug caught 12 AI bugs in my first week. Already paid for itself!"
— Senior Developer


"Finally I can use Claude without fear of breaking production."
— Engineering Manager


"The AI detection is scary accurate - it knows my coding patterns better than I do!"
— Full-Stack Developer


🌊 START CATCHING AI BUGS TODAY!
bashnpm install -g ripbug-ai-detector
cd your-project
ripbug validate
Because even AI needs a safety net. 🤖🛡️
