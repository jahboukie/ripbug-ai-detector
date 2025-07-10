// Another file that uses the broken functions from test-code.js
// This demonstrates cross-file breaking changes

import { processUserData, handleUserRequest } from './test-code.js';

// This will break because processUserData now requires options parameter
export function createUserReport(userId) {
  // 💥 Missing the new options parameter!
  const userData = processUserData(userId);
  
  return {
    report: `User Report for ${userData.id}`,
    generated: new Date(),
    data: userData
  };
}

// Another breaking call
export function getUserSummary(id) {
  // 💥 This will also break!
  const result = processUserData(id);
  
  return `Summary: ${result.id}`;
}

// Classic AI pattern: Multiple files changed together
export function batchProcessUsers(userIds) {
  return userIds.map(id => {
    // 💥 Every call in this map will break!
    return processUserData(id);
  });
}
