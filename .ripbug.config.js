module.exports = {
  "analysis": {
    "languages": [
      "javascript",
      "typescript"
    ],
    "include": [
      "src/**/*.{js,ts,jsx,tsx}",
      "**/*.{js,ts,jsx,tsx}"
    ],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "**/*.test.{js,ts}",
      "**/*.spec.{js,ts}",
      "**/*.d.ts"
    ],
    "maxFiles": 100
  },
  "rules": {
    "functionSignatureChange": {
      "enabled": true,
      "severity": "error"
    },
    "importExportMismatch": {
      "enabled": true,
      "severity": "error"
    },
    "typeMismatch": {
      "enabled": true,
      "severity": "warning"
    }
  },
  "aiDetection": {
    "enabled": true,
    "sensitivity": "medium",
    "patterns": [
      "multiple-file-changes",
      "function-signature-changes",
      "import-export-changes",
      "type-definition-changes"
    ]
  },
  "output": {
    "format": "console",
    "verbose": false,
    "showConfidence": true
  },
  "usage": {
    "trackingEnabled": true,
    "apiUrl": "https://api.ripple.dev"
  }
};