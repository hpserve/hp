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

// GET /api/admin/orders                -> list all bookings/orders
// GET /api/admin/orders?status=pending -> filter by status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("hpe_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("booking_status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    return NextResponse.json(
      { ok: true, orders: data || [], count: (data || []).length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("GET /api/admin/orders failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch orders", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders -> update status of an order
// Body: { id, status }
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body || {};

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("hpe_bookings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, order: data[0] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("PATCH /api/admin/orders failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update order", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders?id=123 -> delete an order
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Order ID query param is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("hpe_bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    return NextResponse.json(
      { ok: true, deleted: id },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("DELETE /api/admin/orders failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete order", details: err.message },
      { status: 500 }
    );
  }
}
