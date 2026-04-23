import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [newNum, setNewNum] = useState('');

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    const res = await API.get('/tables');
    setTables(res.data);
  };

  const createTable = async () => {
    if (!newNum) return;
    try {
      await API.post('/tables', { tableNumber: parseInt(newNum) });
      toast.success('Table created!');
      setNewNum('');
      fetchTables();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const resetTable = async (id) => {
    try {
      await API.post(`/tables/${id}/reset`);
      toast.success('Table reset');
      fetchTables();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="animate-in">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>Tables & QR Codes</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input className="form-input" style={{ maxWidth: 200 }} type="number" value={newNum}
          onChange={e => setNewNum(e.target.value)} placeholder="Table number" />
        <button className="btn btn-primary" onClick={createTable}><FiPlus /> Add Table</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {tables.map(table => (
          <div key={table._id} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-white)', marginBottom: 4 }}>
              Table {table.tableNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Capacity: {table.capacity} • {table.isActive ? '🟢 Active' : '⚪ Inactive'}
            </div>

            <div className="qr-container" style={{ margin: '0 auto', maxWidth: 180 }}>
              <QRCodeSVG
                value={`${window.location.origin}/join?code=${table.tableCode}`}
                size={140}
                level="H"
                includeMargin={true}
              />
              <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, letterSpacing: 3, color: '#333' }}>
                {table.tableCode}
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {table.currentUsers?.length || 0} users connected
            </div>

            <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }}
              onClick={() => resetTable(table._id)}>
              <FiRefreshCw size={12} /> Reset
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
