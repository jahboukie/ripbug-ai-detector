// The actual theme file that exports different names than expected
// This will cause import/export mismatches

export const defaultTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745'
  },
  fonts: {
    primary: 'Arial, sans-serif',
    secondary: 'Georgia, serif'
  }
};

export const colors = {
  red: '#dc3545',
  green: '#28a745',
  blue: '#007bff'
};

export const spacing = {
  small: '8px',
  medium: '16px',
  large: '24px'
};

// Note: I export 'defaultTheme' but test-code.js imports 'theme'
// Classic AI assumption error!
