import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './components/LoginPage';
import VideoCallPage from './components/VideoCallPage';
import LandingPage from './pages/LandingPage';
import LiveSession from './pages/LiveSession';
import { SocketProvider } from './context/SocketContext';
import CallNotification from './components/CallNotification';
import CallStatusOverlay from './components/CallStatusOverlay';

/**
 * Loading Screen Component
 */
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-500 animate-pulse">Initializing SkillExchange...</p>
  </div>
);

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Public Route Component
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  console.log('App: Rendering routes...');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-background">
            <CallNotification />
            <CallStatusOverlay />
            <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/video-call/:sessionId"
              element={
                <ProtectedRoute>
                  <VideoCallPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/session/:id"
              element={
                <ProtectedRoute>
                  <LiveSession />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
