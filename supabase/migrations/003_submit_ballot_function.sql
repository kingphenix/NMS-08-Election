-- ============================================================
-- NMS 08 Election — Atomic Ballot Submission Function
-- This Postgres function is called by the submit-ballot Edge Function.
-- It uses a serializable transaction to prevent double-voting race conditions.
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

  -- Mark credential as voted
  UPDATE voter_credentials
  SET has_voted = true
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
