-- ============================================================
-- NMS 08 Election — Voter Credentials Insert (10 New Tokens)
-- ============================================================
-- PASTE THIS INTO SUPABASE SQL EDITOR AND RUN ONCE.
-- ============================================================

INSERT INTO voter_credentials (token_hash, token_last_four, status, has_voted, issued_at)
VALUES
  (crypt('K9MPW27VX4RNH3BQ', gen_salt('bf', 10)), 'H3BQ', 'unused', false, now()),
  (crypt('R8CYT5NEP7MWF2VK', gen_salt('bf', 10)), 'F2VK', 'unused', false, now()),
  (crypt('J4GAX9SZC3VDB8LH', gen_salt('bf', 10)), 'B8LH', 'unused', false, now()),
  (crypt('W6QTM8PFY2KJR5ZC', gen_salt('bf', 10)), 'R5ZC', 'unused', false, now()),
  (crypt('B3VHE7NWK4GXP9TY', gen_salt('bf', 10)), 'P9TY', 'unused', false, now()),
  (crypt('Z2MXR9PKS5FCW8HD', gen_salt('bf', 10)), 'W8HD', 'unused', false, now()),
  (crypt('F7KNY3VBC8QET2MA', gen_salt('bf', 10)), 'T2MA', 'unused', false, now()),
  (crypt('H4PZV8WRG2XJC5SY', gen_salt('bf', 10)), 'C5SY', 'unused', false, now()),
  (crypt('Y9TCB5MQK8RHW3FZ', gen_salt('bf', 10)), 'W3FZ', 'unused', false, now()),
  (crypt('X3EFP8NDV4KGS7MB', gen_salt('bf', 10)), 'S7MB', 'unused', false, now())
;

-- Log generation event in audit log
INSERT INTO audit_log (action, details)
VALUES ('token_generated', '{"count": 10, "method": "manual_script"}'::jsonb);

SELECT COUNT(*) AS total_credentials FROM voter_credentials;
