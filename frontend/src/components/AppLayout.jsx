import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;