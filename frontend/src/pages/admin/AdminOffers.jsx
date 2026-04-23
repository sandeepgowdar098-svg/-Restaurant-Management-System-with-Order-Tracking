import { useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSend, FiMail, FiGift, FiTag, FiType } from 'react-icons/fi';

export default function AdminOffers() {
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendAll = async (e) => {
    e.preventDefault();
    if (!offerTitle || !offerDescription || !discountCode) {
      return toast.error('Please fill in all required fields');
    }
    setSending(true);
    setResult(null);
    try {
      const res = await API.post('/offers/send', {
        offerTitle, offerDescription, discountCode, subject
      });
      setResult(res.data);
      toast.success(`Offer sent to ${res.data.success} customers! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send offers');
    }
    setSending(false);
  };

  return (
    <div className="animate-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>📧 Send Offers</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Send promotional emails to all registered customers
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiGift style={{ color: 'var(--accent)' }} /> Create Offer
          </h3>
          <form onSubmit={handleSendAll}>
            <div className="form-group">
              <label className="form-label"><FiType size={14} style={{ marginRight: 6 }} />Offer Title *</label>
              <input className="form-input" value={offerTitle}
                onChange={e => setOfferTitle(e.target.value)}
                placeholder="e.g. 20% Off This Weekend!" required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiMail size={14} style={{ marginRight: 6 }} />Email Subject (optional)</label>
              <input className="form-input" value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. 🎉 Special Offer from DineSync!" />
            </div>
            <div className="form-group">
              <label className="form-label">Offer Description *</label>
              <textarea className="form-textarea" value={offerDescription}
                onChange={e => setOfferDescription(e.target.value)}
                placeholder="e.g. Enjoy flat 20% off on all main course dishes this weekend. Valid on dine-in only." required
                rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label"><FiTag size={14} style={{ marginRight: 6 }} />Discount Code *</label>
              <input className="form-input" value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="e.g. WEEKEND20" required
                style={{ fontFamily: 'monospace', letterSpacing: 3, fontWeight: 700 }} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit"
              disabled={sending} style={{ width: '100%', marginTop: 8 }}>
              {sending ? (
                <><span className="pulse">Sending...</span></>
              ) : (
                <><FiSend /> Send to All Customers</>
              )}
            </button>
          </form>
        </div>

        {/* Preview & Result */}
        <div>
          {/* Live Preview */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
            <h3 style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: 16 }}>📱 Preview</h3>
            <div style={{
              background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
              padding: 24, border: '1px solid var(--border)', textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🍽️</div>
              <div style={{
                fontSize: '1.1rem', fontWeight: 700, marginBottom: 4,
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>DineSync</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>A Special Offer Just For You!</div>
              
              <div style={{ textAlign: 'left', marginBottom: 16 }}>
                <div style={{ color: 'var(--text-white)', fontWeight: 600, marginBottom: 8 }}>Hey Food Lover! 👋</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  We miss you at DineSync! Come back and taste our amazing food.
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,206,201,0.15))',
                borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
                border: '1px solid rgba(108,92,231,0.2)'
              }}>
                <div style={{ color: 'var(--primary-light)', fontWeight: 700, marginBottom: 4 }}>
                  🎉 {offerTitle || 'Your Offer Title'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 12 }}>
                  {offerDescription || 'Your offer description will appear here...'}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(253,203,110,0.15)', border: '1px dashed var(--warning)',
                  color: 'var(--warning)', padding: '8px 20px', borderRadius: 8,
                  fontFamily: 'monospace', fontWeight: 800, letterSpacing: 3, fontSize: '1.1rem'
                }}>
                  {discountCode || 'CODE'}
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="glass-card animate-in" style={{ padding: 20 }}>
              <h3 style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: 12 }}>📊 Send Result</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>{result.total}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,184,148,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{result.success}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent ✅</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(225,112,85,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{result.failed}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed ❌</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
