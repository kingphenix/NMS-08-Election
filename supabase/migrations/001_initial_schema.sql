-- ============================================================
-- NMS 08 Election — Initial Schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- voter_credentials
-- ------------------------------------------------------------
CREATE TABLE voter_credentials (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash     TEXT        NOT NULL UNIQUE,
  status         TEXT        NOT NULL DEFAULT 'unused'
                             CHECK (status IN ('unused', 'used', 'expired')),
  has_voted      BOOLEAN     NOT NULL DEFAULT false,
  issued_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at        TIMESTAMPTZ,
  token_last_four TEXT       NOT NULL
);

COMMENT ON TABLE voter_credentials IS
  'One row per mail-delivered token. 150 pre-generated rows.';
COMMENT ON COLUMN voter_credentials.token_hash IS
  'Bcrypt hash of the plaintext token. NEVER store plaintext here.';
COMMENT ON COLUMN voter_credentials.token_last_four IS
  'Last 4 chars of plaintext token for admin lookup ONLY. Not sufficient for auth.';

-- ------------------------------------------------------------
-- candidates
-- ------------------------------------------------------------
CREATE TABLE candidates (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL
);

COMMENT ON TABLE candidates IS 'Exactly 7 rows seeded before the election.';

-- ------------------------------------------------------------
-- ballots
-- ------------------------------------------------------------
CREATE TABLE ballots (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID        NOT NULL REFERENCES voter_credentials(id),
  candidate_id  UUID        NOT NULL REFERENCES candidates(id),
  votes_given   INTEGER     NOT NULL CHECK (votes_given >= 1 AND votes_given <= 3),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent a credential from voting for the same candidate twice
  CONSTRAINT uq_credential_candidate UNIQUE (credential_id, candidate_id)
);

COMMENT ON TABLE ballots IS
  'One row per credential-candidate pair. SUM(votes_given) GROUP BY candidate_id to tally.';

-- ------------------------------------------------------------
-- audit_log
-- ------------------------------------------------------------
CREATE TABLE audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action        TEXT        NOT NULL,
  credential_id UUID        REFERENCES voter_credentials(id),
  details       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_log IS
  'Comprehensive audit trail. Never delete rows.';
COMMENT ON COLUMN audit_log.action IS
  'Values: token_generated, login_success, login_failure, ballot_submitted, token_reset, token_expired';

-- ------------------------------------------------------------
-- Indexes for common query patterns
-- ------------------------------------------------------------
CREATE INDEX idx_voter_credentials_status   ON voter_credentials(status);
CREATE INDEX idx_voter_credentials_has_voted ON voter_credentials(has_voted);
CREATE INDEX idx_ballots_candidate_id        ON ballots(candidate_id);
CREATE INDEX idx_ballots_credential_id       ON ballots(credential_id);
CREATE INDEX idx_audit_log_credential_id     ON audit_log(credential_id);
CREATE INDEX idx_audit_log_created_at        ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action            ON audit_log(action);
