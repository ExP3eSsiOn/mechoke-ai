// lib/push-history.ts
// Simple in-memory push history storage (ephemeral)
// For production: use database like Vercel Postgres, MongoDB, etc.

type PushHistoryEntry = {
  timestamp: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  message: string;
  templateKey?: string | null;
};

// In-memory store (resets on deploy/restart)
const historyStore: PushHistoryEntry[] = [];
const MAX_HISTORY = 100; // Keep last 100 entries

/**
 * Save push history entry
 */
export async function savePushHistory(entry: PushHistoryEntry): Promise<void> {
  historyStore.unshift(entry); // Add to beginning

  // Keep only last MAX_HISTORY entries
  if (historyStore.length > MAX_HISTORY) {
    historyStore.splice(MAX_HISTORY);
  }
}

/**
 * Get push history (latest first)
 */
export function getPushHistory(limit = 50): PushHistoryEntry[] {
  return historyStore.slice(0, limit);
}

/**
 * Clear all history (for testing)
 */
export function clearPushHistory(): void {
  historyStore.length = 0;
}
