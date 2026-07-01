import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('hpe_bookings')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return Response.json(
        { ok: false, database: 'error', message: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { ok: false, database: 'error', message: error.message },
      { status: 500 }
    );
  }
}
