import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  hlsUrl?: string;
  rtspUrl: string;
  isOnline: boolean;
}

const VideoPlayer = ({ hlsUrl, rtspUrl, isOnline }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHls = async () => {
      if (!hlsUrl || !videoRef.current) return;
      
      setLoading(true);
      setError(false);

      try {
        const Hls = (await import("hls.js")).default;
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoRef.current);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            videoRef.current?.play().catch(console.error);
          });
          
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setError(true);
              setLoading(false);
            }
          });

          return () => {
            hls.destroy();
          };
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS support
          videoRef.current.src = hlsUrl;
          videoRef.current.addEventListener("loadedmetadata", () => {
            setLoading(false);
            videoRef.current?.play().catch(console.error);
          });
        }
      } catch (err) {
        console.error("HLS loading error:", err);
        setError(true);
        setLoading(false);
      }
    };

    if (hlsUrl) {
      loadHls();
    } else {
      setLoading(false);
    }
  }, [hlsUrl]);

  // If HLS URL is available, show the video player
  if (hlsUrl && isOnline) {
    return (
      <div className="aspect-video bg-secondary/20 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-sm text-muted-foreground">فشل تحميل البث</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          controls
        />
      </div>
    );
  }

  // Placeholder when no HLS URL
  return (
    <div className="aspect-video bg-secondary/20 flex items-center justify-center">
      {isOnline ? (
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <Video className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            البث يحتاج Media Server
          </p>
          <p className="text-xs text-muted-foreground/70">
            استخدم VLC لمشاهدة البث مباشرة
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <VideoOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">الكاميرا غير متصلة</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
