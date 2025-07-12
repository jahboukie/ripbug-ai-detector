// billing.ts - Missing some exports that are imported

export function createInvoice(data: any) {
  return { ...data, id: Math.random(), created: new Date() };
}

export function calculateInvoiceTotal(items: any[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function formatInvoice(invoice: any) {
  return `Invoice #${invoice.id}: $${invoice.amount}`;
}

// Note: sendInvoice is NOT exported (imported in main.ts)
