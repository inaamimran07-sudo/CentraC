import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config';
import TeamMembers from '../components/TeamMembers';
import Categories from '../components/Categories';
import Calendar from '../components/Calendar';
import WelcomeTutorial from '../components/WelcomeTutorial';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('team');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedChart, setSelectedChart] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState('Corporation Tax Returns');
  const [modalCategory, setModalCategory] = useState('Corporation Tax Returns');
  const [showTutorial, setShowTutorial] = useState(!user.hasSeenTutorial);
  const [progressStats, setProgressStats] = useState({
    'Corporation Tax Returns': { completed: 0, completedNotSubmitted: 0, inProgress: 0, notStarted: 0 },
    'Self Assessments': { completed: 0, completedNotSubmitted: 0, inProgress: 0, notStarted: 0 }
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchProgressStats = async () => {
      try {
        const response = await axios.get(API_URL + '/api/stats/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgressStats(response.data);
      } catch (err) {
        console.error('Error fetching progress stats:', err);
      }
    };

    fetchProgressStats();
  }, [token, refreshKey]);

  const buildPieStyle = (stats) => {
    const total = stats.completed + stats.completedNotSubmitted + stats.inProgress + stats.notStarted;
    if (!total) {
      return { background: '#eaeaea' };
    }

    const completedPct = (stats.completed / total) * 100;
    const completedNotSubmittedPct = (stats.completedNotSubmitted / total) * 100;
    const inProgressPct = (stats.inProgress / total) * 100;
    const notStartedPct = (stats.notStarted / total) * 100;

    const c1 = completedPct;
    const c2 = c1 + completedNotSubmittedPct;
    const c3 = c2 + inProgressPct;

    return {
      background: `conic-gradient(
        #2ecc71 0 ${c1}%,
        #4b6cff ${c1}% ${c2}%,
        #f39c12 ${c2}% ${c3}%,
        #e74c3c ${c3}% 100%
      )`
    };
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CentraC</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <div className="profile-menu-container">
            <img 
              src="/centra-logo.svg" 
              alt="Profile" 
              className="profile-picture"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            />
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-item profile-name">{user.name}</div>
                <div className="profile-dropdown-item profile-email">{user.email}</div>
                <button onClick={logout} className="profile-dropdown-item profile-logout">Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">MAIN</div>
              <button 
                className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                👥 Team Members
              </button>
            </div>
            
            <div className="nav-section">
              <div className="nav-section-title">MANAGEMENT</div>
              <div className="sidebar-charts">
                <div className="chart-card" onClick={() => { setModalCategory(sidebarCategory); setSelectedChart(true); }}>
                  <div className="chart-title">{sidebarCategory}</div>
                  <div className="chart-pie" style={buildPieStyle(progressStats[sidebarCategory])} />
                </div>
                <div className="category-switch">
                  <button 
                    className={`category-switch-btn ${sidebarCategory === 'Corporation Tax Returns' ? 'active' : ''}`}
                    onClick={() => setSidebarCategory('Corporation Tax Returns')}
                  >
                    Corp Tax
                  </button>
                  <button 
                    className={`category-switch-btn ${sidebarCategory === 'Self Assessments' ? 'active' : ''}`}
                    onClick={() => setSidebarCategory('Self Assessments')}
                  >
                    Self Assess
                  </button>
                </div>
              </div>
              <button 
                className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                📁 Categories
              </button>
              <button 
                className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                📅 Calendar
              </button>
            </div>
          </nav>
        </div>

        <div className="main-content">
          {activeTab === 'team' && (
            <TeamMembers key={refreshKey} onRefresh={handleRefresh} isAdmin={user.isAdmin} />
          )}
          {activeTab === 'categories' && (
            <Categories key={refreshKey} onRefresh={handleRefresh} isAdmin={user.isAdmin} token={token} userId={user.id} />
          )}
          {activeTab === 'calendar' && (
            <Calendar key={refreshKey} token={token} userId={user.id} />
          )}
        </div>
      </div>

      {selectedChart && (
        <div className="chart-modal-overlay" onClick={() => setSelectedChart(null)}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <button className="chart-modal-close" onClick={() => setSelectedChart(null)}>✕</button>
            <div className="chart-modal-header">
              <select 
                className="chart-category-dropdown"
                value={modalCategory}
                onChange={(e) => setModalCategory(e.target.value)}
              >
                <option value="Corporation Tax Returns">Corporation Tax Returns</option>
                <option value="Self Assessments">Self Assessments</option>
              </select>
            </div>
            <div className="chart-modal-content">
              <div className="chart-pie-large" style={buildPieStyle(progressStats[modalCategory])} />
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#2ecc71' }}></div>
                  <div className="legend-label">Completed: {progressStats[modalCategory].completed}</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#4b6cff' }}></div>
                  <div className="legend-label">Completed Not Submitted: {progressStats[modalCategory].completedNotSubmitted}</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
                  <div className="legend-label">In Progress: {progressStats[modalCategory].inProgress}</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
                  <div className="legend-label">Not Started: {progressStats[modalCategory].notStarted}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <WelcomeTutorial 
          user={user} 
          token={token} 
          onComplete={() => setShowTutorial(false)} 
        />
      )}
    </div>
  );
}

export default Dashboard;
