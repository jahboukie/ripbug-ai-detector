// ===== STALE REFERENCE SCENARIOS =====

// Scenario 1: Function Renamed but Call Site Missed
export function processUserData(userData: any) {
  return userData.name.toUpperCase();
}

// AI renamed function but missed this call
function handleUser() {
  return getUserData({ name: "John" }); // ❌ Should be processUserData
}

// Scenario 2: Method Renamed in Class
export class DataProcessor {
  formatOutput(data: string) {
    return data.trim();
  }
}

function useProcessor() {
  const processor = new DataProcessor();
  return processor.processData("test"); // ❌ Should be formatOutput
}

// Scenario 3: Async Function Renamed
export async function fetchUserProfile(id: string) {
  return { id, name: "User" };
}

async function loadUser() {
  const profile = await getUserProfile("123"); // ❌ Should be fetchUserProfile
  return profile;
}

// Scenario 4: Utility Function Moved/Renamed
export function calculateTax(amount: number) {
  return amount * 0.1;
}

function processOrder(orderAmount: number) {
  const tax = computeTax(orderAmount); // ❌ Should be calculateTax
  return orderAmount + tax;
}

// Scenario 5: Arrow Function Renamed
export const validateEmail = (email: string) => {
  return email.includes("@");
};

function registerUser(email: string) {
  if (checkEmail(email)) { // ❌ Should be validateEmail
    return "Valid";
  }
  return "Invalid";
}
