import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Flame, Users, ShieldAlert, AlertTriangle, Image as ImageIcon } from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [filters, setFilters] = useState({
    event_type: 'all',
    camera_id: 'all',
    severity_level: 'all'
  });

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          cameras (
            id,
            name,
            location
          )
        `)
        .order('timestamp', { ascending: false });

      if (filters.event_type !== 'all') {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.camera_id !== 'all') {
        query = query.eq('camera_id', filters.camera_id);
      }
      if (filters.severity_level !== 'all') {
        query = query.eq('severity_level', filters.severity_level);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*');
      if (error) throw error;
      setCameras(data || []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCameras();
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Event History</h1>
          <Badge variant="secondary">{events.length} Total Events</Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={filters.event_type}
                onValueChange={(value) => setFilters({ ...filters, event_type: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="fight">Fight</SelectItem>
                  <SelectItem value="intrusion">Intrusion</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Camera</label>
              <Select
                value={filters.camera_id}
                onValueChange={(value) => setFilters({ ...filters, camera_id: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cameras</SelectItem>
                  {cameras.map((camera: any) => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={filters.severity_level}
                onValueChange={(value) => setFilters({ ...filters, severity_level: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event: any) => {
            const Icon = eventIcons[event.event_type as keyof typeof eventIcons];
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Event Icon */}
                    <div className={`flex-shrink-0 p-4 rounded-lg bg-card ${eventColors[event.event_type as keyof typeof eventColors]}`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold capitalize">{event.event_type} Detected</h3>
                        <Badge className={severityColors[event.severity_level as keyof typeof severityColors]} variant="outline">
                          {event.severity_level}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {event.cameras?.name} - {event.cameras?.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                        <span className="font-medium">Confidence: {event.confidence.toFixed(0)}%</span>
                        <span className="text-muted-foreground">ID: {event.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Snapshot Placeholder */}
                    <div className="flex-shrink-0 w-32 h-24 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {events.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No events match your filters</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;