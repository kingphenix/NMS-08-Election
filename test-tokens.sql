-- ============================================================
-- NMS 08 Election — Voter Credentials Bulk Insert
-- Generated: 2026-08-30T13:47:14.604Z
-- Count: 5
-- ============================================================
-- PASTE THIS INTO SUPABASE SQL EDITOR AND RUN ONCE.
-- DELETE THIS FILE AFTERWARDS.
-- ============================================================

INSERT INTO voter_credentials (token_hash, token_last_four, status, has_voted, issued_at)
VALUES
  (crypt('CRRX2KGMPTQ5HE5', gen_salt('bf', 10)), '-HE5', 'unused', false, now()),
  (crypt('QF65YC8VYHPJM9K', gen_salt('bf', 10)), '-M9K', 'unused', false, now()),
  (crypt('GCSRV9RW5P6K26W', gen_salt('bf', 10)), '-26W', 'unused', false, now()),
  (crypt('XYZSC5N7WXKVAXN', gen_salt('bf', 10)), '-AXN', 'unused', false, now()),
  (crypt('VZSSVFQ5GVAQ892', gen_salt('bf', 10)), '-892', 'unused', false, now())
;

-- Log the generation event
INSERT INTO audit_log (action, details)
VALUES ('token_generated', '{"count": 5, "method": "local_script"}'::jsonb);

SELECT COUNT(*) AS credentials_inserted FROM voter_credentials;
