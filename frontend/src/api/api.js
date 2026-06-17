import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5046/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ids_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =====================
// TICKETS
// =====================

export const getTickets = () => api.get("/tickets");

export const getTicket = (id) => api.get(`/tickets/${id}`);

export const createTicket = (ticket) => api.post("/tickets", ticket);

export const updateTicket = (id, ticket) => api.put(`/tickets/${id}`, ticket);

export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

// =====================
// ASSIGNMENT
// =====================

export const assignTicket = (ticketId, agentId) =>
  api.put(`/tickets/${ticketId}/assign/${agentId}`);

// =====================
// STATUS
// =====================

export const updateTicketStatus = (ticketId, status) =>
  api.put(`/tickets/${ticketId}/status/${status}`);

// =====================
// COMMENTS
// =====================

export const getTicketComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

export const addTicketComment = (ticketId, comment) =>
  api.post(`/tickets/${ticketId}/comments`, comment);

// =====================
// ACTIVITY HISTORY
// =====================

export const getTicketActivities = (ticketId) =>
  api.get(`/tickets/${ticketId}/activities`);

// =====================
// ATTACHMENTS
// =====================

export const uploadAttachment = (ticketId, formData) =>
  api.post(`/Attachments/upload?ticketId=${ticketId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAttachments = (ticketId) =>
  api.get(`/Attachments/ticket/${ticketId}`);

// =====================
// AGENTS
// =====================

export const getAgents = () => api.get("/users/agents");

// =====================
// NOTIFICATIONS
// =====================

export const getNotifications = () =>
  api.get("/Notifications");

export const getUnreadNotificationCount = () =>
  api.get("/Notifications/unread-count");

export const markNotificationAsRead = (id) =>
  api.put(`/Notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.put("/Notifications/mark-all-read");

export const archiveNotification = (id) =>
  api.put(`/Notifications/${id}/archive`);