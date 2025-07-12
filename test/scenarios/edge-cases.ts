// ===== EDGE CASES AND TRICKY SCENARIOS =====

// Scenario 1: Similar Function Names (Should NOT trigger false positives)
export function getUserData(id: string) {
  return { id, name: "User" };
}

export function getUserDetails(id: string) {
  return { id, name: "User", email: "user@test.com" };
}

function testSimilarNames() {
  const data = getUserData("123"); // ✅ Should be valid
  const details = getUserDetails("123"); // ✅ Should be valid
  return { data, details };
}

// Scenario 2: Overloaded Functions (Complex signature matching)
export function formatValue(value: string): string;
export function formatValue(value: number): string;
export function formatValue(value: boolean): string;
export function formatValue(value: any): string {
  return String(value);
}

function testOverloads() {
  const str = formatValue("test"); // ✅ Should be valid
  const num = formatValue(123); // ✅ Should be valid
  const bool = formatValue(true); // ✅ Should be valid
  const invalid = formatValue("test", "extra"); // ❌ Too many parameters
  return { str, num, bool, invalid };
}

// Scenario 3: Generic Functions
export function processArray<T>(items: T[], processor: (item: T) => T): T[] {
  return items.map(processor);
}

function testGenerics() {
  const numbers = processArray([1, 2, 3]); // ❌ Missing processor function
  const strings = processArray(["a", "b"], (s) => s.toUpperCase()); // ✅ Should be valid
  return { numbers, strings };
}

// Scenario 4: Optional Parameters with Defaults
export function createConfig(name: string, debug = false, timeout = 5000) {
  return { name, debug, timeout };
}

function testDefaults() {
  const config1 = createConfig("app"); // ✅ Should be valid
  const config2 = createConfig("app", true); // ✅ Should be valid
  const config3 = createConfig("app", true, 10000); // ✅ Should be valid
  const config4 = createConfig(); // ❌ Missing required name parameter
  return { config1, config2, config3, config4 };
}

// Scenario 5: Rest Parameters
export function combineStrings(separator: string, ...strings: string[]): string {
  return strings.join(separator);
}

function testRestParams() {
  const result1 = combineStrings(",", "a", "b", "c"); // ✅ Should be valid
  const result2 = combineStrings(","); // ✅ Should be valid (no rest params)
  const result3 = combineStrings(); // ❌ Missing required separator
  return { result1, result2, result3 };
}

// Scenario 6: Destructured Parameters
export function processUser({ name, email, age }: { name: string; email: string; age: number }) {
  return { name: name.toUpperCase(), email, age };
}

function testDestructuring() {
  const user1 = processUser({ name: "John", email: "john@test.com", age: 30 }); // ✅ Should be valid
  const user2 = processUser({ name: "Jane", email: "jane@test.com" }); // ❌ Missing age
  const user3 = processUser("invalid"); // ❌ Wrong parameter type
  return { user1, user2, user3 };
}

// Scenario 7: Callback Functions
export function asyncOperation(callback: (error: Error | null, result?: any) => void) {
  setTimeout(() => callback(null, "success"), 100);
}

function testCallbacks() {
  asyncOperation((err, result) => console.log(result)); // ✅ Should be valid
  asyncOperation(() => console.log("done")); // ✅ Should be valid (fewer params OK for callbacks)
  asyncOperation(); // ❌ Missing required callback
}
