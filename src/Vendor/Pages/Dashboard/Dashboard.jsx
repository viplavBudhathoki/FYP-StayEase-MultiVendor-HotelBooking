import { useState } from 'react';
import { BedDouble, Users, CheckCircle, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupied: 0,
    maintenance: 0,
    revenue: 0,
  });

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupied / stats.totalRooms) * 100) : 0;
  const availableRooms = stats.totalRooms - stats.occupied - stats.maintenance;

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Welcome Back, Manager</h1>
          <p>Here's what's happening today at your properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon icon-blue"><BedDouble size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Rooms</span>
            <span className="stat-value">{stats.totalRooms}</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon icon-green"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Current Guests</span>
            <span className="stat-value">{stats.occupied}</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon icon-orange"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Occupancy Rate</span>
            <span className="stat-value">{occupancyRate}%</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon icon-purple"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Daily Revenue</span>
            <span className="stat-value">${stats.revenue}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Recent Activity */}
        <div className="recent-activity card">
          <h3>Recent Booking Activity</h3>
          <div className="activity-list">
            <div className="activity-empty">
              <p>No recent activity found. Start by adding rooms and bookings.</p>
            </div>
          </div>
        </div>

        {/* Room Status Distribution */}
        <div className="quick-stats card">
          <h3>Room Status Distribution</h3>
          <div className="activity-empty">
            <p>Add rooms to see status distribution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
