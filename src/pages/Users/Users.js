import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import { userService } from "../../services/userService";
import CustomDropdown from "../../components/CustomDropdown";
import "./Users.css";

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionProcessedRef = useRef(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    // Check if we have a valid token
    const token = localStorage.getItem("token");
    console.log("Current token:", token ? "Present" : "Missing");
    if (!token) {
      console.warn("No authentication token found. Users API may fail.");
    }
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, limit);
      console.log("Users API Response:", response);

      // Handle different possible response structures
      let userData = [];
      let paginationData = {
        page: page,
        limit: limit,
        total: 0,
        totalPages: 0,
      };

      // Check if response has the expected structure
      if (response && response.result === 0) {
        // Success response
        userData = response.payload?.users || response.payload?.user || response.payload || [];
        paginationData = {
          page: response.payload?.page || page,
          limit: response.payload?.limit || limit,
          total: response.payload?.total || response.payload?.count || userData.length,
          totalPages:
            response.payload?.totalPages ||
            response.payload?.pages ||
            Math.ceil(
              (response.payload?.total || response.payload?.count || userData.length) / limit
            ),
        };
      } else if (response && Array.isArray(response)) {
        // Direct array response
        userData = response;
        paginationData = {
          page: page,
          limit: limit,
          total: userData.length,
          totalPages: Math.ceil(userData.length / limit),
        };
      } else if (response && response.users) {
        // Response with users property
        userData = response.users;
        paginationData = {
          page: response.page || page,
          limit: response.limit || limit,
          total: response.total || response.count || userData.length,
          totalPages:
            response.totalPages ||
            response.pages ||
            Math.ceil((response.total || response.count || userData.length) / limit),
        };
      } else {
        console.warn("Unexpected response structure:", response);
        userData = [];
      }

      console.log("Processed user data:", userData);
      console.log("Processed pagination:", paginationData);

      setUsers(userData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Failed to load users. Please try again.");
      setUsers([]);
      setPagination({
        page: page,
        limit: limit,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || user.firstName || user.lastName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }
  const getFileUrl = (filename) => {
    if (!filename) return null;
    return `https://api.iamwithyouapp.com/api/v1/files/${filename}`;
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage all users in the system</p>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.photo || user.profileImage ? (
                        <img
                          src={getFileUrl(user.photo || user.profileImage)}
                          alt={user.name || user.firstName || "User"}
                        />
                      ) : (
                        <span>
                          {(user.name || user.firstName || user.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="user-name">
                      {user.name || `${user.fname || ""} ${user.lname || ""}`.trim() || user.email}
                    </span>
                  </div>
                </td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phone || user.phoneNumber || "N/A"}</td>
                <td>
                  <span
                    className={`status ${user.status || (user.isActive ? "active" : "inactive")}`}
                  >
                    {user.status || (user.isActive ? "active" : "inactive")}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleView(user)}
                      title="View Details"
                    >
                      👁
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(user)}
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user._id)}
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {users.length} of {pagination.total} users
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => fetchUsers(pagination.page - 1, pagination.limit)}
            disabled={pagination.page <= 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchUsers(pagination.page + 1, pagination.limit)}
            disabled={pagination.page >= pagination.totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchUsers(pagination.page, pagination.limit);
          }}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fname: user?.fname || user?.firstName || "",
    lname: user?.lname || user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Set initial photo preview for existing user
  useEffect(() => {
    if (user && (user.photo || user.profileImage)) {
      setPhotoPreview(
        `https://api.iamwithyouapp.com/api/v1/files/${user.photo || user.profileImage}`
      );
    }
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === "photo") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        [e.target.name]: file,
      });
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userService.updateUser(user._id, formData);
      alert("User updated successfully!");
      onSave();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{mode === "view" ? "User Details" : "Edit User"}</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {mode === "view" ? (
            <div className="user-details">
              <div className="detail-item">
                <label>Name:</label>
                <span>
                  {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email || "N/A"}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{user.phone || user.phoneNumber || "N/A"}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span className="role-badge">{user.role || "user"}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span
                  className={`status ${user.status || (user.isActive ? "active" : "inactive")}`}
                >
                  {user.status || (user.isActive ? "active" : "inactive")}
                </span>
              </div>
              {user.createdAt && (
                <div className="detail-item">
                  <label>Joined:</label>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fname">First Name</label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lname">Last Name</label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="readonly-field"
                />
                <small className="readonly-note">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
