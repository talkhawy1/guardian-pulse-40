import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AlertCard from "@/components/AlertCard";
import CameraCard from "@/components/CameraCard";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Users, ShieldAlert, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [stats, setStats] = useState({ fire: 0, fight: 0, intrusion: 0, total: 0 });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch cameras
      const { data: camerasData, error: camerasError } = await supabase
        .from('cameras')
        .select('*')
        .order('created_at', { ascending: false });

      if (camerasError) throw camerasError;
      setCameras(camerasData || []);

      // Fetch recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          cameras (
            id,
            name,
            location
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (eventsError) throw eventsError;
      setRecentAlerts(eventsData || []);

      // Calculate stats
      const fireCount = eventsData?.filter(e => e.event_type === 'fire').length || 0;
      const fightCount = eventsData?.filter(e => e.event_type === 'fight').length || 0;
      const intrusionCount = eventsData?.filter(e => e.event_type === 'intrusion').length || 0;

      setStats({
        fire: fireCount,
        fight: fightCount,
        intrusion: intrusionCount,
        total: eventsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime events
    const channel = supabase
      .channel('events-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('New event detected:', payload);
          
          // Play alert sound
          const audio = new Audio('/alert.mp3');
          audio.play().catch(err => console.log('Audio play failed:', err));

          toast({
            title: `${payload.new.event_type.toUpperCase()} Detected!`,
            description: `Severity: ${payload.new.severity_level}`,
            variant: payload.new.severity_level === 'critical' ? 'destructive' : 'default',
          });

          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
              <CardTitle className="text-sm font-medium">Fight Events</CardTitle>
              <Users className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fight}</div>
              <p className="text-xs text-muted-foreground">Fight detections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Intrusions</CardTitle>
              <ShieldAlert className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.intrusion}</div>
              <p className="text-xs text-muted-foreground">Security breaches</p>
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
                  onDelete={fetchData}
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
                <p className="text-muted-foreground">No recent alerts</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;