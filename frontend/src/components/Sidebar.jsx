import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  X,
  User,
} from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const role = localStorage.getItem("ids_role") || "Employee";
  const name = localStorage.getItem("ids_name") || "User";

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
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
      )}

      <aside
        className={
          "fixed top-0 left-0 z-50 h-screen w-72 bg-primary text-primary-foreground p-6 flex flex-col shadow-xl transition-transform duration-300 " +
          (isOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">IDS Help Desk</h1>
            <p className="text-sm text-white/70 mt-1">Ticketing System</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link to="/dashboard" onClick={onClose} className={linkClass("/dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          {role === "Employee" && (
            <Link to="/dashboard" onClick={onClose} className={linkClass("/dashboard")}>
              <Ticket className="w-5 h-5" />
              My Tickets
            </Link>
          )}

          {role === "Agent" && (
            <>
              <Link to="/dashboard" onClick={onClose} className={linkClass("/dashboard")}>
                <Ticket className="w-5 h-5" />
                Assigned Tickets
              </Link>

              <Link to="/dashboard" onClick={onClose} className={linkClass("/dashboard")}>
                <Ticket className="w-5 h-5" />
                All Tickets
              </Link>
            </>
          )}

          {role === "Admin" && (
            <>
              <Link to="/dashboard" onClick={onClose} className={linkClass("/dashboard")}>
                <Ticket className="w-5 h-5" />
                All Tickets
              </Link>

              <Link to="/users" onClick={onClose} className={linkClass("/users")}>
                <Users className="w-5 h-5" />
                Manage Users
              </Link>

              <Link to="/settings" onClick={onClose} className={linkClass("/settings")}>
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </>
          )}
        </nav>

        <div className="border-t border-white/15 pt-4">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>

            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-white/70">{role}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;