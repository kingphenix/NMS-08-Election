// supabase/functions/admin-reset-token/index.ts
// POST /functions/v1/admin-reset-token
// Expires an old credential and issues a new one. Protected by admin password.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE32_CHARS = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let raw = "";
  for (const b of bytes) {
    raw += BASE32_CHARS[b % BASE32_CHARS.length];
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminPassword = req.headers.get("x-admin-password");
    const expectedPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || adminPassword !== expectedPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: { credential_id?: string; reason?: string; admin_username?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.credential_id) {
      return new Response(
        JSON.stringify({ error: "credential_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

  // Expire old credential
  const { error: expireError } = await supabase
    .from("voter_credentials")
    .update({ status: "expired" })
    .eq("id", body.credential_id);

  if (expireError) {
    return new Response(
      JSON.stringify({ error: "Failed to expire old credential" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Generate new token
  const newToken = generateToken();
  const tokenClean = newToken.replace(/-/g, "");
  const newHash = await bcrypt.hash(tokenClean, 10);

  const { data: newCred, error: insertError } = await supabase
    .from("voter_credentials")
    .insert({
      token_hash: newHash,
      token_last_four: newToken.slice(-4),
      status: "unused",
    })
    .select("id")
    .single();

  if (insertError || !newCred) {
    return new Response(
      JSON.stringify({ error: "Failed to create new credential" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Audit log
  await supabase.from("audit_log").insert({
    action: "token_reset",
    credential_id: body.credential_id,
    details: {
      new_credential_id: newCred.id,
      admin_username: body.admin_username ?? "admin",
      reason: body.reason ?? "not specified",
    },
  });

  return new Response(
      JSON.stringify({
        success: true,
        new_token: newToken,
        new_credential_id: newCred.id,
        warning: "Save this token now. It will NOT be shown again.",
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
