import { Outlet } from "react-router";
import AppHeader from "./AppHeader";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* AppHeader carries the module navigation and its own stickiness. */}
      <AppHeader />
      {/* Full-bleed: padding only, no max-width, so wide accounting tables get the whole screen. */}
      <div className="w-full p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
