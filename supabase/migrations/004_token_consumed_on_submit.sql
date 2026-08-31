-- ============================================================
-- NMS 08 Election — Migration 004
-- Mark voter_credentials.status = 'used' at ballot submit time,
-- not at login time. Keeps tokens valid until votes are cast.
-- ============================================================

CREATE OR REPLACE FUNCTION submit_ballot_atomic(
  p_credential_id UUID,
  p_ballot        JSONB,
  p_ip            TEXT DEFAULT 'unknown'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_voted BOOLEAN;
  v_entry     JSONB;
BEGIN
  -- Lock the credential row for the duration of this transaction
  SELECT has_voted
  INTO v_has_voted
  FROM voter_credentials
  WHERE id = p_credential_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'credential_not_found';
  END IF;

  IF v_has_voted THEN
    RAISE EXCEPTION 'already_voted';
  END IF;

  -- Insert one ballot row per candidate entry
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_ballot)
  LOOP
    INSERT INTO ballots (credential_id, candidate_id, votes_given)
    VALUES (
      p_credential_id,
      (v_entry->>'candidate_id')::UUID,
      (v_entry->>'votes_given')::INTEGER
    );
  END LOOP;

  -- Mark credential as voted AND consume the token status atomically
  UPDATE voter_credentials
  SET has_voted = true,
      status    = 'used',
      used_at   = now()
  WHERE id = p_credential_id;

  -- Write audit log entry
  INSERT INTO audit_log (action, credential_id, details)
  VALUES (
    'ballot_submitted',
    p_credential_id,
    jsonb_build_object(
      'ip', p_ip,
      'candidates_voted_for', jsonb_array_length(p_ballot)
    )
  );
END;
$$;
