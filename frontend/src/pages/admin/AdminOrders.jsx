import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    const params = filter ? { status: filter } : {};
    const res = await API.get('/orders', { params });
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      toast.success(`Order → ${status}`);
      fetchOrders();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="animate-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>All Orders</h1>

      <div className="category-tabs" style={{ marginBottom: 20 }}>
        {['', 'Pending', 'Preparing', 'Completed'].map(f => (
          <button key={f} className={`category-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {orders.map((order, i) => (
        <div key={order._id} className="glass-card" style={{ padding: 20, marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-white)' }}>Table {order.tableNumber}</span>
              <span style={{ marginLeft: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{order.totalAmount}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {order.items.map(it => `${it.name} ×${it.quantity}`).join(', ')}
          </div>
          {order.status !== 'Completed' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {order.status === 'Pending' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'Preparing')}>Start Preparing</button>}
              {order.status === 'Preparing' && <button className="btn btn-accent btn-sm" onClick={() => updateStatus(order._id, 'Completed')}>Mark Completed</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
