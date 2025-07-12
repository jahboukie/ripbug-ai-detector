// order-utils.ts - Function renamed but import not updated

export function handleOrder(orderData: any) {
  return { ...orderData, processed: true };
}

export function validateOrder(order: any) {
  return order.id && order.amount;
}

// Note: processOrder is NOT exported (imported in main.ts)
