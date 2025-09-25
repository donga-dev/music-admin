import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Categories from './pages/Categories/Categories';
import Music from './pages/Music/Music';
import BackgroundMusic from './pages/BackgroundMusic/BackgroundMusic';
import NotesCategories from './pages/NotesCategories/NotesCategories';
import Notes from './pages/Notes/Notes';
import Background from './pages/Background/Background';
import Color from './pages/Color/Color';
import Verse from './pages/Verse/Verse';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/music"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Music />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/background-music"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BackgroundMusic />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes-categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotesCategories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/background"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Background />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/color"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Color />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/verse"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Verse />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;