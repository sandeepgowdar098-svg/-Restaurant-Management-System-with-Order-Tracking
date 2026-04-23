import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTable } from '../context/TableContext';
import { FiLogOut, FiShoppingCart } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentTable, cart, leaveTable } = useTable();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    leaveTable();
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🍽️ DineSync</Link>
      <div className="navbar-links">
        {user.role === 'customer' && (
          <>
            {currentTable ? (
              <>
                <Link to="/menu" className={isActive('/menu')}>Menu</Link>
                <Link to="/cart" className={isActive('/cart')} style={{ position: 'relative' }}>
                  <FiShoppingCart />
                  {cart.length > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--danger)', color: 'white',
                      borderRadius: '50%', width: 18, height: 18,
                      fontSize: '0.7rem', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>{cart.length}</span>
                  )}
                </Link>
                <Link to="/orders" className={isActive('/orders')}>Orders</Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                  Table {currentTable.tableNumber}
                </span>
              </>
            ) : (
              <Link to="/join-table" className={isActive('/join-table')}>Join Table</Link>
            )}
          </>
        )}
        {user.role === 'admin' && (
          <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
        )}
        {user.role === 'kitchen' && (
          <Link to="/kitchen" className={isActive('/kitchen')}>Kitchen</Link>
        )}
        <button onClick={handleLogout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
}
