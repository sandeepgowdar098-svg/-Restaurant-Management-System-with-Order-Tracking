import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const CATEGORIES = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
const BASE = 'http://localhost:5001';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Appetizers', isAvailable: true });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await API.get('/menu');
    setItems(res.data);
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: 'Appetizers', isAvailable: true }); setImageFile(null); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, description: item.description, price: item.price, category: item.category, isAvailable: item.isAvailable }); setImageFile(null); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('isAvailable', form.isAvailable);
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editing) {
        await API.put(`/menu/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item updated!');
      } else {
        await API.post('/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Item created!');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await API.delete(`/menu/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Menu Management</h1>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Item</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Image', 'Name', 'Category', 'Price', 'Available', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 12 }}>
                  <img
                    src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE}${item.image}`) : ''}
                    alt={item.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-glass)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </td>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.description?.slice(0, 50)}</div>
                </td>
                <td style={{ padding: 12 }}><span className="badge badge-preparing">{item.category}</span></td>
                <td style={{ padding: 12, fontWeight: 700, color: 'var(--accent)' }}>₹{item.price}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ color: item.isAvailable ? 'var(--success)' : 'var(--danger)' }}>{item.isAvailable ? '✓ Yes' : '✗ No'}</span>
                </td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-icon" onClick={() => openEdit(item)}><FiEdit2 size={14} /></button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item._id)}><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">{editing ? 'Edit Item' : 'Add Item'}</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Price (₹)</label><input className="form-input" type="number" step="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Image</label><input className="form-input" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} id="avail" />
                <label htmlFor="avail" className="form-label" style={{ margin: 0 }}>Available</label>
              </div>
              <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }}>
                {editing ? 'Update Item' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
