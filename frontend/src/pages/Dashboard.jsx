import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  LogOut,
  Trash2,
  Pencil,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getTickets, deleteTicket } from "../api/api";

const ticketTrend = [
  { name: "Mon", tickets: 45 },
  { name: "Tue", tickets: 52 },
  { name: "Wed", tickets: 48 },
  { name: "Thu", tickets: 61 },
  { name: "Fri", tickets: 55 },
  { name: "Sat", tickets: 32 },
  { name: "Sun", tickets: 28 },
];

const priorityData = [
  { name: "Critical", value: 18, color: "#d4183d" },
  { name: "High", value: 42, color: "#f59e0b" },
  { name: "Medium", value: 64, color: "#3b82f6" },
  { name: "Low", value: 32, color: "#10b981" },
];

function getPriorityColor(priority) {
  if (priority === "Critical") return "bg-destructive text-destructive-foreground";
  if (priority === "High") return "bg-chart-4 text-white";
  if (priority === "Medium") return "bg-chart-1 text-white";
  if (priority === "Low") return "bg-chart-2 text-white";
  return "bg-muted text-muted-foreground";
}

function getStatusColor(status) {
  if (status === "Open") return "bg-chart-1/10 text-chart-1 border-chart-1/20";
  if (status === "Assigned") return "bg-primary/10 text-primary border-primary/20";
  if (status === "In Progress") return "bg-chart-4/10 text-chart-4 border-chart-4/20";
  if (status === "Resolved") return "bg-chart-2/10 text-chart-2 border-chart-2/20";
  if (status === "Closed") return "bg-muted text-muted-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
}

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("ids_role") || "Employee";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const response = await getTickets();
      setTickets(response.data);
    } catch (error) {
      alert("Could not load tickets.");
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(ticket) {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setTicketToDelete(null);
    setShowDeleteModal(false);
  }

  async function confirmDelete() {
    if (!ticketToDelete) return;

    try {
      setIsDeleting(true);
      await deleteTicket(ticketToDelete.id);
      setTickets(tickets.filter((ticket) => ticket.id !== ticketToDelete.id));
      closeDeleteModal();
    } catch (error) {
      alert("Could not delete ticket.");
    } finally {
      setIsDeleting(false);
    }
  }

  function logout() {
    localStorage.removeItem("ids_token");
    localStorage.removeItem("ids_role");
    navigate("/login");
  }

  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;

  const completedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved" || ticket.status === "Closed"
  ).length;

  const pendingCount = tickets.filter(
    (ticket) =>
      ticket.status === "Pending" ||
      ticket.status === "Assigned" ||
      ticket.status === "In Progress"
  ).length;

  const criticalCount = tickets.filter(
    (ticket) => ticket.priority === "Critical"
  ).length;

  const recentTickets = tickets.slice(-5).reverse();

  const stats = [
    {
      label: "Open Tickets",
      value: openCount,
      change: "+12%",
      trend: "up",
      icon: Ticket,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      label: "Completed Tickets",
      value: completedCount,
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Pending Tickets",
      value: pendingCount,
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      label: "Critical Tickets",
      value: criticalCount,
      change: "+3%",
      trend: "up",
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
          <p className="text-sm text-muted-foreground mt-1">Role: {role}</p>
        </div>

        <div className="flex items-center gap-3">
          {role === "Employee" && (
            <Link
              to="/tickets/create"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>New Ticket</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={"p-3 rounded-lg " + stat.bgColor}>
                  <Icon className={"w-6 h-6 " + stat.color} />
                </div>

                <div
                  className={
                    "flex items-center gap-1 text-sm " +
                    (stat.trend === "up" ? "text-chart-2" : "text-destructive")
                  }
                >
                  <TrendingUp
                    className={
                      "w-4 h-4 " + (stat.trend === "down" ? "rotate-180" : "")
                    }
                  />
                  <span>{stat.change}</span>
                </div>
              </div>

              <div>
                <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Ticket Trends</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrend}>
              <defs>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />

              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTickets)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Priority Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={"cell-" + index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Tickets</h2>

          <span className="text-sm text-muted-foreground">
            Showing latest 5 tickets
          </span>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-muted-foreground">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        to={"/tickets/" + ticket.id}
                        className="text-primary font-medium hover:underline"
                      >
                        TKT-{ticket.id}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <Link
                        to={"/tickets/" + ticket.id}
                        className="hover:text-primary hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-muted-foreground">
                      {ticket.category}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={
                          "inline-block px-2 py-1 rounded-md text-xs font-medium " +
                          getPriorityColor(ticket.priority)
                        }
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={
                          "inline-block px-2 py-1 rounded-md text-xs font-medium border " +
                          getStatusColor(ticket.status)
                        }
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={"/tickets/" + ticket.id}
                          className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        {role === "Employee" && (
                          <Link
                            to={"/tickets/edit/" + ticket.id}
                            className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Link>
                        )}

                        {(role === "Employee" || role === "Admin") && (
                          <button
                            onClick={() => openDeleteModal(ticket)}
                            className="flex items-center gap-1 px-3 py-1 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">Delete Ticket</h3>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {ticketToDelete?.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 bg-accent text-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;