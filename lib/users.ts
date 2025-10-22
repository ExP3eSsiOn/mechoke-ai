// lib/users.ts
const memory = {
    users: new Set<string>(),
  };
  
  export function trackUserId(id: string) {
    if (!id) return Promise.resolve();
    memory.users.add(id);
    return Promise.resolve();
  }
  
  export function listUsers(): string[] {
    return Array.from(memory.users);
  }