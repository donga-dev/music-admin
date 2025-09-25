import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import { userService } from '../../services/userService';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await userService.getUsers(page, limit);
            console.log('Users API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));

            // Handle different possible response structures
            let userData = [];
            let paginationData = {
                page: page,
                limit: limit,
                total: 0,
                totalPages: 0
            };

            console.log('Full response structure:', JSON.stringify(response, null, 2));

            if (response.payload && response.payload.users && Array.isArray(response.payload.users)) {
                console.log('Using response.payload.users');
                userData = response.payload.users;
                // Extract pagination info if available
                if (response.payload.pagination) {
                    paginationData = {
                        page: response.payload.pagination.page || page,
                        limit: response.payload.pagination.limit || limit,
                        total: response.payload.pagination.total || userData.length,
                        totalPages: response.payload.pagination.totalPages || Math.ceil(userData.length / limit)
                    };
                }
            } else if (response.users && Array.isArray(response.users)) {
                console.log('Using response.users');
                userData = response.users;
            } else if (Array.isArray(response)) {
                console.log('Using response as array');
                userData = response;
            } else if (response.data && Array.isArray(response.data)) {
                console.log('Using response.data');
                userData = response.data;
            } else {
                console.log('No matching response structure found');
                console.log('Available keys:', Object.keys(response || {}));
                userData = [];
            }

            console.log('Final userData:', userData);
            console.log('userData length:', userData.length);
            console.log('Pagination info:', paginationData);

            setUsers(userData);
            setPagination(paginationData);
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error details:', error.response?.data || error.message);
            alert('Failed to load users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || user.firstName || user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleView = (user) => {
        setSelectedUser(user);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(userId);
                setUsers(users.filter(user => user._id !== userId));
                alert('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user. This feature may not be available yet.');
            }
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setModalMode('add');
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    return (
        <div className="users-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>User Management</h1>
                    <p>Manage all users in the system</p>
                </div>
                <button className="add-btn" onClick={handleAdd}>
                    <FiPlus />
                    Add User
                </button>
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
                                                <img src={user.photo || user.profileImage} alt={user.name || user.firstName || 'User'} />
                                            ) : (
                                                <span>{(user.name || user.firstName || user.email || 'U').charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className="user-name">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}</span>
                                    </div>
                                </td>
                                <td>{user.email || 'N/A'}</td>
                                <td>{user.phone || user.phoneNumber || 'N/A'}</td>
                                <td>
                                    <span className={`status ${user.status || (user.isActive ? 'active' : 'inactive')}`}>
                                        {user.status || (user.isActive ? 'active' : 'inactive')}
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
                                            <FiEye />
                                        </button>
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEdit(user)}
                                            title="Edit User"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(user._id)}
                                            title="Delete User"
                                        >
                                            <FiTrash2 />
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
        name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
        email: user?.email || '',
        phone: user?.phone || user?.phoneNumber || '',
        status: user?.status || (user?.isActive ? 'active' : 'inactive')
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (mode === 'add') {
                await userService.createUser(formData);
                alert('User created successfully!');
            } else if (mode === 'edit') {
                await userService.updateUser(user._id, formData);
                alert('User updated successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user. This feature may not be fully implemented yet.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>
                        {mode === 'view' ? 'User Details' :
                            mode === 'edit' ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {mode === 'view' ? (
                        <div className="user-details">
                            <div className="detail-item">
                                <label>Name:</label>
                                <span>{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{user.email || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Phone:</label>
                                <span>{user.phone || user.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Status:</label>
                                <span className={`status ${user.status || (user.isActive ? 'active' : 'inactive')}`}>
                                    {user.status || (user.isActive ? 'active' : 'inactive')}
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
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
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
                                    onChange={handleChange}
                                    required
                                />
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

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')}
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
