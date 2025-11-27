import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const cameraId = url.searchParams.get('id');

    // GET - List all cameras
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create new camera
    if (req.method === 'POST') {
      const body = await req.json();
      const { name, location, rtsp_url } = body;

      if (!name || !location || !rtsp_url) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name, location, rtsp_url' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('cameras')
        .insert([{ name, location, rtsp_url, status: 'offline' }])
        .select()
        .single();

      if (error) throw error;

      console.log('Camera created:', data);
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH - Update camera status
    if (req.method === 'PATCH' && cameraId) {
      const body = await req.json();
      const { status } = body;

      const { data, error } = await supabase
        .from('cameras')
        .update({ status })
        .eq('id', cameraId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Remove camera
    if (req.method === 'DELETE' && cameraId) {
      const { error } = await supabase
        .from('cameras')
        .delete()
        .eq('id', cameraId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Camera operation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});