import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.message.includes('Check server console')) {
        toast.success('Test Mode: Check your terminal for the OTP!', { duration: 6000 });
      } else {
        toast.success('OTP sent to your email!');
      }
      navigate(`/reset-password?email=${email}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in">
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
        <h1 className="join-title">Forgot Password</h1>
        <p className="join-subtitle">Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
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
