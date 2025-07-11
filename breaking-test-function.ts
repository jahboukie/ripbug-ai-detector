// Function with TRULY breaking signature change
export function processUserData(
  userId: string,
  requiredConfig: { apiKey: string; endpoint: string }, // NO DEFAULT VALUE!
  options?: { timeout?: number }
): Promise<any> {
  return Promise.resolve({});
}
