-- ============================================================
-- NMS 08 Election — Reset Election Results SQL Script
-- ============================================================
-- Run this in Supabase SQL Editor to wipe all cast ballots
-- and reset all voter tokens back to unused state.
-- ============================================================

-- 1. Delete all submitted ballots
TRUNCATE TABLE ballots;

-- 2. Reset all voter credentials to unused state
UPDATE voter_credentials
SET
  has_voted = false,
  status = 'unused',
  used_at = NULL;

-- 3. Log the reset event in the audit trail
INSERT INTO audit_log (action, details)
VALUES (
  'election_reset',
  jsonb_build_object(
    'reset_at', now(),
    'reason', 'Administrator reset election results to initial state'
  )
);

-- 4. Verify that election results are now empty
SELECT
  (SELECT COUNT(*) FROM ballots) AS total_ballots,
  (SELECT COUNT(*) FROM voter_credentials WHERE has_voted = true) AS voters_who_voted,
  (SELECT COUNT(*) FROM voter_credentials WHERE status = 'unused') AS unused_tokens_count;
