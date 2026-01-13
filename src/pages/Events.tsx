import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { Flame, Users, Eye, AlertTriangle, Image as ImageIcon, Play, X } from "lucide-react";

const LOCAL_BACKEND_URL = "http://localhost:8000";

interface LocalEvent {
  id: string;
  event_type: string;
  timestamp: string;
  confidence?: number;
  severity_level?: string;
  camera_name?: string;
  camera_location?: string;
  snapshot_url?: string;
  video_url?: string;
}

const Events = () => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [filters, setFilters] = useState({
    event_type: 'all',
    severity_level: 'all'
  });
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${LOCAL_BACKEND_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data: LocalEvent[] = await response.json();
      
      // Apply filters client-side
      let filteredData = data;
      
      if (filters.event_type !== 'all') {
        filteredData = filteredData.filter(e => e.event_type === filters.event_type);
      }
      if (filters.severity_level !== 'all') {
        filteredData = filteredData.filter(e => e.severity_level === filters.severity_level);
      }
      
      // Sort by timestamp descending
      filteredData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setEvents(filteredData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, [filters]);

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

  const getDisplayLabel = (eventType: string) => {
    return eventLabels[eventType] || eventType;
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
                  <SelectItem value="violence">Violence</SelectItem>
                  <SelectItem value="suspicious_behaviour">Suspicious Behavior</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
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
          {events.map((event) => {
            const Icon = eventIcons[event.event_type] || AlertTriangle;
            const colorClass = eventColors[event.event_type] || 'text-gray-500';
            const severityClass = severityColors[event.severity_level || 'medium'] || severityColors.medium;
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Event Icon */}
                    <div className={`flex-shrink-0 p-4 rounded-lg bg-card ${colorClass}`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{getDisplayLabel(event.event_type)} Detected</h3>
                        <Badge className={severityClass} variant="outline">
                          {event.severity_level || 'medium'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {event.camera_name || 'Local Camera'} - {event.camera_location || 'Main Entrance'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                        <span className="font-medium">Confidence: {((event.confidence || 0.95) * 100).toFixed(0)}%</span>
                        <span className="text-muted-foreground">ID: {event.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Snapshot with Video Overlay */}
                    {event.snapshot_url ? (
                      <div 
                        className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                        onClick={() => {
                          if (event.video_url) {
                            setSelectedVideo({ url: event.video_url, title: `${getDisplayLabel(event.event_type)} - ${event.camera_name || 'Camera'}` });
                          } else {
                            window.open(event.snapshot_url, '_blank');
                          }
                        }}
                      >
                        <img 
                          src={event.snapshot_url} 
                          alt="Event snapshot" 
                          className="w-full h-full object-cover"
                        />
                        {event.video_url && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-32 h-24 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {events.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No events from local backend</p>
            </Card>
          )}
        </div>

        {/* Video Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {selectedVideo && (
                <video 
                  controls 
                  autoPlay 
                  className="w-full rounded-lg"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Events;
