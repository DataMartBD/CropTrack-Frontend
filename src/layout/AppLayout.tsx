import { Outlet } from "react-router";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const AppLayout: React.FC = () => {
  return (
    // Column flex, with flex-1 on the content, so the footer sits at the bottom
    // of the viewport on short pages instead of riding up under the content.
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* AppHeader carries the module navigation and its own stickiness. */}
      <AppHeader />
      {/* Full-bleed: padding only, no max-width, so wide accounting tables get the whole screen. */}
      <div className="w-full flex-1 p-4 md:p-6">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
