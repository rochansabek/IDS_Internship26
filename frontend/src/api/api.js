import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ids_token");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

// Ticket APIs

export const getTickets = () => api.get("/tickets");

export const getTicket = (id) =>
  api.get(`/tickets/${id}`);

export const createTicket = (ticket) =>
  api.post("/tickets", ticket);

export const updateTicket = (id, ticket) =>
  api.put(`/tickets/${id}`, ticket);