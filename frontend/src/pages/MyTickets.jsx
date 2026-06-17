import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { getTickets, deleteTicket } from "../api/api";

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

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default function MyTickets() {
  const role = localStorage.getItem("ids_role") || "Employee";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  async function confirmDelete() {
    if (!ticketToDelete) return;

    try {
      setIsDeleting(true);
      await deleteTicket(ticketToDelete.id);
      setTickets(tickets.filter((ticket) => ticket.id !== ticketToDelete.id));
      setTicketToDelete(null);
    } catch (error) {
      alert("Could not delete ticket.");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      ticket.title?.toLowerCase().includes(query) ||
      String(ticket.id).toLowerCase().includes(query) ||
      ticket.category?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "all" || ticket.category === selectedCategory;

    const matchesPriority =
      selectedPriority === "all" || ticket.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const categories = [...new Set(tickets.map((ticket) => ticket.category).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My Tickets</h1>
          <p className="text-muted-foreground mt-1">
            View, search, and manage all support tickets
          </p>
        </div>

        {role === "Employee" && (
          <Link
            to="/tickets/create"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </Link>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-11 pr-4 py-2.5 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <Filter className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tickets found matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Ticket ID
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Priority
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Assigned To
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Updated
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        TKT-{ticket.id}
                      </Link>
                    </td>

                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground">
                      {ticket.category}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={
                          "inline-block px-2.5 py-1 rounded-md text-xs font-medium " +
                          getPriorityColor(ticket.priority)
                        }
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={
                          "inline-block px-2.5 py-1 rounded-md text-xs font-medium border " +
                          getStatusColor(ticket.status)
                        }
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground">
                      {ticket.assignedAgentId
                        ? "Agent " + ticket.assignedAgentId
                        : "Unassigned"}
                    </td>

                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDate(ticket.updatedAt || ticket.createdAt)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        {role === "Employee" && (
                          <Link
                            to={`/tickets/edit/${ticket.id}`}
                            className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Link>
                        )}

                        {(role === "Employee" || role === "Admin") && (
                          <button
                            onClick={() => setTicketToDelete(ticket)}
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

            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </div>
            </div>
          </div>
        )}
      </div>

      {ticketToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">Delete Ticket</h3>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {ticketToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
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