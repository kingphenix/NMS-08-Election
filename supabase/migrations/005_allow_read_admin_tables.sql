-- ============================================================
-- NMS 08 Election — Migration 005
-- Allow SELECT access on ballots, voter_credentials, and audit_log
-- so the Admin dashboard can display live vote counts, turnout, and audit entries.
-- ============================================================

DROP POLICY IF EXISTS "ballots_select_policy" ON ballots;
CREATE POLICY "ballots_select_policy"
  ON ballots FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "voter_credentials_select_policy" ON voter_credentials;
CREATE POLICY "voter_credentials_select_policy"
  ON voter_credentials FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "audit_log_select_policy" ON audit_log;
CREATE POLICY "audit_log_select_policy"
  ON audit_log FOR SELECT
  TO anon, authenticated
  USING (true);
