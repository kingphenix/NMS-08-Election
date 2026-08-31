// scripts/generate-tokens.mjs
// Run with: node scripts/generate-tokens.mjs [count] [output.csv]
// Example:  node scripts/generate-tokens.mjs 150 tokens.csv
//
// Outputs a CSV of plaintext tokens + the SQL INSERT statements
// you can paste directly into Supabase SQL Editor to load credentials.
//
// SECURITY: Run this on a trusted machine. Delete the CSV after printing.
// Never share or store the plaintext tokens anywhere else.

import { randomBytes } from 'crypto'
import { createWriteStream } from 'fs'
import { createHash } from 'crypto'

// ── Config ────────────────────────────────────────────────────
// Base32 charset: no 0/O, 1/I/l to avoid transcription errors
const BASE32 = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'
const COUNT  = parseInt(process.argv[2] ?? '150', 10)
const OUTPUT = process.argv[3] ?? `tokens-${new Date().toISOString().slice(0, 10)}.csv`

// ── Token generation ──────────────────────────────────────────
function generateToken() {
  const bytes = randomBytes(16)
  let raw = ''
  for (const b of bytes) {
    raw += BASE32[b % BASE32.length]
  }
  // Format: XXXX-XXXX-XXXX-XXXX
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`
}

// ── Simple SHA-256 placeholder hash ──────────────────────────
// NOTE: The SQL INSERT below uses pgcrypto's crypt() for bcrypt.
// This script outputs the PLAINTEXT token + last-4 for the CSV.
// The SQL uses gen_salt('bf', 10) for bcrypt hashing inside Postgres.
// This avoids needing bcrypt as a Node.js dependency in this script.
function lastFour(token) {
  return token.slice(-4)
}

// ── Generate tokens ───────────────────────────────────────────
console.log(`Generating ${COUNT} tokens…`)
const tokens = []
const seen   = new Set()

while (tokens.length < COUNT) {
  const t = generateToken()
  if (!seen.has(t)) {
    seen.add(t)
    tokens.push(t)
  }
}

// ── Write CSV ─────────────────────────────────────────────────
const csv = createWriteStream(OUTPUT)
csv.write('token,last_four\n')
for (const t of tokens) {
  csv.write(`${t},${lastFour(t)}\n`)
}
csv.end()
console.log(`✓ CSV written to: ${OUTPUT}`)

// ── Write SQL ─────────────────────────────────────────────────
// This SQL uses Postgres pgcrypto to bcrypt-hash the tokens server-side.
// Paste into Supabase SQL Editor and run ONCE.
const sqlFile = OUTPUT.replace('.csv', '.sql')
const sqlLines = tokens.map(t => {
  const clean = t.replace(/-/g, '') // strip dashes for hashing
  const last4 = lastFour(t)
  // pgcrypto: crypt(plaintext, gen_salt('bf', 10)) → bcrypt hash
  return `  (crypt('${clean}', gen_salt('bf', 10)), '${last4}', 'unused', false, now())`
})

const sql = `-- ============================================================
-- NMS 08 Election — Voter Credentials Bulk Insert
-- Generated: ${new Date().toISOString()}
-- Count: ${COUNT}
-- ============================================================
-- PASTE THIS INTO SUPABASE SQL EDITOR AND RUN ONCE.
-- DELETE THIS FILE AFTERWARDS.
-- ============================================================

INSERT INTO voter_credentials (token_hash, token_last_four, status, has_voted, issued_at)
VALUES
${sqlLines.join(',\n')}
;

-- Log the generation event
INSERT INTO audit_log (action, details)
VALUES ('token_generated', '{"count": ${COUNT}, "method": "local_script"}'::jsonb);

SELECT COUNT(*) AS credentials_inserted FROM voter_credentials;
`

import { writeFileSync } from 'fs'
writeFileSync(sqlFile, sql)
console.log(`✓ SQL written to: ${sqlFile}`)
console.log(``)
console.log(`Next steps:`)
console.log(`  1. Open Supabase SQL Editor`)
console.log(`  2. Paste and run the contents of: ${sqlFile}`)
console.log(`  3. Verify the row count returned matches ${COUNT}`)
console.log(`  4. Print tokens from: ${OUTPUT}`)
console.log(`  5. DELETE BOTH FILES from this machine after printing`)
console.log(``)
console.log(`⚠️  Do NOT email, upload, or share these files.`)
