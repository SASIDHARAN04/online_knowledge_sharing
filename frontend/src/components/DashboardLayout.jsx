import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileCard from './ProfileCard';
import TeachCourses from './TeachCourses';
import LearningCourses from './LearningCourses';
import MutualExchange from './MutualExchange';
import PointsWallet from './PointsWallet';
import RequestsPanel from './RequestsPanel';
import './DashboardLayout.css';

/**
 * DashboardLayout Component
 * Main dashboard container with sidebar navigation
 * Renders all dashboard sections
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'teaching', label: 'Teaching', icon: '📚' },
    { id: 'learning', label: 'Learning', icon: '🎓' },
    { id: 'exchange', label: 'Exchange', icon: '🤝' },
    { id: 'wallet', label: 'Points Wallet', icon: '💰' },
    { id: 'requests', label: 'Requests', icon: '📬' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileCard />;
      case 'teaching':
        return <TeachCourses />;
      case 'learning':
        return <LearningCourses />;
      case 'exchange':
        return <MutualExchange />;
      case 'wallet':
        return <PointsWallet />;
      case 'requests':
        return <RequestsPanel />;
      default:
        return <ProfileCard />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Knowledge Hub</h2>
          <p className="user-name">Welcome, {user?.username}</p>
        </div>
        
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>{sections.find(s => s.id === activeSection)?.label}</h1>
        </div>
        <div className="content-body">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
