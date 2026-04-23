import { useState } from 'react';
import { useTable } from '../../context/TableContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

const BASE = 'http://localhost:5001';

export default function SharedCart() {
  const { cart, cartTotal, currentTable, updateCartItem, removeFromCart, setCart } = useTable();
  const { socket } = useSocket();
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty!');
    setPlacing(true);
    try {
      const res = await API.post('/orders', {
        tableId: currentTable._id,
        notes
      });

      // Notify kitchen via socket
      if (socket) {
        socket.emit('order-placed', { order: res.data });
      }

      setCart([]);
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setPlacing(false);
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
            Shared Cart
            {currentTable && (
              <span style={{ fontSize: '1rem', color: 'var(--accent)', marginLeft: 12 }}>
                Table {currentTable.tableNumber}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Everyone at your table sees this cart in real-time
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p className="empty-state-text">Your shared cart is empty</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }}
              onClick={() => navigate('/menu')}>Browse Menu</button>
          </div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={item.menuItem || i} className="cart-item animate-in"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <img className="cart-item-img"
                  src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE}${item.image}`) : ''}
                  alt={item.name}
                  onError={e => { e.target.style.display = 'none'; }} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} each</div>
                </div>
                <div className="cart-qty-controls">
                  <button className="cart-qty-btn"
                    onClick={() => updateCartItem(item.menuItem?.toString() || item.menuItem, item.quantity - 1)}>
                    <FiMinus />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="cart-qty-btn"
                    onClick={() => updateCartItem(item.menuItem?.toString() || item.menuItem, item.quantity + 1)}>
                    <FiPlus />
                  </button>
                  <button className="cart-qty-btn" style={{ color: 'var(--danger)' }}
                    onClick={() => removeFromCart(item.menuItem?.toString() || item.menuItem)}>
                    <FiTrash2 />
                  </button>
                </div>
                <div style={{ fontWeight: 700, minWidth: 70, textAlign: 'right', color: 'var(--accent)' }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Special Instructions</label>
              <textarea className="form-textarea" value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any allergies or preferences..." />
            </div>

            {/* Total & Place Order */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 24, marginTop: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  ₹{cartTotal.toFixed(0)}
                </span>
              </div>
              <button className="btn btn-accent btn-lg" style={{ width: '100%' }}
                onClick={handlePlaceOrder} disabled={placing}>
                <FiShoppingBag />
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
