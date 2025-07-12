// tax-utils.ts - Contains calculateTax (imported from wrong module in main.ts)

export function calculateTax(amount: number) {
  return amount * 0.08;
}

export function calculateVAT(amount: number) {
  return amount * 0.2;
}

export function getTaxRate(region: string) {
  return region === "EU" ? 0.2 : 0.08;
}
