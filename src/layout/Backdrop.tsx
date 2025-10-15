import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-success-900 bg-opacity-60 dark:bg-opacity-80 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
