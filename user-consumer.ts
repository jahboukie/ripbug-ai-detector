import { processComplexUserData } from './tree-sitter-stress-test';

// Breaking calls from different file
export function externalUserProcess() {
  return processComplexUserData('user123'); // Missing options
}
