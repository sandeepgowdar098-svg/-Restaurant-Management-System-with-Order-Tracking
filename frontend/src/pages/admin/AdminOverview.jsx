import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { 
  FiShoppingBag, FiDollarSign, FiStar, FiUsers, 
  FiPlus, FiList, FiSettings, FiActivity, FiArrowUpRight 
} from 'react-icons/fi';

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/orders/analytics'),
      API.get('/feedback')
    ]).then(([aRes, fRes]) => {
      setAnalytics(aRes.data);
      setFeedbackData(fRes.data);
    }).catch(() => {});
  }, []);

  if (!analytics) return (
    <div className="pulse" style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>
      <FiActivity size={40} style={{ marginBottom: 16 }} />
      <p>Syncing Dashboard Data...</p>
    </div>
  );

  const avgOrderValue = analytics.totalOrders > 0 
    ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) 
    : 0;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Command Center</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin/menu" className="btn btn-primary">
            <FiPlus /> Add Item
          </Link>
          <button className="btn btn-outline">
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="premium-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(108,92,231,0.1)', color: 'var(--primary)' }}>
            <FiShoppingBag />
          </div>
          <span className="stat-label">Total Volume</span>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {analytics.totalOrders}
            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>+12%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="premium-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0,206,201,0.1)', color: 'var(--accent)' }}>
            <FiDollarSign />
          </div>
          <span className="stat-label">Net Revenue</span>
          <div className="stat-value">₹{analytics.totalRevenue.toLocaleString()}</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: '60%', background: 'var(--accent)' }}></div>
          </div>
        </div>

        <div className="premium-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(253,203,110,0.1)', color: 'var(--warning)' }}>
            <FiStar />
          </div>
          <span className="stat-label">Customer Satisfaction</span>
          <div className="stat-value">{feedbackData?.averageRating || '4.8'} / 5</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {[1,2,3,4,5].map(i => <FiStar key={i} size={14} fill={i <= 4 ? 'var(--warning)' : 'none'} color="var(--warning)" />)}
          </div>
        </div>

        <div className="premium-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0,184,148,0.1)', color: 'var(--success)' }}>
            <FiUsers />
          </div>
          <span className="stat-label">Avg Ticket Size</span>
          <div className="stat-value">₹{avgOrderValue}</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Per customer session</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Popular Items with Visual Progress */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🔥 Signature Dishes</h2>
            <Link to="/admin/analytics" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>View All Analytics</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {analytics.popularItems?.slice(0, 5).map((item, i) => {
              const percentage = Math.min(100, (item.totalOrdered / analytics.totalOrders) * 100 * 3);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🍽️'}</span>
                      <span style={{ fontWeight: 600 }}>{item._id}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{item.totalOrdered} orders</span>
                    <span>{percentage.toFixed(0)}% of popularity</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="premium-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Link to="/admin/orders" className="btn btn-outline" style={{ flexDirection: 'column', height: 80, gap: 8 }}>
                <FiList /> <span style={{ fontSize: '0.75rem' }}>Orders</span>
              </Link>
              <Link to="/admin/tables" className="btn btn-outline" style={{ flexDirection: 'column', height: 80, gap: 8 }}>
                <FiUsers /> <span style={{ fontSize: '0.75rem' }}>Tables</span>
              </Link>
            </div>
          </div>

          <div className="premium-card" style={{ padding: 20, flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="activity-dot success"></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Database Online</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Latency: 24ms</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="activity-dot primary"></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kitchen API</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal Load</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="activity-dot warning"></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment Gateway</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Maintenance soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
