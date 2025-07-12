export function calculateInvoiceTotal(subtotal: number, tax: number) {
  return subtotal + tax;
}

// elsewhere
const total = calculateInvoiceTotal(100); // missing tax arg
