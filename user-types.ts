export interface UserData {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface ProcessOptions {
  // Original simple options
  includeProfile?: boolean;
}
