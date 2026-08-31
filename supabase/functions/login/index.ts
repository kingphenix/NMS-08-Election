// supabase/functions/login/index.ts
// POST /functions/v1/login
// Authenticates a voter by their mail-delivered token.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

serve(async (req: Request) => {
  // Handle CORS preflight
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

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const rawToken = (body.token ?? "").replace(/\s/g, "").toUpperCase();

  if (!rawToken) {
    return new Response(
      JSON.stringify({ error: "Token is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Rate limiting ───────────────────────────────────────────
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count: recentFailures } = await supabase
    .from("audit_log")
    .select("*", { count: "exact", head: true })
    .eq("action", "login_failure")
    .gte("created_at", windowStart)
    .contains("details", { ip });

  if ((recentFailures ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return new Response(
      JSON.stringify({
        error: "Too many failed attempts. Please wait 15 minutes and try again.",
        code: "RATE_LIMITED",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Look up all unused credentials and compare hashes ───────
  // We can't do a WHERE on the hash directly since bcrypt is not deterministic.
  // For 150 rows this is fast enough. We only compare against unused tokens.
  const { data: credentials, error: fetchError } = await supabase
    .from("voter_credentials")
    .select("id, token_hash, status, has_voted")
    .eq("status", "unused");

  if (fetchError) {
    console.error("DB fetch error:", fetchError);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Find matching credential
  let matchedCredential: { id: string; token_hash: string; status: string; has_voted: boolean } | null = null;

  for (const cred of credentials ?? []) {
    const isMatch = await bcrypt.compare(rawToken, cred.token_hash);
    if (isMatch) {
      matchedCredential = cred;
      break;
    }
  }

  // ── Token not found ──────────────────────────────────────────
  if (!matchedCredential) {
    await supabase.from("audit_log").insert({
      action: "login_failure",
      details: { ip, reason: "token_not_found" },
    });
    return new Response(
      JSON.stringify({ error: "Invalid credential. Please check your token and try again.", code: "INVALID_TOKEN" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Token already used ───────────────────────────────────────
  if (matchedCredential.status === "used") {
    await supabase.from("audit_log").insert({
      action: "login_failure",
      credential_id: matchedCredential.id,
      details: { ip, reason: "token_already_used" },
    });
    return new Response(
      JSON.stringify({ error: "This credential has already been used.", code: "ALREADY_USED" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Successful login — do NOT mark token used yet; that happens on ballot submit ──
  await supabase.from("audit_log").insert({
    action: "login_success",
    credential_id: matchedCredential.id,
    details: { ip },
  });

  return new Response(
      JSON.stringify({
        success: true,
        credential_id: matchedCredential.id,
        has_voted: matchedCredential.has_voted,
      }),
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
