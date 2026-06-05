import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <button
        onClick={openSidebar}
        className="fixed top-5 left-5 z-40 p-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:opacity-90 transition-opacity"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <main className="min-h-screen pl-16">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;