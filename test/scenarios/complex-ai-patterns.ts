// ===== COMPLEX AI-GENERATED PATTERNS =====

// Scenario 1: AI Refactored Class but Missed Method Calls
export class DatabaseManager {
  // AI renamed from 'connect' to 'initialize'
  async initialize() {
    return "Connected to database";
  }
  
  // AI renamed from 'query' to 'execute'
  async execute(sql: string) {
    return `Executing: ${sql}`;
  }
}

async function setupDatabase() {
  const db = new DatabaseManager();
  await db.connect(); // ❌ Should be initialize
  const result = await db.query("SELECT * FROM users"); // ❌ Should be execute
  return result;
}

// Scenario 2: AI Changed Interface but Missed Implementation
interface PaymentProcessor {
  processPayment(amount: number, currency: string, method: string): Promise<any>;
}

class StripeProcessor implements PaymentProcessor {
  // AI changed interface but didn't update implementation
  async processPayment(amount: number) { // ❌ Missing currency and method parameters
    return { success: true, amount };
  }
}

// Scenario 3: AI Added Validation but Broke Existing Calls
export function createProduct(name: string, price: number, category: string, description: string) {
  if (!name || !category || !description) {
    throw new Error("Missing required fields");
  }
  return { name, price, category, description };
}

function addProduct() {
  // AI added required parameters but didn't update all call sites
  return createProduct("Widget", 29.99); // ❌ Missing category and description
}

// Scenario 4: AI Moved Function to Different Module
// This function was moved to utils/math.ts but calls weren't updated
function calculateCompoundInterest(principal: number, rate: number, time: number) {
  return principal * Math.pow(1 + rate, time);
}

function investmentCalculator() {
  return calculateCompoundInterest(1000, 0.05, 10); // ❌ Function moved to different module
}

// Scenario 5: AI Changed Async/Sync Pattern
export function loadUserData(userId: string) {
  // AI changed from async to sync but didn't update call sites
  return { id: userId, name: "User" };
}

async function getUserInfo() {
  const userData = await loadUserData("123"); // ❌ Function is no longer async
  return userData;
}

// Scenario 6: AI Changed Return Type Structure
export function getApiResponse() {
  // AI changed from { data: any } to { result: any }
  return { result: "success" };
}

function handleApiCall() {
  const response = getApiResponse();
  return response.data; // ❌ Should be response.result
}
