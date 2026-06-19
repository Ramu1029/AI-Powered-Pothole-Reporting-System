// Lightweight keep-alive endpoint to prevent Supabase free-tier inactivity.
// Performs a minimal read against the `regions` table (small, public, low cost).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Minimal connectivity check: HEAD-style count query, no row data returned.
    const { error, count } = await supabase
      .from("regions")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        status: "alive",
        table: "regions",
        count: count ?? 0,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        message: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
