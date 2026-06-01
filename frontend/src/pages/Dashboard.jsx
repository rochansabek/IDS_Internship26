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
  Users,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const stats = [
  {
    label: "Open Tickets",
    value: "124",
    change: "+12%",
    trend: "up",
    icon: Ticket,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    label: "Resolved Tickets",
    value: "856",
    change: "+8%",
    trend: "up",
    icon: CheckCircle,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    label: "Pending Tickets",
    value: "43",
    change: "-5%",
    trend: "down",
    icon: Clock,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    label: "Critical Tickets",
    value: "18",
    change: "+3%",
    trend: "up",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

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

const recentTickets = [
  {
    id: "TKT-1234",
    title: "Unable to login to dashboard",
    priority: "Critical",
    status: "Open",
    customer: "Sarah Johnson",
    time: "5 mins ago",
  },
  {
    id: "TKT-1233",
    title: "Payment integration not working",
    priority: "High",
    status: "In Progress",
    customer: "Mike Chen",
    time: "23 mins ago",
  },
  {
    id: "TKT-1232",
    title: "Request for feature enhancement",
    priority: "Medium",
    status: "Open",
    customer: "Emily Davis",
    time: "1 hour ago",
  },
  {
    id: "TKT-1231",
    title: "Email notifications delayed",
    priority: "Low",
    status: "Resolved",
    customer: "James Wilson",
    time: "2 hours ago",
  },
];

function getPriorityColor(priority) {
  if (priority === "Critical") {
    return "bg-destructive text-destructive-foreground";
  }

  if (priority === "High") {
    return "bg-chart-4 text-white";
  }

  if (priority === "Medium") {
    return "bg-chart-1 text-white";
  }

  if (priority === "Low") {
    return "bg-chart-2 text-white";
  }

  return "bg-muted text-muted-foreground";
}

function getStatusColor(status) {
  if (status === "Open") {
    return "bg-chart-1/10 text-chart-1 border-chart-1/20";
  }

  if (status === "In Progress") {
    return "bg-chart-4/10 text-chart-4 border-chart-4/20";
  }

  if (status === "Resolved") {
    return "bg-chart-2/10 text-chart-2 border-chart-2/20";
  }

  return "bg-muted text-muted-foreground border-border";
}

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("ids_role") || "Employee";

  function logout() {
    localStorage.removeItem("ids_token");
    localStorage.removeItem("ids_role");
    navigate("/login");
  }

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
              to="/tickets/new"
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

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          {role === "Employee" && (
            <>
              <Link to="/tickets/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Create Ticket
              </Link>
              <Link to="/tickets/my" className="px-4 py-2 border border-border rounded-lg">
                My Tickets
              </Link>
            </>
          )}

          {role === "Agent" && (
            <>
              <Link to="/tickets/assigned" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                Assigned Tickets
              </Link>
              <Link to="/tickets" className="px-4 py-2 border border-border rounded-lg">
                Update Ticket Status
              </Link>
            </>
          )}

          {role === "Admin" && (
            <>
              <Link to="/users" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                <Users className="w-5 h-5" />
                Manage Users
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg">
                <Settings className="w-5 h-5" />
                Manage Settings
              </Link>
            </>
          )}
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

          <Link to="/tickets" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ticket ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
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
                      className="text-primary hover:underline font-medium"
                    >
                      {ticket.id}
                    </Link>
                  </td>

                  <td className="py-4 px-4">{ticket.title}</td>
                  <td className="py-4 px-4 text-muted-foreground">{ticket.customer}</td>

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

                  <td className="py-4 px-4 text-sm text-muted-foreground">{ticket.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;