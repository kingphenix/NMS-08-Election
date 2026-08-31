-- ============================================================
-- NMS 08 Election — Row Level Security
-- ============================================================
-- All sensitive tables are service-role-only.
-- Only 'candidates' is publicly readable (names shown on voting page).
-- All writes go through Edge Functions that use the service role key.
-- ============================================================

ALTER TABLE voter_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- candidates: public read-only (anon can read candidate names)
CREATE POLICY "candidates_read_public"
  ON candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- voter_credentials: no direct anon access — Edge Functions use service role
-- (No policies needed; default deny with RLS enabled)

-- ballots: no direct anon access
-- (No policies needed; default deny with RLS enabled)

-- audit_log: no direct anon access
-- (No policies needed; default deny with RLS enabled)
