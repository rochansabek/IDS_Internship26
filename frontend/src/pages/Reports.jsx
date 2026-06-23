import { useEffect, useState } from "react";
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

import {
  getReportSummary,
  getTicketsByPriority,
  getTicketsByCategory,
  getTicketsByStatus,
  getMonthlyTrend,
  getAgentPerformance,
  exportExcelReport,
  exportPdfReport,
} from "../api/api";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#6b7280"];

function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);

      const [
        summaryRes,
        monthlyRes,
        priorityRes,
        categoryRes,
        statusRes,
        agentRes,
      ] = await Promise.all([
        getReportSummary(),
        getMonthlyTrend(),
        getTicketsByPriority(),
        getTicketsByCategory(),
        getTicketsByStatus(),
        getAgentPerformance(),
      ]);

      setSummary(summaryRes.data);
      setMonthlyData(monthlyRes.data);
      setPriorityData(priorityRes.data);
      setCategoryData(categoryRes.data);
      setStatusData(statusRes.data);
      setAgentPerformance(agentRes.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
    try {
      const response = await exportExcelReport();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "ticket-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel report:", error);
      alert("Failed to export Excel report.");
    }
  }

  async function handleExportPdf() {
    try {
      const response = await exportPdfReport();

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "ticket-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF report:", error);
      alert("Failed to export PDF report.");
    }
  }

  const kpiData = [
    {
      label: "Total Tickets",
      value: summary?.totalTickets ?? 0,
      change: "All",
      trend: "up",
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Open Tickets",
      value: summary?.openTickets ?? 0,
      change: "Open",
      trend: "up",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Resolved Tickets",
      value: summary?.resolvedTickets ?? 0,
      change: "Done",
      trend: "down",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Closed Tickets",
      value: summary?.closedTickets ?? 0,
      change: "Closed",
      trend: "down",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track help desk performance and ticket insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>All Time</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Monthly Ticket Trends */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Monthly Ticket Trends</h2>

        {monthlyData.length === 0 ? (
          <p className="text-muted-foreground">No monthly ticket data yet.</p>
        ) : (
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
        )}
      </div>

      {/* Status and Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Tickets by Status</h2>

          {statusData.length === 0 ? (
            <p className="text-muted-foreground">No status data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Tickets by Category</h2>

          {categoryData.length === 0 ? (
            <p className="text-muted-foreground">No category data yet.</p>
          ) : (
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
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Priority Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Tickets by Priority</h2>

        {priorityData.length === 0 ? (
          <p className="text-muted-foreground">No priority data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Agent Performance */}
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
                  Total Assigned
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium">
                  Tickets Resolved
                </th>
              </tr>
            </thead>

            <tbody>
              {agentPerformance.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="py-6 px-4 text-muted-foreground text-center"
                  >
                    No assigned tickets yet.
                  </td>
                </tr>
              ) : (
                agentPerformance.map((agent) => (
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

                    <td className="py-4 px-4">{agent.totalAssigned}</td>
                    <td className="py-4 px-4">{agent.resolved}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;