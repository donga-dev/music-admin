import React from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";
import { useAuth } from "../../context/AuthContext";
import { FiLogOut, FiUser } from "react-icons/fi";

const Layout = ({ children }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="main-header">
          <div className="header-content">
            <div className="user-profile">
              <FiUser className="user-icon" />
              <span className="user-name">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <FiLogOut className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
