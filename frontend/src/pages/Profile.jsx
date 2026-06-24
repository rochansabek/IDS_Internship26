import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Building,
  MapPin,
  Phone,
  Lock,
  Save,
  Camera,
} from "lucide-react";
import {
  getUserById,
  updateUserProfile,
  changeUserPassword,
} from "../api/api";

function Profile() {
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("ids_userId");

  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");

  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Employee",
    company: "IDS",
    location: "",
    phone: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  function showModal(title, message) {
    setModal({
      show: true,
      title,
      message,
    });
  }

  function closeModal() {
    setModal({
      show: false,
      title: "",
      message: "",
    });
  }

  async function loadProfile() {
    try {
      const response = await getUserById(userId);
      const user = response.data;

      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "Employee",
        company: user.company || "IDS",
        location: user.location || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });

      setAvatarUrl(user.avatarUrl || "");
    } catch {
      showModal("Profile Error", "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    if (!name || name.trim() === "") return "U";

    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleProfileSave(e) {
    e.preventDefault();

    try {
      await updateUserProfile(userId, {
        ...formData,
        avatarUrl,
      });

      localStorage.setItem("ids_name", formData.fullName);
      localStorage.setItem("ids_email", formData.email);
      localStorage.setItem("ids_role", formData.role);

      showModal("Profile Updated", "Your profile was updated successfully.");
    } catch (error) {
      showModal(
        "Profile Error",
        error.response?.data || "Could not update profile."
      );
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showModal("Password Error", "New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showModal("Password Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      await changeUserPassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showModal("Password Updated", "Your password was changed successfully.");
    } catch (error) {
      showModal(
        "Password Error",
        error.response?.data || "Could not change password."
      );
    }
  }

  const stats = [
    { label: "Tickets Created", value: "5" },
    { label: "Open Tickets", value: "5" },
    { label: "Resolved Tickets", value: "0" },
    { label: "Role", value: formData.role },
  ];

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-semibold overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(formData.fullName)
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-1">
              {formData.fullName}
            </h2>
            <p className="text-muted-foreground mb-4">{formData.role}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Change Avatar
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              icon={User}
              value={formData.fullName}
              onChange={(value) =>
                setFormData({ ...formData, fullName: value })
              }
            />

            <InputField
              label="Email"
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
            />

            <InputField
              label="Company"
              icon={Building}
              value={formData.company}
              onChange={(value) =>
                setFormData({ ...formData, company: value })
              }
            />

            <InputField
              label="Location"
              icon={MapPin}
              value={formData.location}
              onChange={(value) =>
                setFormData({ ...formData, location: value })
              }
            />

            <InputField
              label="Phone"
              icon={Phone}
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="Current Password"
              icon={Lock}
              type="password"
              value={passwordData.currentPassword}
              onChange={(value) =>
                setPasswordData({ ...passwordData, currentPassword: value })
              }
            />

            <InputField
              label="New Password"
              icon={Lock}
              type="password"
              value={passwordData.newPassword}
              onChange={(value) =>
                setPasswordData({ ...passwordData, newPassword: value })
              }
            />

            <InputField
              label="Confirm Password"
              icon={Lock}
              type="password"
              value={passwordData.confirmPassword}
              onChange={(value) =>
                setPasswordData({ ...passwordData, confirmPassword: value })
              }
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Lock className="w-5 h-5" />
            Update Password
          </button>
        </form>
      </div>

      {modal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">{modal.title}</h3>

            <p className="text-muted-foreground mb-6">{modal.message}</p>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, icon: Icon, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}

export default Profile;