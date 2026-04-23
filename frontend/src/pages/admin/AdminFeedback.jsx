import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AdminFeedback() {
  const [data, setData] = useState({ feedback: [], averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    API.get('/feedback').then(res => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div className="animate-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>Customer Feedback</h1>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">⭐ {data.averageRating}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{data.totalReviews}</div>
        </div>
      </div>

      {data.feedback.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <p className="empty-state-text">No feedback yet</p>
        </div>
      ) : (
        data.feedback.map((fb, i) => (
          <div key={fb._id} className="glass-card" style={{ padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{fb.user?.name || 'Anonymous'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Table {fb.order?.tableNumber} • {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ color: 'var(--warning)', fontSize: '1.1rem' }}>
                {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
              </div>
            </div>
            {fb.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{fb.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}
