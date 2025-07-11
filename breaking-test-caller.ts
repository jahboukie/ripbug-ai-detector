import { processUserData } from './breaking-test-function';

// This call is TRULY breaking - missing required config parameter
export function callBrokenFunction() {
  return processUserData('user123'); // Missing requiredConfig!
}
