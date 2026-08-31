// src/lib/session.ts
// In-memory session storage. Nothing is persisted to localStorage
// to avoid token leakage across tabs/devices.

interface Session {
  credentialId: string
}

let _session: Session | null = null

export function setSession(credentialId: string): void {
  _session = { credentialId }
}

export function getSession(): Session | null {
  return _session
}

export function clearSession(): void {
  _session = null
}

export function isAuthenticated(): boolean {
  return _session !== null
}
