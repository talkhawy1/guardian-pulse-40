import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Camera {
  id: string;
  name: string;
  location: string;
  rtsp_url: string;
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
        body: {},
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
        {/* Video placeholder - In real app, this would show HLS stream */}
        <div className="aspect-video bg-secondary/20 flex items-center justify-center relative group">
          {camera.status === 'online' ? (
            <>
              <Video className="w-16 h-16 text-muted-foreground" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-primary-foreground text-sm">Stream: {camera.rtsp_url}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <VideoOff className="w-16 h-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Camera {statusLabels[camera.status]}</p>
            </div>
          )}
        </div>
        <div className="p-4 flex justify-end">
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