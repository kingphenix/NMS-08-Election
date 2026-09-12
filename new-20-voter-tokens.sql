-- ============================================================
-- NMS 08 Election — Voter Credentials Bulk Insert
-- Generated: 2026-09-12T13:08:35.222Z
-- Count: 20
-- ============================================================
-- PASTE THIS INTO SUPABASE SQL EDITOR AND RUN ONCE.
-- DELETE THIS FILE AFTERWARDS.
-- ============================================================

INSERT INTO voter_credentials (token_hash, token_last_four, status, has_voted, issued_at)
VALUES
  (crypt('HDPBNVMJR8QZSQMD', gen_salt('bf', 10)), 'SQMD', 'unused', false, now()),
  (crypt('2245CS9WBAM9HRTF', gen_salt('bf', 10)), 'HRTF', 'unused', false, now()),
  (crypt('QPT783ZXSF4WDVRN', gen_salt('bf', 10)), 'DVRN', 'unused', false, now()),
  (crypt('KCZDCE7SHR7FNBXZ', gen_salt('bf', 10)), 'NBXZ', 'unused', false, now()),
  (crypt('WVAHAHPQA6WQ29BV', gen_salt('bf', 10)), '29BV', 'unused', false, now()),
  (crypt('QZDDPQW4NTSQS2TM', gen_salt('bf', 10)), 'S2TM', 'unused', false, now()),
  (crypt('7FFRY9DQWP7A7NWP', gen_salt('bf', 10)), '7NWP', 'unused', false, now()),
  (crypt('V7AQ8527DWR9J7YK', gen_salt('bf', 10)), 'J7YK', 'unused', false, now()),
  (crypt('75QWMMYVEMF8RBXK', gen_salt('bf', 10)), 'RBXK', 'unused', false, now()),
  (crypt('5A53MWE89NBZ8K8P', gen_salt('bf', 10)), '8K8P', 'unused', false, now()),
  (crypt('ZVVF68JHGNV2VDGK', gen_salt('bf', 10)), 'VDGK', 'unused', false, now()),
  (crypt('9Q4E5AXFCJ6K36J3', gen_salt('bf', 10)), '36J3', 'unused', false, now()),
  (crypt('MZTBEWD3RMA9X24D', gen_salt('bf', 10)), 'X24D', 'unused', false, now()),
  (crypt('XJR8NPQN8E4MBFCE', gen_salt('bf', 10)), 'BFCE', 'unused', false, now()),
  (crypt('KTX44X88JMBBCEXH', gen_salt('bf', 10)), 'CEXH', 'unused', false, now()),
  (crypt('SPC9Z3Z4W998PBNK', gen_salt('bf', 10)), 'PBNK', 'unused', false, now()),
  (crypt('W7ZKZD8P2KQ2FPNB', gen_salt('bf', 10)), 'FPNB', 'unused', false, now()),
  (crypt('2CJ4BDNZG58YRBNP', gen_salt('bf', 10)), 'RBNP', 'unused', false, now()),
  (crypt('7BZ9H9FT8ZY59Z7R', gen_salt('bf', 10)), '9Z7R', 'unused', false, now()),
  (crypt('K97RACWPMETJ7CYQ', gen_salt('bf', 10)), '7CYQ', 'unused', false, now())
;

-- Log the generation event
INSERT INTO audit_log (action, details)
VALUES ('token_generated', '{"count": 20, "method": "local_script"}'::jsonb);

SELECT COUNT(*) AS credentials_inserted FROM voter_credentials;
