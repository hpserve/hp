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

// POST /api/bookings -> create a new booking
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.mobile) {
      return NextResponse.json(
        { ok: false, error: "customer_name and mobile are required" },
        { status: 400 }
      );
    }

    const bookingData = {
      order_id: body.order_id || `ORD-${Date.now()}`,
      customer_name: body.customer_name,
      mobile: body.mobile,
      email: body.email || null,
      company: body.company || null,
      department: body.department || null,
      service_name: body.service_name || null,
      work_date: body.work_date || null,
      work_time: body.work_time || null,
      pickup_location: body.pickup_location || null,
      notes: body.notes || null,
      subtotal: body.subtotal || 0,
      gst_percent: body.gst_percent || 18,
      gst_amount: body.gst_amount || 0,
      grand_total: body.grand_total || 0,
      booking_type: body.booking_type || "booking",
      payment_status: body.payment_status || "Pending",
      booking_status: body.booking_status || "New"
    };

    const { data, error } = await supabase
      .from("hpe_bookings")
      .insert([bookingData])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return NextResponse.json(
      { ok: true, booking: data[0] },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" }
      }
    );
  } catch (error) {
    console.error("POST /api/bookings failed:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/bookings -> list all bookings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hpe_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      throw error;
    }

    return NextResponse.json(
      { ok: true, bookings: data || [], count: (data || []).length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/bookings failed:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
