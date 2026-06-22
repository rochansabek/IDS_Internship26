import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Target,
} from "lucide-react";

const monthlyData = [
  { month: "Jan", tickets: 124, resolved: 98, avgTime: 4.2 },
  { month: "Feb", tickets: 142, resolved: 115, avgTime: 3.8 },
  { month: "Mar", tickets: 156, resolved: 138, avgTime: 3.5 },
  { month: "Apr", tickets: 168, resolved: 152, avgTime: 3.2 },
  { month: "May", tickets: 189, resolved: 171, avgTime: 2.9 },
  { month: "Jun", tickets: 178, resolved: 165, avgTime: 3.1 },
];

const resolutionTimeData = [
  { range: "< 1 hour", count: 45 },
  { range: "1-4 hours", count: 78 },
  { range: "4-8 hours", count: 52 },
  { range: "8-24 hours", count: 34 },
  { range: "> 24 hours", count: 21 },
];

const categoryData = [
  { name: "Authentication", value: 85, color: "#3b82f6" },
  { name: "Payment", value: 62, color: "#f59e0b" },
  { name: "Performance", value: 48, color: "#10b981" },
  { name: "Feature Request", value: 42, color: "#8b5cf6" },
  { name: "Other", value: 33, color: "#6b7280" },
];

const agentPerformance = [
  { name: "John Doe", resolved: 142, avgTime: 2.8, satisfaction: 4.8 },
  { name: "Jane Smith", resolved: 138, avgTime: 3.1, satisfaction: 4.7 },
  { name: "Mike Johnson", resolved: 125, avgTime: 3.4, satisfaction: 4.6 },
  { name: "Sarah Wilson", resolved: 118, avgTime: 3.2, satisfaction: 4.9 },
  { name: "Tom Brown", resolved: 105, avgTime: 3.6, satisfaction: 4.5 },
];

const kpiData = [
  {
    label: "Avg Resolution Time",
    value: "3.2 hrs",
    change: "-12%",
    trend: "down",
    icon: Clock,
    color: "text-green-600",
  },
  {
    label: "Customer Satisfaction",
    value: "4.7/5",
    change: "+5%",
    trend: "up",
    icon: Target,
    color: "text-blue-600",
  },
  {
    label: "First Response Time",
    value: "18 mins",
    change: "-8%",
    trend: "down",
    icon: TrendingUp,
    color: "text-orange-600",
  },
  {
    label: "Active Agents",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Users,
    color: "text-green-600",
  },
];

function Reports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track performance metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Last 30 Days</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.label}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 ${kpi.color}`} />
                <div
                  className={`text-sm ${
                    kpi.trend === "down"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {kpi.change}
                </div>
              </div>

              <div className="text-3xl font-semibold mb-1">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Ticket Trends</h2>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />

            <Area
              type="monotone"
              dataKey="tickets"
              stroke="#3b82f6"
              fill="url(#colorTickets)"
              name="Total Tickets"
            />

            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#10b981"
              fill="url(#colorResolved)"
              name="Resolved Tickets"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">
            Resolution Time Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Tickets by Category</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Agent Performance</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Agent
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Tickets Resolved
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Avg Resolution Time
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Satisfaction Score
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody>
              {agentPerformance.map((agent) => (
                <tr
                  key={agent.name}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {agent.name.charAt(0)}
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">{agent.resolved}</td>
                  <td className="py-4 px-4">{agent.avgTime} hrs</td>

                  <td className="py-4 px-4">
                    <span className="font-medium">{agent.satisfaction}</span>
                    <span className="text-muted-foreground"> /5</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width: `${(agent.satisfaction / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;