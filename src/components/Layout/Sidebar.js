import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiUsers,
    FiMusic,
    FiFolder,
    FiFileText,
    FiTag,
    FiLogOut,
    FiImage,
    FiBook
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/users', icon: FiUsers, label: 'Users' },
        { path: '/categories', icon: FiFolder, label: 'Music Categories' },
        { path: '/music', icon: FiMusic, label: 'Music' },
        { path: '/background-music', icon: FiMusic, label: 'Background Music' },
        { path: '/notes-categories', icon: FiTag, label: 'Notes Categories' },
        { path: '/notes', icon: FiFileText, label: 'Notes' },
        { path: '/background', icon: FiImage, label: 'Backgrounds' },
        { path: '/color', icon: FiTag, label: 'Colors' },
        { path: '/verse', icon: FiBook, label: 'Verses' },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Music Admin</h2>
                <div className="user-info">
                    <p>Welcome, {user?.name || user?.email}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path} className={isActive ? 'active' : ''}>
                                <Link to={item.path}>
                                    <Icon className="menu-icon" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut className="menu-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
