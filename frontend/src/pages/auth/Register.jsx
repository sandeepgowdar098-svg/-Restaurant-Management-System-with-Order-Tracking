import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = '';
      
      // Upload image first if exists
      if (avatar) {
        const formData = new FormData();
        formData.append('image', avatar);
        
        // We use a separate upload endpoint
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = uploadRes.data.url;
      }

      await register(name, email, password, avatarUrl);
      toast.success('Account created!');
      navigate('/join-table');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in">
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
        <h1 className="join-title">Create Account</h1>
        <p className="join-subtitle">Join DineSync to start ordering</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" value={name}
              onChange={e => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Profile Picture (Optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="avatar-preview" style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>👤</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit"
            disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
