// src/lib/session.ts
// Session storage persisted to sessionStorage so refreshing the page
// does not lock out an authenticated voter or admin.

const SESSION_KEY = 'nms_credential_id'

interface Session {
  credentialId: string
}

export function setSession(credentialId: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, credentialId)
  } catch (e) {
    console.error('Failed to set session:', e)
  }
}

export function getSession(): Session | null {
  try {
    const credentialId = sessionStorage.getItem(SESSION_KEY)
    if (credentialId) {
      return { credentialId }
    }
  } catch (e) {
    console.error('Failed to get session:', e)
  }
  return null
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.error('Failed to clear session:', e)
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}
