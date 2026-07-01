import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/health
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hpe_bookings")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Health check error:", error);
      return NextResponse.json(
        {
          ok: false,
          database: "error",
          message: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        database: "connected",
        timestamp: new Date().toISOString()
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Health check exception:", error);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
