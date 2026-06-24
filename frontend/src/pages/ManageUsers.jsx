import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  Shield,
  User,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "../api/api";

function getRoleBadge(role) {
  if (role === "Admin") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }

  return "bg-chart-1/10 text-chart-1 border-chart-1/20";
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch {
      alert("Could not load users.");
    }
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("Employee");
    setSelectedUser(null);
  }

  function openAddModal() {
    resetForm();
    setShowAddModal(true);
  }

  function closeAddModal() {
    resetForm();
    setShowAddModal(false);
  }

  function openEditModal(user) {
    setSelectedUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setShowEditModal(true);
  }

  function closeEditModal() {
    resetForm();
    setShowEditModal(false);
  }

  function openDeleteModal(user) {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setUserToDelete(null);
    setShowDeleteModal(false);
  }

  async function handleAddUser(e) {
    e.preventDefault();

    try {
      await createUser({
        fullName,
        email,
        password,
        role,
      });

      closeAddModal();
      loadUsers();
    } catch (error) {
      alert(error.response?.data || "Could not create user.");
    }
  }

  async function handleEditUser(e) {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        fullName,
        email,
        role,
      });

      closeEditModal();
      loadUsers();
    } catch (error) {
      alert(error.response?.data || "Could not update user.");
    }
  }

  async function confirmDeleteUser() {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      closeDeleteModal();
    } catch {
      alert("Could not delete user.");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = `${user.fullName} ${user.email} ${user.role}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">
            View, add, edit, and manage Help Desk system users.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>

                      <span className="font-medium">{user.fullName}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-muted-foreground">
                    {user.email}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border " +
                        getRoleBadge(user.role)
                      }
                    >
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="flex items-center gap-1 px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(user)}
                        className="flex items-center gap-1 px-3 py-1 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 px-4 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Add User</h3>

              <button
                onClick={closeAddModal}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <input
                type="password"
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit User</h3>

              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">Delete User</h3>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {userToDelete?.fullName}
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
                onClick={confirmDeleteUser}
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

export default ManageUsers;