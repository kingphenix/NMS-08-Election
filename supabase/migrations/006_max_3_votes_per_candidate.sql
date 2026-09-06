-- ============================================================
-- NMS 08 Election — Update max votes per candidate to 3
-- ============================================================

ALTER TABLE ballots DROP CONSTRAINT IF EXISTS ballots_votes_given_check;
ALTER TABLE ballots ADD CONSTRAINT ballots_votes_given_check CHECK (votes_given >= 1 AND votes_given <= 3);
