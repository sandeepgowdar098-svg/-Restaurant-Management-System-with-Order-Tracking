import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Feedback() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await API.post('/feedback', { orderId, rating, comment });
      toast.success('Thank you for your feedback! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
    setLoading(false);
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in" style={{ maxWidth: 500 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⭐</div>
        <h1 className="join-title">Rate Your Experience</h1>
        <p className="join-subtitle">We'd love to hear your feedback!</p>

        <form onSubmit={handleSubmit}>
          <div className="stars" style={{ justifyContent: 'center', margin: '24px 0' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${star <= (hover || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Quick Review</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['Delicious Food 😋', 'Fast Service ⚡', 'Friendly Staff 😊', 'Great Vibe ✨', 'Value for Money 💰'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setComment(prev => prev ? `${prev}, ${tag}` : tag)}
                  style={{ fontSize: '0.75rem' }}
                >
                  + {tag}
                </button>
              ))}
            </div>
            <label className="form-label">Your Comment (optional)</label>
            <textarea className="form-textarea" value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4} />
          </div>

          <button className="btn btn-primary btn-lg" type="submit"
            disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
