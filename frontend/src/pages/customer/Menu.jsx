import { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { useTable } from '../../context/TableContext';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiVolume2, FiVolumeX } from 'react-icons/fi';

const CATEGORIES = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];
const BASE = 'http://localhost:5001';
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNGE0YTVhIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCI+8J+NvTwvdGV4dD48L3N2Zz4=';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const { addToCart, currentTable } = useTable();

  useEffect(() => {
    fetchItems();
  }, [category, search]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const fetchItems = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await API.get('/menu', { params });
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load menu');
    }
  };

  const handleAdd = (item) => {
    if (!currentTable) return toast.error('Join a table first!');
    addToCart(item);
    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
  };

  const handleSpeak = useCallback((item) => {
    const synth = window.speechSynthesis;

    // If already speaking this item, stop it
    if (speakingId === item._id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const text = `${item.name}. ${item.description || ''}. Category: ${item.category || 'General'}. Price: ${item.price} rupees.${!item.isAvailable ? ' This item is currently unavailable.' : ''}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeakingId(item._id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    synth.speak(utterance);
  }, [speakingId]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Our Menu</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Browse & add items — tap 🔊 to hear about any dish
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 44 }}
            placeholder="Search dishes..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <p className="empty-state-text">No items found</p>
          </div>
        ) : (
          <div className="menu-grid">
            {items.map((item, i) => (
              <div key={item._id} className="menu-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    className="menu-card-img"
                    src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE}${item.image}`) : PLACEHOLDER}
                    alt={item.name}
                    onError={e => { e.target.src = PLACEHOLDER; }}
                  />
                  {/* Speak Button — top-right corner of the image */}
                  <button
                    className={`btn-speak ${speakingId === item._id ? 'speaking' : ''}`}
                    onClick={() => handleSpeak(item)}
                    title={speakingId === item._id ? 'Stop speaking' : 'Hear about this dish'}
                  >
                    {speakingId === item._id ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                  </button>
                </div>
                <div className="menu-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div className="menu-card-name">{item.name}</div>
                      <div className="menu-card-desc">{item.description}</div>
                    </div>
                  </div>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">₹{item.price}</span>
                    <button className="btn btn-accent btn-sm" onClick={() => handleAdd(item)}
                      disabled={!item.isAvailable}>
                      <FiPlus /> {item.isAvailable ? 'Add' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
