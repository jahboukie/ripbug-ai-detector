// user-service.ts - No default export (imported as default in main.ts)

export class UserService {
  getUser(id: string) {
    return { id, name: "User" };
  }
}

export function createUserService() {
  return new UserService();
}

// Note: No default export available
