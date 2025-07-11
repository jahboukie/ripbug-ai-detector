import { processComplexUserData } from './tree-sitter-stress-test';

// Breaking calls from different file
export function externalUserProcess() {
  return processComplexUserData('user123'); // This should be valid since options has default value
}

// Let's add a REAL breaking change for testing
export function realBreakingCall() {
  return processComplexUserData(); // Missing required userId parameter - this IS a breaking change
}
