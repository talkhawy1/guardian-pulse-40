import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, AlertCircle, Video, Settings } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Emergency Detection</h1>
          </div>
          <div className="flex gap-1">
            <NavLink
              to="/"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              activeClassName="bg-accent text-accent-foreground"
            >
              <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
              Dashboard
            </NavLink>
            <NavLink
              to="/events"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              activeClassName="bg-accent text-accent-foreground"
            >
              <AlertCircle className="w-4 h-4 inline-block mr-2" />
              Events
            </NavLink>
            <NavLink
              to="/cameras"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              activeClassName="bg-accent text-accent-foreground"
            >
              <Video className="w-4 h-4 inline-block mr-2" />
              Cameras
            </NavLink>
            <NavLink
              to="/setup"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
              activeClassName="bg-accent text-accent-foreground"
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Setup
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;