import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Ticket,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("ids_role") || "Employee";

  function logout() {
    localStorage.removeItem("ids_token");
    localStorage.removeItem("ids_role");
    navigate("/login");
  }

  function linkClass(path) {
    const active = location.pathname === path;

    return (
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " +
      (active
        ? "bg-white/15 text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white")
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-primary text-primary-foreground p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">IDS Help Desk</h1>
        <p className="text-sm text-white/70 mt-1">{role}</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        {role === "Employee" && (
          <>
            <Link to="/tickets/create" className={linkClass("/tickets/create")}>
              <Plus className="w-5 h-5" />
              Create Ticket
            </Link>

            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <Ticket className="w-5 h-5" />
              My Tickets
            </Link>
          </>
        )}

        {role === "Agent" && (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <Ticket className="w-5 h-5" />
              Assigned Tickets
            </Link>

            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <Ticket className="w-5 h-5" />
              All Tickets
            </Link>
          </>
        )}

        {role === "Admin" && (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <Ticket className="w-5 h-5" />
              All Tickets
            </Link>

            <Link to="/users" className={linkClass("/users")}>
              <Users className="w-5 h-5" />
              Manage Users
            </Link>

            <Link to="/settings" className={linkClass("/settings")}>
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </>
        )}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;