import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiMusic,
  FiFileText,
  FiFolder,
  FiUserPlus,
  FiUpload,
  FiPlusCircle,
  FiEdit3,
} from "react-icons/fi";
import { dashboardService } from "../../services/dashboardService";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMusic: 0,
    totalNotes: 0,
    totalCategories: 0,
    totalNotesCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDataCount();
      console.log("Dashboard API Response:", response);

      // Handle different possible response structures
      let statsData = {
        totalUsers: 0,
        totalMusic: 0,
        totalNotes: 0,
        totalCategories: 0,
        totalNotesCategories: 0,
      };

      if (response && response.result === 1) {
        // Success response structure - API returns result: 1 for success
        const payload = response.payload || {};
        statsData = {
          totalUsers: payload.usersCount || 0,
          totalMusic: payload.musicCount || 0,
          totalNotes: payload.verseCount || 0, // Using verseCount as notes
          totalNotesCategories: payload.noteCategoryCount || 0, // Using noteCategoryCount as notes categories
          totalCategories: payload.musicCategoryCount || 0, // Using musicCategoryCount as categories
        };
      } else if (response && typeof response === "object") {
        // Direct object response (fallback)
        statsData = {
          totalUsers: response.usersCount || response.users || response.totalUsers || 0,
          totalMusic: response.musicCount || response.music || response.totalMusic || 0,
          totalNotes: response.verseCount || response.notes || response.totalNotes || 0,
          totalNotesCategories: response.noteCategoryCount || 0,
          totalCategories:
            response.musicCategoryCount || response.categories || response.totalCategories || 0,
        };
      } else {
        console.warn("Unexpected response structure:", response);
      }

      console.log("Processed stats data:", statsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      console.error("Error details:", error.response?.data || error.message);
      // Keep default values (0) on error
      setStats({
        totalUsers: 0,
        totalMusic: 0,
        totalNotes: 0,
        totalNotesCategories: 0,
        totalCategories: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Navigation functions for Quick Actions
  const handleAddUser = () => {
    navigate("/users?action=add");
  };

  const handleUploadMusic = () => {
    navigate("/music?action=add");
  };

  const handleNewCategory = () => {
    navigate("/categories?action=add");
  };

  const handleCreateNote = () => {
    navigate("/notes?action=add");
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "#667eea",
      bgColor: "#f0f4ff",
    },
    {
      title: "Music Tracks",
      value: stats.totalMusic,
      icon: FiMusic,
      color: "#48bb78",
      bgColor: "#f0fff4",
    },
    {
      title: "Verses",
      value: stats.totalNotes,
      icon: FiFileText,
      color: "#ed8936",
      bgColor: "#fffbf0",
    },
    {
      title: "Music Categories",
      value: stats.totalCategories,
      icon: FiFolder,
      color: "#9f7aea",
      bgColor: "#faf5ff",
    },
    {
      title: "Notes Categories",
      value: stats.totalNotesCategories,
      icon: FiFolder,
      color: "#9f7aea",
      bgColor: "#faf5ff",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to IAM Music Admin Panel</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard statistics...</p>
        </div>
      ) : (
        <>
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
              {/* <div className="card">
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
              </div> */}

              <div className="quick-actions-section">
                <h3 className="quick-actions-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                  <div
                    className="quick-action-card"
                    onClick={handleAddUser}
                  >
                    <div className="quick-action-icon user-icon">
                      <FiUserPlus />
                    </div>
                    <span className="quick-action-label">Add User</span>
                  </div>
                  <div
                    className="quick-action-card"
                    onClick={handleUploadMusic}
                  >
                    <div className="quick-action-icon music-icon">
                      <FiUpload />
                    </div>
                    <span className="quick-action-label">Upload Music</span>
                  </div>
                  <div
                    className="quick-action-card"
                    onClick={handleNewCategory}
                  >
                    <div className="quick-action-icon category-icon">
                      <FiPlusCircle />
                    </div>
                    <span className="quick-action-label">New Category</span>
                  </div>
                  <div
                    className="quick-action-card"
                    onClick={handleCreateNote}
                  >
                    <div className="quick-action-icon note-icon">
                      <FiEdit3 />
                    </div>
                    <span className="quick-action-label">Create Note</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
