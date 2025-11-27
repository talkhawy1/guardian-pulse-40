import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import CameraCard from "@/components/CameraCard";
import AddCameraDialog from "@/components/AddCameraDialog";
import { supabase } from "@/integrations/supabase/client";
import { Video } from "lucide-react";

const Cameras = () => {
  const [cameras, setCameras] = useState([]);

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCameras(data || []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  useEffect(() => {
    fetchCameras();

    // Subscribe to camera changes
    const channel = supabase
      .channel('cameras-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cameras'
        },
        () => {
          fetchCameras();
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Camera Management</h1>
            <p className="text-muted-foreground">
              Configure and monitor all connected cameras
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Video className="w-4 h-4 mr-1" />
              {onlineCount}/{cameras.length} Online
            </Badge>
            <AddCameraDialog onCameraAdded={fetchCameras} />
          </div>
        </div>

        {cameras.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map((camera: any) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onDelete={fetchCameras}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <Video className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No cameras configured</h3>
              <p className="text-muted-foreground">
                Add your first camera to start monitoring
              </p>
            </div>
            <AddCameraDialog onCameraAdded={fetchCameras} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Cameras;