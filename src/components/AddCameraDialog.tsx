import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddCameraDialogProps {
  onCameraAdded: () => void;
}

const AddCameraDialog = ({ onCameraAdded }: AddCameraDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rtsp_url: '',
    hls_url: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('cameras', {
        body: formData,
        method: 'POST'
      });

      if (error) throw error;

      toast({
        title: "Camera added",
        description: `${formData.name} has been successfully added`,
      });
      setFormData({ name: '', location: '', rtsp_url: '', hls_url: '' });
      setOpen(false);
      onCameraAdded();
    } catch (error) {
      console.error('Error adding camera:', error);
      toast({
        title: "Error",
        description: "Failed to add camera",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Camera Name</Label>
            <Input
              id="name"
              placeholder="e.g., Front Entrance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Building A, Floor 1"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rtsp_url">RTSP URL</Label>
            <Input
              id="rtsp_url"
              placeholder="rtsp://camera-ip:port/stream"
              value={formData.rtsp_url}
              onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hls_url">HLS URL (اختياري - للبث في المتصفح)</Label>
            <Input
              id="hls_url"
              placeholder="http://server:8888/stream/index.m3u8"
              value={formData.hls_url}
              onChange={(e) => setFormData({ ...formData, hls_url: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Camera'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;