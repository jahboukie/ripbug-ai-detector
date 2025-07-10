// 🤖 Claude's AI-Generated Code - Full of Classic AI Mistakes!
// This code demonstrates the exact bugs that Ripple is designed to catch

// Classic AI Mistake #1: Function signature changes without updating callers
export function processUserData(userId, options = {}) {
  // I just "improved" this function by adding an options parameter
  // But I didn't check where it's called from!
  
  const { includeProfile = false, format = 'json', timeout = 5000 } = options;
  
  return {
    id: userId,
    profile: includeProfile ? getUserProfile(userId) : null,
    format: format,
    timestamp: Date.now(),
    timeout: timeout
  };
}

// Classic AI Mistake #2: Import assumptions
import { theme } from './styles/theme.js';  // Wrong! It exports 'defaultTheme'
import { validateUser } from './utils/validation';  // Wrong path!
import { DatabaseManager } from './db/manager';  // Doesn't exist!

// Classic AI Mistake #3: Function calls with old signatures
export function handleUserRequest(userId) {
  // This call is missing the new 'options' parameter I just added above!
  const userData = processUserData(userId);  // 💥 WILL BREAK!
  
  return {
    success: true,
    data: userData
  };
}

// Classic AI Mistake #4: More function calls that will break
export function displayUserProfile(id) {
  // Another call missing the options parameter
  const user = processUserData(id);  // 💥 WILL BREAK!
  
  console.log(`User: ${user.id}`);
  return user;
}

// Classic AI Mistake #5: Assuming exports that don't exist
export function applyTheme() {
  // Using 'theme' but the file exports 'defaultTheme'
  return {
    colors: theme.colors,  // 💥 WILL BREAK!
    fonts: theme.fonts     // 💥 WILL BREAK!
  };
}

// Classic AI Mistake #6: Creating cascading changes
export interface UserOptions {  // Wait, this is JS not TS!
  includeProfile: boolean;
  format: 'json' | 'xml';
  timeout: number;
}

// Classic AI Mistake #7: Inconsistent patterns
function getUserProfile(userId) {
  // I'm mixing function declarations and arrow functions
  // Classic AI inconsistency!
  return { name: 'User', id: userId };
}

const validateInput = (input) => {
  // Arrow function style - inconsistent with above
  return input && input.length > 0;
};

// Classic AI Mistake #8: Over-engineering with options objects
export function simpleFunction(data, options = {}) {
  // I added options to a function that doesn't need them!
  const { 
    enableLogging = false,
    retryCount = 3,
    timeout = 1000,
    validateInput = true,
    formatOutput = true 
  } = options;
  
  // Way too complex for what should be simple
  return data;
}

// Classic AI Mistake #9: Assuming API that doesn't exist
export async function fetchUserData(id) {
  // I'm assuming these functions exist
  const db = new DatabaseManager();  // 💥 DOESN'T EXIST!
  const isValid = validateUser(id);   // 💥 WRONG IMPORT!
  
  if (!isValid) {
    throw new Error('Invalid user');
  }
  
  return await db.getUser(id);  // 💥 WILL BREAK!
}
