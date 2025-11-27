import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const eventType = url.searchParams.get('event_type');
    const cameraId = url.searchParams.get('camera_id');
    const severityLevel = url.searchParams.get('severity_level');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('events')
      .select(`
        *,
        cameras (
          id,
          name,
          location
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (cameraId) {
      query = query.eq('camera_id', cameraId);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`Fetched ${data.length} events with filters:`, { eventType, cameraId, severityLevel });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});