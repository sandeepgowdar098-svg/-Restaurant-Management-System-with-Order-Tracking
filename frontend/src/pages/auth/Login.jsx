import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'kitchen') navigate('/kitchen');
      else navigate('/join-table');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'kitchen') navigate('/kitchen');
      else navigate('/join-table');
    } catch (err) {
      toast.error('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in">
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
        <h1 className="join-title">DineSync</h1>
        <p className="join-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>
                Forgot Password?
              </Link>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit"
            disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Sign-In failed')}
            theme="filled_blue"
            shape="pill"
            width="100%"
          />
        </div>
        <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign Up</Link>
        </p>
        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'left' }}>
          <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Demo Accounts:</p>
          <p>Admin: admin@restaurant.com / admin123</p>
          <p>Kitchen: kitchen@restaurant.com / kitchen123</p>
        </div>
      </div>
    </div>
  );
}
