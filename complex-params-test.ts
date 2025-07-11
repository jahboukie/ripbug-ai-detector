// Complex TypeScript function parameters test
// This will test our enhanced AST parameter parsing

// Function with complex TypeScript parameters
export function processComplexData(
  userId: string,
  options?: {
    includeProfile: boolean;
    format: 'json' | 'xml';
    timeout?: number;
  },
  callback: (error: Error | null, data: any) => void = () => {},
  ...extraArgs: string[]
): Promise<UserData> {
  // Implementation here
  return Promise.resolve({} as UserData);
}

// Arrow function with destructured parameters
export const handleUserRequest = async (
  { userId, sessionId }: { userId: string; sessionId: string },
  config: RequestConfig = { retries: 3, timeout: 5000 }
) => {
  // Implementation here
  return processComplexData(userId, { includeProfile: true, format: 'json' }, undefined);
};

// Function with generic types
export function createRepository<T extends BaseEntity>(
  entityClass: new () => T,
  options: RepositoryOptions<T> = {}
): Repository<T> {
  // Implementation here
  return {} as Repository<T>;
}

// Interface definitions
interface UserData {
  id: string;
  profile?: UserProfile;
}

interface RequestConfig {
  retries: number;
  timeout: number;
}

interface BaseEntity {
  id: string;
}

interface RepositoryOptions<T> {
  cache?: boolean;
  validator?: (entity: T) => boolean;
}

interface Repository<T> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
}
