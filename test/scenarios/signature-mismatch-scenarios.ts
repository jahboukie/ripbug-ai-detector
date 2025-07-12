// ===== SIGNATURE MISMATCH SCENARIOS =====

// Scenario 1: Added Required Parameter
export function createUser(name: string, email: string, role: string) {
  return { name, email, role };
}

function setupUser() {
  return createUser("John", "john@test.com"); // ❌ Missing role parameter
}

// Scenario 2: Removed Parameter
export function logMessage(message: string) {
  console.log(message);
}

function debugApp() {
  logMessage("Error occurred", "ERROR"); // ❌ Extra parameter
}

// Scenario 3: Changed Parameter Order
export function calculateDiscount(price: number, percentage: number, maxDiscount: number) {
  const discount = Math.min(price * (percentage / 100), maxDiscount);
  return price - discount;
}

function applyDiscount() {
  return calculateDiscount(0.15, 100); // ❌ Wrong order and missing parameter
}

// Scenario 4: Optional Parameter Made Required
export function sendEmail(to: string, subject: string, body: string) {
  return `Sending to ${to}: ${subject}`;
}

function notifyUser() {
  return sendEmail("user@test.com"); // ❌ Missing required parameters
}

// Scenario 5: Added Optional Parameter (Should NOT trigger error)
export function formatDate(date: Date, format?: string) {
  return format ? date.toLocaleDateString(format) : date.toLocaleDateString();
}

function displayDate() {
  return formatDate(new Date()); // ✅ Should be valid (optional parameter)
}

// Scenario 6: Complex Function with Multiple Issues
export function processPayment(
  amount: number, 
  currency: string, 
  paymentMethod: string, 
  metadata?: any
) {
  return { amount, currency, paymentMethod, metadata };
}

function handlePayment() {
  // Multiple signature issues
  return processPayment(100); // ❌ Missing currency and paymentMethod
}

function anotherPayment() {
  return processPayment(50, "USD", "card", { extra: true }, "invalid"); // ❌ Too many parameters
}

// Scenario 7: Async Function Signature Change
export async function fetchData(endpoint: string, options: RequestInit) {
  return fetch(endpoint, options);
}

async function getData() {
  return await fetchData("/api/users"); // ❌ Missing options parameter
}
