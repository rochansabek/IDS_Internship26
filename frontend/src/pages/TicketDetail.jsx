import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Send,
  MoreVertical,
} from "lucide-react";
import {
  getTicket,
  updateTicketStatus,
  assignTicket,
  getTicketComments,
  addTicketComment,
  getTicketActivities,
} from "../api/api";

const statuses = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];

const getPriorityColor = (priority) => {
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
};

const getStatusColor = (status) => {
  if (status === "Open") {
    return "bg-chart-1/10 text-chart-1 border-chart-1/20";
  }

  if (status === "Assigned") {
    return "bg-primary/10 text-primary border-primary/20";
  }

  if (status === "In Progress") {
    return "bg-chart-4/10 text-chart-4 border-chart-4/20";
  }

  if (status === "Resolved") {
    return "bg-chart-2/10 text-chart-2 border-chart-2/20";
  }

  if (status === "Closed") {
    return "bg-muted text-muted-foreground border-border";
  }

  return "bg-muted text-muted-foreground border-border";
};

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

export default function TicketDetail() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("ids_role") || "Employee";

  const loadTicketData = async () => {
    try {
      const ticketResponse = await getTicket(id);
      const commentsResponse = await getTicketComments(id);
      const activitiesResponse = await getTicketActivities(id);

      setTicket(ticketResponse.data);
      setSelectedStatus(ticketResponse.data.status);
      setComments(commentsResponse.data);
      setActivities(activitiesResponse.data);
    } catch (error) {
      console.error("Failed to load ticket details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      return;
    }

    try {
      await updateTicketStatus(id, selectedStatus);
      await loadTicketData();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleResolve = async () => {
    try {
      await updateTicketStatus(id, "Resolved");
      await loadTicketData();
    } catch (error) {
      console.error("Failed to resolve ticket", error);
    }
  };

  const handleClose = async () => {
    try {
      await updateTicketStatus(id, "Closed");
      await loadTicketData();
    } catch (error) {
      console.error("Failed to close ticket", error);
    }
  };

  const handleAssign = async () => {
    if (!agentId.trim()) {
      return;
    }

    try {
      await assignTicket(id, agentId);
      setAgentId("");
      await loadTicketData();
    } catch (error) {
      console.error("Failed to assign ticket", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await addTicketComment(id, {
        userId: 0,
        message: newComment,
        isInternalNote: isInternalNote,
      });

      setNewComment("");
      setIsInternalNote(false);
      await loadTicketData();
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Ticket not found.</p>
      </div>
    );
  }

  const timeline = [
    ...activities.map((activity) => ({
      id: "activity-" + activity.id,
      type: "activity",
      user: "User " + activity.userId,
      action: activity.action,
      comment:
        activity.oldValue || activity.newValue
          ? `${activity.oldValue || ""} ${activity.newValue || ""}`
          : "",
      time: formatDate(activity.createdAt),
    })),
    ...comments.map((comment) => ({
      id: "comment-" + comment.id,
      type: "comment",
      user: "User " + comment.userId,
      action: comment.isInternalNote ? "added an internal note" : "added a comment",
      comment: comment.message,
      time: formatDate(comment.createdAt),
      isInternalNote: comment.isInternalNote,
    })),
  ];

  timeline.sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-accent rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold">{ticket.title}</h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">TKT-{ticket.id}</span>
              <span>•</span>
              <span>Created {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>

            <p className="text-muted-foreground leading-relaxed">
              {ticket.description}
            </p>

            <div className="mt-6">
              <h3 className="font-medium mb-3">Attachments</h3>

              <div className="flex items-center justify-between p-3 bg-accent border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">No attachments yet</div>
                    <div className="text-xs text-muted-foreground">
                      File upload can be added later
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Activity</h2>
            </div>

            <div className="space-y-6">
              {timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
              )}

              {timeline.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {item.user.charAt(0)}
                    </div>

                    {index < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{item.user}</span>

                      <span className="text-sm text-muted-foreground">
                        {item.action}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        • {item.time}
                      </span>

                      {item.isInternalNote && (
                        <span className="text-xs px-2 py-1 rounded-md bg-chart-4/10 text-chart-4 border border-chart-4/20">
                          Internal Note
                        </span>
                      )}
                    </div>

                    {item.comment && (
                      <div className="mt-2 p-4 bg-accent rounded-lg">
                        <p className="text-sm">{item.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  U
                </div>

                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                      />
                      Internal note
                    </label>

                    <button
                      onClick={handleAddComment}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Send className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h3 className="font-semibold mb-4">Actions</h3>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              onClick={handleStatusChange}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Update Status
            </button>

            <button
              onClick={handleResolve}
              className="w-full px-4 py-2 bg-chart-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Mark as Resolved
            </button>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Close Ticket
            </button>

            {(role === "Admin" || role === "SupportAgent") && (
              <div className="pt-4 border-t border-border space-y-2">
                <input
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="Agent ID"
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  onClick={handleAssign}
                  className="w-full px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Assign Ticket
                </button>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">Details</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Priority
                  </div>

                  <span
                    className={
                      "inline-block px-2.5 py-1 rounded-md text-xs font-medium " +
                      getPriorityColor(ticket.priority)
                    }
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Status
                  </div>

                  <span
                    className={
                      "inline-block px-2.5 py-1 rounded-md text-xs font-medium border " +
                      getStatusColor(ticket.status)
                    }
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Category
                  </div>

                  <div className="font-medium">{ticket.category}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Assigned to
                  </div>

                  <div>
                    <div className="font-medium">
                      {ticket.assignedAgentId
                        ? "Agent " + ticket.assignedAgentId
                        : "Unassigned"}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Support Agent
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Last Updated
                  </div>

                  <div className="font-medium">
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Customer Information</h3>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                U
              </div>

              <div>
                <div className="font-medium">User {ticket.id}</div>

                <div className="text-sm text-muted-foreground">
                  requester@company.com
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}