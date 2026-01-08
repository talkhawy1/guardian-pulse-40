import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoPlayer from "./VideoPlayer";

interface Camera {
  id: string;
  name: string;
  location: string;
  rtsp_url: string;
  hls_url?: string;
  status: 'online' | 'offline' | 'error';
  created_at: string;
}

interface CameraCardProps {
  camera: Camera;
  onDelete: () => void;
}

const CameraCard = ({ camera, onDelete }: CameraCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase.functions.invoke('cameras', {
        body: { id: camera.id },
        method: 'DELETE',
      });

      if (error) throw error;

      toast({
        title: "Camera deleted",
        description: `${camera.name} has been removed`,
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast({
        title: "Error",
        description: "Failed to delete camera",
        variant: "destructive",
      });
    }
  };

  const copyRtspUrl = () => {
    navigator.clipboard.writeText(camera.rtsp_url);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط RTSP",
    });
  };

  const openInVlc = () => {
    // VLC protocol handler
    window.open(`vlc://${camera.rtsp_url}`, '_blank');
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-muted',
    error: 'bg-destructive'
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    error: 'Error'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-card border-b border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{camera.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{camera.location}</p>
          </div>
          <Badge 
            variant={camera.status === 'online' ? 'default' : 'secondary'}
            className="gap-1"
          >
            <span className={`w-2 h-2 rounded-full ${statusColors[camera.status]}`} />
            {statusLabels[camera.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <VideoPlayer 
          hlsUrl={camera.hls_url}
          rtspUrl={camera.rtsp_url}
          isOnline={camera.status === 'online'}
        />
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyRtspUrl}
              title="نسخ رابط RTSP"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInVlc}
              title="فتح في VLC"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCard;