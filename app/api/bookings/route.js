import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.mobile) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert booking
    const { data, error } = await supabase
      .from('hpe_bookings')
      .insert([body])
      .select();

    if (error) {
      throw error;
    }

    return Response.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('hpe_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
