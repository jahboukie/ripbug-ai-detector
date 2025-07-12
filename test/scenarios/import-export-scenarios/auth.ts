// auth.ts - Exports don't match imports in main.ts

export function authenticateUser(userId: string) {
  return userId.length > 0;
}

export function checkPermissions(user: any) {
  return user.role === "admin";
}

// Note: validateUser is NOT exported (imported in main.ts)
