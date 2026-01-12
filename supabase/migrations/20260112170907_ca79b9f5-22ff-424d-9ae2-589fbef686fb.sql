-- Add mjpeg_url column to cameras table
ALTER TABLE public.cameras 
ADD COLUMN mjpeg_url text;