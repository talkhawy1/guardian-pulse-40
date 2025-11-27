-- Create cameras table
CREATE TABLE IF NOT EXISTS public.cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rtsp_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('fire', 'fight', 'intrusion', 'fall')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  snapshot_path TEXT,
  camera_id UUID REFERENCES public.cameras(id) ON DELETE CASCADE,
  confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for cameras (public access for this monitoring system)
CREATE POLICY "Allow public read access to cameras"
  ON public.cameras FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to cameras"
  ON public.cameras FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to cameras"
  ON public.cameras FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to cameras"
  ON public.cameras FOR DELETE
  USING (true);

-- Create policies for events (public access for this monitoring system)
CREATE POLICY "Allow public read access to events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to events"
  ON public.events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to events"
  ON public.events FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to events"
  ON public.events FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_events_camera_id ON public.events(camera_id);
CREATE INDEX idx_events_timestamp ON public.events(timestamp DESC);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_cameras_status ON public.cameras(status);

-- Enable realtime for events table (for WebSocket updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;