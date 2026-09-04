// Type declarations for Supabase Deno Edge Functions in VS Code / TypeScript Language Server

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/bcryptjs@2.4.3" {
  import bcrypt from "bcryptjs";
  export default bcrypt;
}
