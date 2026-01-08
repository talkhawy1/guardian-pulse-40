import { useState } from "react";
import { Video, VideoOff, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  hlsUrl?: string;
  mjpegUrl?: string;
  rtspUrl: string;
  isOnline: boolean;
}

const VideoPlayer = ({ hlsUrl, mjpegUrl, rtspUrl, isOnline }: VideoPlayerProps) => {
  const [imgError, setImgError] = useState(false);

  // Priority: MJPEG > HLS > Placeholder
  const streamUrl = mjpegUrl || hlsUrl;

  if (streamUrl && isOnline && !imgError) {
    return (
      <div className="aspect-video bg-secondary/20 relative">
        <img
          src={streamUrl}
          alt="Camera Stream"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (imgError) {
    return (
      <div className="aspect-video bg-secondary/20 flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-muted-foreground">فشل تحميل البث</p>
        <p className="text-xs text-muted-foreground/70">تأكد من تشغيل السيرفر المحلي</p>
      </div>
    );
  }

  // Placeholder when no stream URL
  return (
    <div className="aspect-video bg-secondary/20 flex items-center justify-center">
      {isOnline ? (
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <Video className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            البث يحتاج MJPEG Server
          </p>
          <p className="text-xs text-muted-foreground/70">
            شغّل FastAPI server محلياً
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
