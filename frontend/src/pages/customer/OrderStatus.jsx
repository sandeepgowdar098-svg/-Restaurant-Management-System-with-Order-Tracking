import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiClock, FiCheck, FiDownload, FiX } from 'react-icons/fi';

/* ─── Thank You Modal ─── */
function ThankYouModal({ order, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={e => e.stopPropagation()}
        style={{ textAlign: 'center', padding: '40px 32px', maxWidth: 440, position: 'relative' }}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, background: 'transparent',
          border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem'
        }}><FiX /></button>

        {/* Confetti Emojis */}
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }} className="float">🎉</div>
        
        <h2 style={{
          fontSize: '1.8rem', fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Thank You!</h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 16 }}>
          Your order for <strong style={{ color: 'var(--text-white)' }}>Table {order.tableNumber}</strong> is complete!<br/>
          We hope you enjoyed every bite. 🍽️
        </p>

        <div style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,206,201,0.15))',
          borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 20,
          border: '1px solid rgba(108,92,231,0.2)'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 4 }}>
            Total Paid
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
            ₹{order.totalAmount.toFixed(0)}
          </div>
        </div>

        <div style={{
          background: 'rgba(253, 203, 110, 0.1)', borderRadius: 'var(--radius-md)',
          padding: '14px 18px', marginBottom: 20, border: '1px solid rgba(253,203,110,0.2)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎁</span>
          <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.9rem', margin: '4px 0 0' }}>
            Use code <span style={{ 
              background: 'rgba(253,203,110,0.2)', padding: '2px 10px', borderRadius: 6, 
              fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800, fontSize: '1rem'
            }}>DINE15</span> for 15% off your next visit!
          </p>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
          ✨ Your satisfaction means the world to us.<br/>
          We look forward to serving you again soon!
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ startTime, durationMins }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startTime).getTime();
      const end = start + durationMins * 60000;
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startTime, durationMins]);

  if (timeLeft <= 0) return <span style={{ color: 'var(--success)' }}>Ready soon! 🍽️</span>;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-glass-strong)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)', marginTop: 12 }}>
      <div style={{ fontSize: '1.2rem' }}>⌛</div>
      <div>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Estimated Time Remaining</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [thankYouOrder, setThankYouOrder] = useState(null);
  const thankedOrders = useRef(new Set());
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('order-status-changed', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      
      // Show thank-you popup when order is completed
      if (updatedOrder.status === 'Completed' && !thankedOrders.current.has(updatedOrder._id)) {
        thankedOrders.current.add(updatedOrder._id);
        setThankYouOrder(updatedOrder);
        toast.success('Your order is ready! 🎉', { icon: '✅', duration: 4000 });
      } else {
        toast.success(`Order status: ${updatedOrder.status}`, { icon: '📦' });
      }
    });
    socket.on('order-updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });
    return () => {
      socket.off('order-status-changed');
      socket.off('order-updated');
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my');
      setOrders(res.data);
      // Mark already-completed orders so we don't re-trigger the popup
      res.data.forEach(o => {
        if (o.status === 'Completed') thankedOrders.current.add(o._id);
      });
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await API.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusSteps = (status) => {
    const steps = ['Pending', 'Preparing', 'Completed'];
    const currentIdx = steps.indexOf(status);
    return steps.map((step, i) => ({
      label: step,
      done: i < currentIdx,
      active: i === currentIdx
    }));
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">No orders yet</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }}
              onClick={() => navigate('/menu')}>Browse Menu</button>
          </div>
        ) : (
          orders.map((order, i) => (
            <div key={order._id} className="glass-card animate-in"
              style={{ padding: 24, marginBottom: 16, animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-white)', marginTop: 4 }}>
                    Table {order.tableNumber}
                  </div>
                </div>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              </div>

              {/* Timeline */}
              <div className="timeline">
                {getStatusSteps(order.status).map((step, si) => (
                  <div key={si} style={{ display: 'contents' }}>
                    <div className={`timeline-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                      <div className="timeline-dot">
                        {step.done || (step.active && step.label === 'Completed') ? <FiCheck /> : step.active ? (step.label === 'Preparing' ? '🔥' : <FiClock />) : ''}
                      </div>
                      <span className="timeline-label">{step.label}</span>
                    </div>
                    {si < 2 && <div className={`timeline-line ${step.done ? 'done' : ''}`} />}
                  </div>
                ))}
              </div>

              {/* Countdown Timer or Success Message */}
              {order.status === 'Preparing' && order.estimatedTime > 0 && (
                <CountdownTimer 
                  startTime={order.preparationStartTime} 
                  durationMins={order.estimatedTime} 
                />
              )}
              {order.status === 'Completed' && (
                <div style={{ padding: '12px 20px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiCheck /> Hope you enjoyed your meal!
                </div>
              )}

              {/* Items */}
              <div style={{ marginTop: 16 }}>
                {order.items.map((item, j) => (
                  <div key={j} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid var(--border)',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--text-white)', fontSize: '1.1rem' }}>₹{order.totalAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {order.status === 'Completed' && (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => downloadInvoice(order._id)}>
                      <FiDownload /> Invoice
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/feedback/${order._id}`)}>
                      ⭐ Review
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thank You Modal */}
      {thankYouOrder && (
        <ThankYouModal order={thankYouOrder} onClose={() => setThankYouOrder(null)} />
      )}
    </div>
  );
}
