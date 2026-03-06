export type WordSession = {
  id: string;
  german: string;
  english: string;
  bulgarian: string;
  createdAtMs: number;
};

const SESSIONS = new Map<string, WordSession>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function createSession(input: Omit<WordSession, "createdAtMs">): WordSession {
  const session: WordSession = { ...input, createdAtMs: Date.now() };
  SESSIONS.set(session.id, session);
  cleanupExpired();
  return session;
}

export function getSession(id: string): WordSession | undefined {
  const s = SESSIONS.get(id);
  if (!s) return undefined;
  if (Date.now() - s.createdAtMs > TTL_MS) {
    SESSIONS.delete(id);
    return undefined;
  }
  return s;
}

export function cleanupExpired(): void {
  const now = Date.now();
  for (const [id, s] of SESSIONS.entries()) {
    if (now - s.createdAtMs > TTL_MS) SESSIONS.delete(id);
  }
}

