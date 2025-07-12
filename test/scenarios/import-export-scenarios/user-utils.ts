// user-utils.ts - Does NOT contain calculateTax (imported from here in main.ts)

export function formatUserName(name: string) {
  return name.trim().toLowerCase();
}

export function validateUserEmail(email: string) {
  return email.includes("@");
}

export function getUserDisplayName(user: any) {
  return user.firstName + " " + user.lastName;
}

// Note: calculateTax is NOT here (it's in tax-utils.ts)
