import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AlertCard from "@/components/AlertCard";
import CameraCard from "@/components/CameraCard";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Users, Eye, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOCAL_BACKEND_URL = "http://localhost:8000";

interface LocalEvent {
  id: string;
  event_type: string;
  timestamp: string;
  confidence?: number;
}

const Dashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [stats, setStats] = useState({ fire: 0, violence: 0, suspicious: 0, total: 0 });
  const { toast } = useToast();
  
  // Track seen event IDs to detect new events
  const seenEventIds = useRef<Set<string>>(new Set());

  const fetchCameras = async () => {
    try {
      const { data: camerasData, error: camerasError } = await supabase
        .from('cameras')
        .select('*')
        .order('created_at', { ascending: false });

      if (camerasError) throw camerasError;
      setCameras(camerasData || []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  // Poll local backend for events
  const pollLocalEvents = async () => {
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const events: LocalEvent[] = await response.json();
      
      // Calculate stats from local events
      const fireCount = events.filter(e => e.event_type === 'fire').length;
      const violenceCount = events.filter(e => e.event_type === 'violence').length;
      const suspiciousCount = events.filter(e => e.event_type === 'suspicious_behaviour').length;

      setStats({
        fire: fireCount,
        violence: violenceCount,
        suspicious: suspiciousCount,
        total: events.length
      });

      // Detect NEW events and show toasts
      events.forEach((event) => {
        if (!seenEventIds.current.has(event.id)) {
          seenEventIds.current.add(event.id);
          
          // Show toast for new fire events
          if (event.event_type === 'fire') {
            toast({
              title: "🔥 Fire Detected!",
              description: "Sending automated email to Fire Dept (998)...",
              variant: "destructive",
              duration: 8000,
            });
          }
          
          // Show toast for security events (violence or suspicious behaviour)
          if (event.event_type === 'violence' || event.event_type === 'suspicious_behaviour') {
            toast({
              title: "⚠️ Security Alert!",
              description: "Notifying Security Team...",
              className: "bg-yellow-500 text-yellow-950 border-yellow-600",
              duration: 8000,
            });
          }
        }
      });

      // Update recent alerts display (latest 5)
      const sortedEvents = [...events].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);
      
      setRecentAlerts(sortedEvents.map(e => ({
        id: e.id,
        event_type: e.event_type,
        timestamp: e.timestamp,
        confidence: e.confidence || 0.95,
        severity_level: e.event_type === 'fire' ? 'critical' : 'high',
        cameras: { name: 'Local Camera', location: 'Main Entrance' }
      })));

    } catch (error) {
      console.error('Error polling local backend:', error);
    }
  };

  useEffect(() => {
    // Fetch cameras from Supabase (still needed for camera display)
    fetchCameras();

    // Initial poll
    pollLocalEvents();

    // Poll every 2 seconds
    const pollInterval = setInterval(pollLocalEvents, 2000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const onlineCount = cameras.filter((c: any) => c.status === 'online').length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Badge variant="secondary">{stats.total}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All detected events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fire Events</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fire}</div>
              <p className="text-xs text-muted-foreground">Fire detections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Violence Events</CardTitle>
              <Users className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.violence}</div>
              <p className="text-xs text-muted-foreground">Violence detections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Behavior</CardTitle>
              <Eye className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspicious}</div>
              <p className="text-xs text-muted-foreground">Suspicious activities</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feeds */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Camera Feeds</h2>
              <Badge variant="secondary">
                <Video className="w-4 h-4 mr-1" />
                {onlineCount}/{cameras.length} Online
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.slice(0, 4).map((camera: any) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  onDelete={fetchCameras}
                />
              ))}
            </div>
            {cameras.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No cameras configured. Add cameras from the Cameras page.</p>
              </Card>
            )}
          </div>

          {/* Recent Alerts */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Alerts</h2>
            <div className="space-y-3">
              {recentAlerts.map((alert: any) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
            {recentAlerts.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No recent alerts from local backend</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
