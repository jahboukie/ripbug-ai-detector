// ===== IMPORT/EXPORT MISMATCH SCENARIOS =====

// Scenario 1: Import Non-existent Named Export
import { validateUser } from "./auth"; // ❌ Should be authenticateUser

// Scenario 2: Import Wrong Default Export
import UserService from "./user-service"; // ❌ No default export available

// Scenario 3: Import Renamed Export
import { processOrder } from "./order-utils"; // ❌ Should be handleOrder

// Scenario 4: Import from Wrong Module
import { calculateTax } from "./user-utils"; // ❌ calculateTax is in tax-utils

// Scenario 5: Destructuring Wrong Properties
import { createInvoice, sendInvoice } from "./billing"; // ❌ sendInvoice doesn't exist

// Scenario 6: Mixed Import Issues
import defaultExport, { namedExport } from "./mixed-exports"; // ❌ Multiple issues

// Usage of imported functions (these would also trigger stale reference errors)
function setupApp() {
  const isValid = validateUser("user123");
  const service = new UserService();
  const order = processOrder({ id: 1 });
  const tax = calculateTax(100);
  const invoice = createInvoice({ amount: 100 });
  sendInvoice(invoice);
  
  return { isValid, service, order, tax, invoice };
}
