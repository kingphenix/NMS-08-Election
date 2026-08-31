// src/lib/api.ts
// Typed wrappers around all Edge Function calls.

import { supabaseUrl, supabaseAnonKey } from './supabase'

export interface BallotEntry {
  candidate_id: string
  votes_given: number
}

export interface LoginResult {
  credential_id: string
  has_voted: boolean
}

async function callEdge<T>(
  fn: string,
  body: object,
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
      ...extraHeaders,
    },
    mode: 'cors',
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.error ?? 'Unknown error')
    ;(err as unknown as Record<string, string>).code = data.code ?? 'UNKNOWN'
    throw err
  }

  return data as T
}

/** Authenticate with a voter token. Returns credential_id if successful. */
export async function loginWithToken(token: string): Promise<LoginResult> {
  return callEdge<LoginResult>('login', { token })
}

/** Submit a ballot atomically. Credential ID must be passed in header. */
export async function submitBallot(
  credentialId: string,
  ballot: BallotEntry[]
): Promise<void> {
  await callEdge<{ success: boolean }>('submit-ballot', { ballot }, {
    'x-credential-id': credentialId,
  })
}


/** (Admin) Reset a credential. Returns new plaintext token once. */
export async function adminResetToken(
  adminPassword: string,
  credentialId: string,
  reason: string,
  adminUsername = 'admin'
): Promise<string> {
  const res = await callEdge<{ new_token: string }>('admin-reset-token', {
    credential_id: credentialId,
    reason,
    admin_username: adminUsername,
  }, {
    'x-admin-password': adminPassword,
  })
  return res.new_token
}
