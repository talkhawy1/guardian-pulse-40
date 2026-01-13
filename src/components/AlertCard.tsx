import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Flame, Users, Eye, Image as ImageIcon, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  event_type: string;
  timestamp: string;
  camera_id?: string;
  confidence: number;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  snapshot_url?: string;
  video_url?: string;
  cameras?: {
    name: string;
    location: string;
  };
}

interface AlertCardProps {
  alert: Alert;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  const [showVideo, setShowVideo] = useState(false);

  const eventIcons: Record<string, typeof Flame> = {
    fire: Flame,
    violence: Users,
    suspicious_behaviour: Eye,
    fall: AlertTriangle
  };

  const eventColors: Record<string, string> = {
    fire: 'text-orange-500',
    violence: 'text-red-500',
    suspicious_behaviour: 'text-yellow-500',
    fall: 'text-yellow-500'
  };

  const eventLabels: Record<string, string> = {
    fire: 'Fire',
    violence: 'Violence',
    suspicious_behaviour: 'Suspicious Behavior',
    fall: 'Fall'
  };

  const severityColors: Record<string, string> = {
    low: 'bg-blue-500/10 text-blue-600 border-blue-300',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-300',
    high: 'bg-orange-500/10 text-orange-600 border-orange-300',
    critical: 'bg-red-500/10 text-red-600 border-red-300'
  };

  const Icon = eventIcons[alert.event_type] || AlertTriangle;
  const colorClass = eventColors[alert.event_type] || 'text-gray-500';
  const displayLabel = eventLabels[alert.event_type] || alert.event_type;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-card ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{displayLabel} Detected</h4>
              <Badge className={severityColors[alert.severity_level] || severityColors.medium} variant="outline">
                {alert.severity_level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {alert.cameras?.name} - {alert.cameras?.location}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
              <span className="font-medium">Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          {/* Snapshot thumbnail with Video Overlay */}
          {alert.snapshot_url ? (
            <div 
              className="relative flex-shrink-0 w-16 h-12 rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
              onClick={() => {
                if (alert.video_url) {
                  setShowVideo(true);
                } else {
                  window.open(alert.snapshot_url, '_blank');
                }
              }}
            >
              <img 
                src={alert.snapshot_url} 
                alt="Event snapshot" 
                className="w-full h-full object-cover"
              />
              {alert.video_url && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-12 bg-secondary/20 rounded flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>

      {/* Video Modal */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{displayLabel} - {alert.cameras?.name || 'Camera'}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {alert.video_url && (
              <video 
                controls 
                autoPlay 
                className="w-full rounded-lg"
                src={alert.video_url}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AlertCard;