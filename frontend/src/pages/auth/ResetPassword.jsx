import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email, otp, password });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in">
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
        <h1 className="join-title">Reset Password</h1>
        <p className="join-subtitle">Enter the OTP sent to <b>{email}</b></p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">6-Digit OTP</label>
            <input
              className="form-input"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ letterSpacing: '8px', fontSize: '1.4rem', textAlign: 'center' }}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ marginTop: 24 }}>
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.9rem' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
