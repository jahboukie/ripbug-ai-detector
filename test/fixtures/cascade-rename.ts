// initial version was:
// export const getUserProfile = (id: string) => fetch(`/api/user/${id}`);

// later - function was renamed
export const fetchUserData = (id: string) => fetch(`/api/user/${id}`);

// consumer still uses old name
getUserProfile("abc"); // ❌ stale reference
