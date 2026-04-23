import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [timeInputs, setTimeInputs] = useState({});
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
    if (socket) socket.emit('join-kitchen');
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast('🔔 New order from Table ' + order.tableNumber, {
        style: { background: '#1a1a2e', color: '#eaeaea', border: '1px solid #6C5CE7' }
      });
      try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU').play(); } catch (e) { }
    });
    socket.on('order-updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    });
    return () => { socket.off('new-order'); socket.off('order-updated'); };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const estimatedTime = timeInputs[orderId];
      if (status === 'Preparing' && !estimatedTime) {
        return toast.error('Please enter estimated preparation time');
      }

      const res = await API.put(`/orders/${orderId}/status`, { 
        status,
        estimatedTime: status === 'Preparing' ? parseInt(estimatedTime) : undefined
      });
      
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (socket) socket.emit('order-status-update', { order: res.data });
      toast.success(`Order → ${status}`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'active') return o.status !== 'Completed';
    return o.status === filter;
  });

  // Group by table
  const grouped = {};
  filtered.forEach(o => {
    const key = o.tableNumber || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(o);
  });

  return (
    <div className="page-wrapper">
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🍳 Kitchen Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Real-time orders grouped by table</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['active', 'Pending', 'Preparing', 'Completed'].map(f => (
              <button key={f} className={`category-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'active' ? '🔥 Active' : f}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-text">No orders right now — take a break! ☕</p>
          </div>
        ) : (
          <div className="kitchen-grid">
            {Object.entries(grouped).map(([tableNum, tableOrders]) => (
              tableOrders.map((order) => (
                <div key={order._id} className={`kitchen-card ${order.status.toLowerCase()}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className="kitchen-table-num">Table {tableNum}</div>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>

                  {order.items.map((item, j) => (
                    <div key={j} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                      fontSize: '1.05rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5001${item.image}`) : ''} 
                          alt={item.name}
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-glass)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{
                        background: 'var(--bg-glass-strong)', padding: '2px 12px',
                        borderRadius: 12, fontWeight: 700, color: 'var(--accent)'
                      }}>
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}

                  {order.notes && (
                    <div style={{
                      marginTop: 12, padding: 10, background: 'rgba(253,203,110,0.1)',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--warning)'
                    }}>
                      📝 {order.notes}
                    </div>
                  )}

                  <div style={{ marginTop: 16 }}>
                    {order.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Mins" 
                            style={{ width: '80px', padding: '8px' }}
                            value={timeInputs[order._id] || ''}
                            onChange={(e) => setTimeInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mins</span>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}
                          onClick={() => updateStatus(order._id, 'Preparing')}>
                          🔥 Start Preparing
                        </button>
                      </div>
                    )}
                    {order.status === 'Preparing' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                          ⏱️ Est: {order.estimatedTime} mins
                        </div>
                        <button className="btn btn-accent" style={{ width: '100%' }}
                          onClick={() => updateStatus(order._id, 'Completed')}>
                          ✅ Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
