import React, { useState, useEffect } from 'react';
import { FiUsers, FiMusic, FiFileText, FiFolder } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMusic: 0,
        totalNotes: 0,
        totalCategories: 0
    });

    useEffect(() => {
        // Simulate loading stats - in real app, fetch from API
        setStats({
            totalUsers: 150,
            totalMusic: 89,
            totalNotes: 234,
            totalCategories: 12
        });
    }, []);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: FiUsers,
            color: '#667eea',
            bgColor: '#f0f4ff'
        },
        {
            title: 'Music Tracks',
            value: stats.totalMusic,
            icon: FiMusic,
            color: '#48bb78',
            bgColor: '#f0fff4'
        },
        {
            title: 'Notes',
            value: stats.totalNotes,
            icon: FiFileText,
            color: '#ed8936',
            bgColor: '#fffbf0'
        },
        {
            title: 'Categories',
            value: stats.totalCategories,
            icon: FiFolder,
            color: '#9f7aea',
            bgColor: '#faf5ff'
        }
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome to Music Admin Panel</p>
            </div>

            <div className="stats-grid">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="stat-card"
                            style={{ backgroundColor: card.bgColor }}
                        >
                            <div className="stat-content">
                                <div className="stat-text">
                                    <h3>{card.value}</h3>
                                    <p>{card.title}</p>
                                </div>
                                <div
                                    className="stat-icon"
                                    style={{ color: card.color }}
                                >
                                    <Icon size={40} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-content">
                <div className="content-grid">
                    <div className="card">
                        <h3>Recent Activity</h3>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <FiMusic />
                                </div>
                                <div className="activity-text">
                                    <p>New music track added</p>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <FiUsers />
                                </div>
                                <div className="activity-text">
                                    <p>New user registered</p>
                                    <span>4 hours ago</span>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <FiFileText />
                                </div>
                                <div className="activity-text">
                                    <p>Note category updated</p>
                                    <span>1 day ago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <button className="action-btn">
                                <FiUsers />
                                <span>Add User</span>
                            </button>
                            <button className="action-btn">
                                <FiMusic />
                                <span>Upload Music</span>
                            </button>
                            <button className="action-btn">
                                <FiFolder />
                                <span>New Category</span>
                            </button>
                            <button className="action-btn">
                                <FiFileText />
                                <span>Create Note</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
