import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, Users, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  event_type: 'fire' | 'fight' | 'intrusion' | 'fall';
  timestamp: string;
  camera_id: string;
  confidence: number;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  cameras?: {
    name: string;
    location: string;
  };
}

interface AlertCardProps {
  alert: Alert;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  const eventIcons = {
    fire: Flame,
    fight: Users,
    intrusion: ShieldAlert,
    fall: AlertTriangle
  };

  const eventColors = {
    fire: 'text-orange-500',
    fight: 'text-red-500',
    intrusion: 'text-purple-500',
    fall: 'text-yellow-500'
  };

  const severityColors = {
    low: 'bg-blue-500/10 text-blue-600 border-blue-300',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-300',
    high: 'bg-orange-500/10 text-orange-600 border-orange-300',
    critical: 'bg-red-500/10 text-red-600 border-red-300'
  };

  const Icon = eventIcons[alert.event_type];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-card ${eventColors[alert.event_type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold capitalize">{alert.event_type} Detected</h4>
              <Badge className={severityColors[alert.severity_level]} variant="outline">
                {alert.severity_level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {alert.cameras?.name} - {alert.cameras?.location}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
              <span className="font-medium">Confidence: {alert.confidence.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;