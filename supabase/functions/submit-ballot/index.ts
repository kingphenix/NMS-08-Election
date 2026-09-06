// supabase/functions/submit-ballot/index.ts
// POST /functions/v1/submit-ballot
// Atomically validates and records a ballot, prevents double-voting.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-credential-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOTAL_VOTES_REQUIRED = 6;
const MAX_CANDIDATES = 3;
const MAX_VOTES_PER_CANDIDATE = 3;

interface BallotEntry {
  candidate_id: string;
  votes_given: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── Extract credential_id from header (set by frontend after login) ──
  const credentialId = req.headers.get("x-credential-id");
  if (!credentialId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { ballot?: BallotEntry[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const ballot = body.ballot ?? [];

  // ── Server-side ballot validation ────────────────────────────
  const validationError = validateBallot(ballot);
  if (validationError) {
    return new Response(
      JSON.stringify({ error: validationError, code: "INVALID_BALLOT" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Verify credential and prevent double-voting atomically ───
  // Use a Postgres function for true atomic check-and-update
  const { data, error } = await supabase.rpc("submit_ballot_atomic", {
    p_credential_id: credentialId,
    p_ballot: ballot,
    p_ip: ip,
  });

  if (error) {
    console.error("RPC error:", error);
    if (error.message?.includes("already_voted")) {
      return new Response(
        JSON.stringify({ error: "Your vote has already been recorded.", code: "ALREADY_VOTED" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (error.message?.includes("credential_not_found")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
} catch (err: any) {
  console.error("Global error:", err);
  return new Response(
    JSON.stringify({ error: "Internal server error", details: err.message }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
});

function validateBallot(ballot: BallotEntry[]): string | null {
  if (!Array.isArray(ballot) || ballot.length < 2) {
    return "You must select at least 2 candidates.";
  }
  if (ballot.length > MAX_CANDIDATES) {
    return `You may select at most ${MAX_CANDIDATES} candidates.`;
  }

  const candidateIds = ballot.map((b) => b.candidate_id);
  const uniqueIds = new Set(candidateIds);
  if (uniqueIds.size !== candidateIds.length) {
    return "Duplicate candidates in ballot.";
  }

  for (const entry of ballot) {
    if (!Number.isInteger(entry.votes_given) || entry.votes_given < 1 || entry.votes_given > MAX_VOTES_PER_CANDIDATE) {
      return `votes_given must be an integer between 1 and ${MAX_VOTES_PER_CANDIDATE}.`;
    }
    if (!entry.candidate_id || typeof entry.candidate_id !== "string") {
      return "Invalid candidate_id.";
    }
  }

  const totalVotes = ballot.reduce((sum, b) => sum + b.votes_given, 0);
  if (totalVotes !== TOTAL_VOTES_REQUIRED) {
    return `Total votes must equal exactly ${TOTAL_VOTES_REQUIRED}. You allocated ${totalVotes}.`;
  }

  return null;
}
