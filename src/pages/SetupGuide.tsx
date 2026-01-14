import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Copy, Terminal, Server, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SetupGuide = () => {
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isChecking, setIsChecking] = useState(false);

  const checkServerHealth = async () => {
    setIsChecking(true);
    setServerStatus("checking");
    try {
      const response = await fetch("http://localhost:8000/health");
      if (response.ok) {
        setServerStatus("online");
        toast.success("Python server is running!");
      } else {
        setServerStatus("offline");
      }
    } catch {
      setServerStatus("offline");
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const steps = [
    {
      title: "Install Python Dependencies",
      description: "Navigate to the backend folder and install required packages",
      command: "cd backend && pip install -r requirements.txt",
    },
    {
      title: "Start Python Server",
      description: "Run the FastAPI server to stream camera feed",
      command: "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000",
    },
    {
      title: "Install Node Dependencies",
      description: "Install frontend dependencies (in a new terminal)",
      command: "npm install",
    },
    {
      title: "Start React Frontend",
      description: "Run the React development server",
      command: "npm run dev",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup Guide</h1>
          <p className="text-muted-foreground">
            Follow these steps to run the complete project locally with camera streaming
          </p>
        </div>

        {/* Server Status Check */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Python Server Status
            </CardTitle>
            <CardDescription>
              Check if the Python camera streaming server is running
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Button
              onClick={checkServerHealth}
              disabled={isChecking}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              Check Status
            </Button>
            {serverStatus === "online" && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                <CheckCircle className="w-4 h-4 mr-1" />
                Online
              </Badge>
            )}
            {serverStatus === "offline" && (
              <Badge variant="destructive">
                <XCircle className="w-4 h-4 mr-1" />
                Offline
              </Badge>
            )}
            {serverStatus === "checking" && !isChecking && (
              <Badge variant="secondary">Not checked yet</Badge>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </span>
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg font-mono text-sm">
                  <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1 overflow-x-auto">{step.command}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(step.command, "Command")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* URLs Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Access URLs
            </CardTitle>
            <CardDescription>
              After starting both servers, access the application at these URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div>
                <p className="font-medium">Frontend (React)</p>
                <code className="text-sm text-muted-foreground">http://localhost:8080</code>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard("http://localhost:8080", "URL")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div>
                <p className="font-medium">Video Feed (Direct)</p>
                <code className="text-sm text-muted-foreground">http://localhost:8000/video_feed</code>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard("http://localhost:8000/video_feed", "URL")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div>
                <p className="font-medium">Server Health Check</p>
                <code className="text-sm text-muted-foreground">http://localhost:8000/health</code>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard("http://localhost:8000/health", "URL")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SetupGuide;
