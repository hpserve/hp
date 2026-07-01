import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('hpe_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('booking_status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Admin orders error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('hpe_bookings')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return Response.json(data[0]);
  } catch (error) {
    console.error('Update order error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
