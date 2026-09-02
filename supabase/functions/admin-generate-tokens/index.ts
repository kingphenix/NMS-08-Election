// supabase/functions/admin-generate-tokens/index.ts
// POST /functions/v1/admin-generate-tokens
// Bulk-generates voter tokens. Protected by admin password.
// Returns plaintext tokens ONCE in the response — caller must save them.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Base32 charset: no 0/O or 1/I/l to avoid misreading
const BASE32_CHARS = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function generateToken(): string {
  const bytes = new Uint8Array(16); // 16 random bytes → 4 groups of 4 base32 chars
  crypto.getRandomValues(bytes);
  let raw = "";
  for (const b of bytes) {
    raw += BASE32_CHARS[b % BASE32_CHARS.length];
  }
  // Format: XXXX-XXXX-XXXX-XXXX (16 chars)
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Admin authentication ─────────────────────────────────────
    const adminPassword = req.headers.get("x-admin-password");
    const expectedPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || adminPassword !== expectedPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: { count?: number };
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const count = Math.min(body.count ?? 150, 150);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

  // ── Generate, hash, and insert tokens ───────────────────────
  const plaintextTokens: string[] = [];
  const rows: { token_hash: string; token_last_four: string; status: string }[] = [];

  for (let i = 0; i < count; i++) {
    const token = generateToken();
    const tokenClean = token.replace(/-/g, ""); // XXXXXXXXXXXXXXXX for hashing
    const hash = await bcrypt.hash(tokenClean, 10);
    plaintextTokens.push(token);
    rows.push({
      token_hash: hash,
      token_last_four: token.slice(-4),
      status: "unused",
    });
  }

  const { error: insertError } = await supabase.from("voter_credentials").insert(rows);

  if (insertError) {
    console.error("Insert error:", insertError);
    return new Response(
      JSON.stringify({ error: "Failed to save tokens to database" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Audit log
  await supabase.from("audit_log").insert({
    action: "token_generated",
    details: { count, generated_at: new Date().toISOString() },
  });

  // Return plaintext tokens ONCE — they will NOT be retrievable again
  return new Response(
      JSON.stringify({
        success: true,
        count,
        tokens: plaintextTokens,
        warning: "Save these tokens now. They will NOT be shown again.",
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
