// 🌳 TREE-SITTER ULTIMATE STRESS TEST FILE
// This file contains COMPLEX patterns that regex parsing struggles with
// Perfect for testing tree-sitter AST accuracy improvements

import { 
  UserData, 
  ProcessOptions as ProcOpts, 
  ValidationResult 
} from './types/user';

// Re-export from barrel file (complex import/export patterns)
export { 
  DatabaseManager, 
  type ConnectionConfig,
  QueryBuilder as QB 
} from './database';

// 🎯 TEST 1: Complex Nested Function Signatures (tree-sitter advantage)
export function processComplexUserData(
  userId: string,
  options: {
    profile?: {
      includeAvatar?: boolean;
      includePreferences?: boolean;
      format?: 'full' | 'minimal';
    };
    cache?: {
      enabled?: boolean;
      ttl?: number;
      strategy?: 'memory' | 'redis';
    };
    validation?: {
      strict?: boolean;
      rules?: string[];
    };
  } = {}
): Promise<UserData & { metadata: any }> {
  const {
    profile = { includeAvatar: false, format: 'minimal' },
    cache = { enabled: true, ttl: 3600 },
    validation = { strict: false }
  } = options;
  
  return Promise.resolve({} as any);
}

// 🎯 TEST 2: Generic Functions (TypeScript complexity)
export function mapUserData<T extends UserData, K extends keyof T>(
  users: T[],
  mapper: (user: T, index: number) => Pick<T, K>,
  filter?: (user: T) => user is T & { verified: true }
): Array<Pick<T, K>> {
  return users.map(mapper);
}

// 🎯 TEST 3: Destructuring in Parameters (complex AST parsing)
export function handleUserRequest({
  user: { id, profile: { name, avatar } = {} } = {},
  request: { type, payload, headers = {} } = {},
  context: { timestamp, requestId, ...metadata } = {}
} = {}) {
  // Complex parameter destructuring that regex can't parse accurately
  return { userId: id, requestType: type, meta: metadata };
}

// 🎯 TEST 4: Function Calls That Will Break (cross-file detection)
export function createUserProfile(userId: string) {
  // 💥 BREAKING: Missing complex options parameter
  const userData = processComplexUserData(userId);
  
  // 💥 BREAKING: Wrong generic usage
  const mapped = mapUserData([], (user) => user);
  
  // 💥 BREAKING: Missing destructured parameters
  const result = handleUserRequest();
  
  return { userData, mapped, result };
}

// 🎯 TEST 5: Arrow Functions with Complex Types
const processWithCallback = <T, R>(
  data: T[],
  callback: (item: T, index: number) => R,
  options?: { parallel?: boolean; batchSize?: number }
) => {
  return data.map(callback);
};

// 🎯 TEST 6: Class Methods (tree-sitter excels at class parsing)
export class UserProcessor {
  private cache = new Map<string, UserData>();
  
  // Method with complex signature
  async processUser(
    userId: string,
    config: {
      caching?: boolean;
      validation?: {
        level: 'basic' | 'strict' | 'enterprise';
        customRules?: ((user: any) => boolean)[];
      };
    } = {}
  ): Promise<ProcessedUser> {
    // Implementation
    return {} as ProcessedUser;
  }
  
  // Static method
  static validateConfig(config: unknown): config is ProcessorConfig {
    return typeof config === 'object';
  }
  
  // Getter/setter
  get cacheSize(): number {
    return this.cache.size;
  }
}

// 🎯 TEST 7: Breaking Class Method Calls
export function useUserProcessor() {
  const processor = new UserProcessor();
  
  // 💥 BREAKING: Missing config parameter additions
  processor.processUser('user123');
  
  // 💥 BREAKING: Static method call that might break
  UserProcessor.validateConfig();
  
  return processor;
}

// 🎯 TEST 8: Complex Import/Export Patterns That Regex Misses
export default class DefaultUserService {
  process = processComplexUserData; // Function assignment
}

// 🎯 TEST 9: Conditional Exports (dynamic complexity)
export const conditionalExport = process.env.NODE_ENV === 'development' 
  ? processComplexUserData 
  : mapUserData;

// 🎯 TEST 10: Template Literals with Embedded Expressions
export function generateUserQuery(
  userId: string,
  filters: Record<string, any> = {}
) {
  // Complex template literal that regex struggles with
  const query = `
    SELECT u.*, 
           p.${filters.includeProfile ? 'name, avatar' : 'id'} as profile
    FROM users u 
    ${filters.joinProfile ? 'LEFT JOIN profiles p ON u.id = p.user_id' : ''}
    WHERE u.id = '${userId}' 
    ${Object.keys(filters).length > 0 ? `AND ${Object.entries(filters)
      .map(([key, value]) => `u.${key} = '${value}'`)
      .join(' AND ')}` : ''}
  `;
  return query;
}

// 🎯 TEST 11: Higher-Order Functions (complex call patterns)
export const createUserHandler = (baseHandler: Function) => 
  (options: any = {}) => 
    async (userId: string) => {
      // 💥 BREAKING: Nested function calls that are hard to track
      return baseHandler(processComplexUserData(userId));
    };

// 🎯 TEST 12: JSX-like Patterns (if this were a .tsx file)
// const UserComponent = ({ user, onUpdate }: UserProps) => {
//   const handleUpdate = () => onUpdate(processComplexUserData(user.id));
//   return <div onClick={handleUpdate}>{user.name}</div>;
// };

// 🎯 TEST 13: Async/Await Complex Patterns
export async function batchProcessUsers(
  userIds: string[],
  processor: (id: string, opts?: any) => Promise<any>
) {
  // 💥 BREAKING: Each call missing complex options
  const results = await Promise.all(
    userIds.map(async (id, index) => {
      try {
        // Missing the complex options parameter
        return await processComplexUserData(id);
      } catch (error) {
        console.error(`Failed to process user ${id}:`, error);
        return null;
      }
    })
  );
  
  return results.filter(Boolean);
}

// 🎯 TEST 14: Object Method Shorthand
export const userService = {
  // Method shorthand syntax
  process(userId: string, opts: any) {
    // 💥 BREAKING: Another missing complex options call
    return processComplexUserData(userId);
  },
  
  // Arrow function property
  validate: (user: any) => user?.id && user?.email,
  
  // Computed property names
  ['process' + 'Batch']: batchProcessUsers
};

// 🎯 TEST 15: Type Assertions and Casting
export function processTypedUser(userData: unknown) {
  const user = userData as UserData;
  const processed = processComplexUserData(user.id) as Promise<ProcessedUser>;
  return processed;
}

// 🎯 EXPECTED TREE-SITTER IMPROVEMENTS:
// 1. ✅ Accurately parse nested object types in function parameters
// 2. ✅ Correctly identify generic function signatures
// 3. ✅ Handle complex destructuring patterns
// 4. ✅ Track method calls across classes
// 5. ✅ Parse template literals with embedded expressions
// 6. ✅ Understand higher-order function patterns
// 7. ✅ Detect breaking changes in complex call sites
// 8. ✅ Handle conditional exports and dynamic patterns
// 9. ✅ Parse object method shorthand correctly
// 10. ✅ Understand type assertions and casting

// Types for completeness
interface UserData {
  id: string;
  email: string;
  profile?: any;
}

interface ProcessedUser extends UserData {
  processed: boolean;
  timestamp: number;
}

interface ProcessorConfig {
  caching: boolean;
  validation: any;
}
