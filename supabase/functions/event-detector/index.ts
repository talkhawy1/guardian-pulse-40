import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock YOLO detection functions - Replace with real model inference
function mockFireDetection(): { detected: boolean; confidence: number } {
  const random = Math.random();
  return {
    detected: random > 0.95, // 5% chance of fire detection
    confidence: random > 0.95 ? 75 + Math.random() * 25 : 0
  };
}

function mockFightDetection(): { detected: boolean; confidence: number } {
  const random = Math.random();
  return {
    detected: random > 0.97, // 3% chance of fight detection
    confidence: random > 0.97 ? 70 + Math.random() * 30 : 0
  };
}

function mockIntrusionDetection(): { detected: boolean; confidence: number } {
  const random = Math.random();
  return {
    detected: random > 0.96, // 4% chance of intrusion detection
    confidence: random > 0.96 ? 80 + Math.random() * 20 : 0
  };
}

function determineSeverity(eventType: string, confidence: number): string {
  if (confidence >= 90) return 'critical';
  if (confidence >= 75) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { camera_id, frame_data } = body; // frame_data would be base64 image in real implementation

    if (!camera_id) {
      return new Response(
        JSON.stringify({ error: 'camera_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Run mock detections (in real app, this would process the frame_data with YOLO models)
    const fireResult = mockFireDetection();
    const fightResult = mockFightDetection();
    const intrusionResult = mockIntrusionDetection();

    const detections = [];

    // Process fire detection
    if (fireResult.detected) {
      const severity = determineSeverity('fire', fireResult.confidence);
      const { data: event, error } = await supabase
        .from('events')
        .insert([{
          event_type: 'fire',
          camera_id,
          confidence: fireResult.confidence,
          severity_level: severity,
          snapshot_path: `snapshots/${camera_id}_fire_${Date.now()}.jpg`, // Mock path
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating fire event:', error);
      } else {
        console.log('Fire detected:', event);
        detections.push(event);
      }
    }

    // Process fight detection
    if (fightResult.detected) {
      const severity = determineSeverity('fight', fightResult.confidence);
      const { data: event, error } = await supabase
        .from('events')
        .insert([{
          event_type: 'fight',
          camera_id,
          confidence: fightResult.confidence,
          severity_level: severity,
          snapshot_path: `snapshots/${camera_id}_fight_${Date.now()}.jpg`,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating fight event:', error);
      } else {
        console.log('Fight detected:', event);
        detections.push(event);
      }
    }

    // Process intrusion detection
    if (intrusionResult.detected) {
      const severity = determineSeverity('intrusion', intrusionResult.confidence);
      const { data: event, error } = await supabase
        .from('events')
        .insert([{
          event_type: 'intrusion',
          camera_id,
          confidence: intrusionResult.confidence,
          severity_level: severity,
          snapshot_path: `snapshots/${camera_id}_intrusion_${Date.now()}.jpg`,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating intrusion event:', error);
      } else {
        console.log('Intrusion detected:', event);
        detections.push(event);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        detections_count: detections.length,
        detections
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Detection error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});