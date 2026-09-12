-- ============================================================
-- NMS 08 Election — Voter Credentials Bulk Insert
-- Generated: 2026-09-12T10:03:33.419Z
-- Count: 10
-- ============================================================
-- PASTE THIS INTO SUPABASE SQL EDITOR AND RUN ONCE.
-- DELETE THIS FILE AFTERWARDS.
-- ============================================================

INSERT INTO voter_credentials (token_hash, token_last_four, status, has_voted, issued_at)
VALUES
  (crypt('ZCNWKAVXG5PNNVQT', gen_salt('bf', 10)), 'NVQT', 'unused', false, now()),
  (crypt('3XDRFE45Z24XSBJC', gen_salt('bf', 10)), 'SBJC', 'unused', false, now()),
  (crypt('FW3ZY4AN6P5AVVKZ', gen_salt('bf', 10)), 'VVKZ', 'unused', false, now()),
  (crypt('CXEGKFT7V869QYYR', gen_salt('bf', 10)), 'QYYR', 'unused', false, now()),
  (crypt('RFD4TFK2BT3SHWSG', gen_salt('bf', 10)), 'HWSG', 'unused', false, now()),
  (crypt('4STTSEDK5HEHW57C', gen_salt('bf', 10)), 'W57C', 'unused', false, now()),
  (crypt('PJM8V74XP7B29RN7', gen_salt('bf', 10)), '9RN7', 'unused', false, now()),
  (crypt('25CX94K32WEN4AXY', gen_salt('bf', 10)), '4AXY', 'unused', false, now()),
  (crypt('HRFBCQA49CST5B7X', gen_salt('bf', 10)), '5B7X', 'unused', false, now()),
  (crypt('QC5B8P3Z4XGDKQ7B', gen_salt('bf', 10)), 'KQ7B', 'unused', false, now())
;

-- Log the generation event
INSERT INTO audit_log (action, details)
VALUES ('token_generated', '{"count": 10, "method": "local_script"}'::jsonb);

SELECT COUNT(*) AS credentials_inserted FROM voter_credentials;
