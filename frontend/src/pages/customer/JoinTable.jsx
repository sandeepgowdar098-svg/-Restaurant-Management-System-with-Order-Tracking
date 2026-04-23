import { useState, useEffect, useRef } from 'react';
import { useTable } from '../../context/TableContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUsers, FiCamera, FiType, FiX } from 'react-icons/fi';
import { Html5Qrcode } from 'html5-qrcode';

export default function JoinTable() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('code'); // 'code' or 'scan'
  const [scannerReady, setScannerReady] = useState(false);
  const { joinTable, currentTable } = useTable();
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  // If already at a table, redirect
  if (currentTable) {
    navigate('/menu');
    return null;
  }

  // Extract table code from a scanned QR URL like: http://host/join?code=ABC123
  const extractCode = (text) => {
    try {
      const url = new URL(text);
      const codeParam = url.searchParams.get('code');
      if (codeParam) return codeParam.toUpperCase();
    } catch {
      // Not a URL — treat raw text as code
    }
    return text.trim().toUpperCase();
  };

  const handleJoinWithCode = async (tableCode) => {
    if (!tableCode) return toast.error('No code found');
    setLoading(true);
    try {
      const table = await joinTable(tableCode);
      toast.success(`Joined Table ${table.tableNumber}! 🎉`);
      navigate('/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join table');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleJoinWithCode(code.trim());
  };

  // Start QR scanner
  useEffect(() => {
    if (mode !== 'scan') return;

    let html5Qrcode;
    const startScanner = async () => {
      try {
        html5Qrcode = new Html5Qrcode('qr-reader');
        scannerInstanceRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // On successful scan
            const tableCode = extractCode(decodedText);
            html5Qrcode.stop().then(() => {
              scannerInstanceRef.current = null;
              setScannerReady(false);
              setCode(tableCode);
              setMode('code');
              handleJoinWithCode(tableCode);
            }).catch(() => {});
          },
          () => {} // Ignore scan errors (no QR in frame)
        );
        setScannerReady(true);
      } catch (err) {
        console.error('Scanner error:', err);
        toast.error('Could not access camera. Please allow camera permissions or enter the code manually.');
        setMode('code');
      }
    };

    // Small delay to ensure DOM element is rendered
    const timer = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timer);
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().then(() => {
          scannerInstanceRef.current = null;
          setScannerReady(false);
        }).catch(() => {});
      }
    };
  }, [mode]);

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().then(() => {
        scannerInstanceRef.current = null;
        setScannerReady(false);
        setMode('code');
      }).catch(() => { setMode('code'); });
    } else {
      setMode('code');
    }
  };

  return (
    <div className="join-container">
      <div className="join-box animate-in" style={{ maxWidth: 480 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📱</div>
        <h1 className="join-title">Join a Table</h1>
        <p className="join-subtitle">Enter the table code or scan the QR code at your table</p>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24,
          background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)',
          padding: 4, border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => { stopScanner(); setMode('code'); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
              border: 'none', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'var(--transition)',
              background: mode === 'code' ? 'var(--primary)' : 'transparent',
              color: mode === 'code' ? 'white' : 'var(--text-muted)',
            }}
          >
            <FiType size={16} /> Enter Code
          </button>
          <button
            onClick={() => setMode('scan')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
              border: 'none', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'var(--transition)',
              background: mode === 'scan' ? 'var(--primary)' : 'transparent',
              color: mode === 'scan' ? 'white' : 'var(--text-muted)',
            }}
          >
            <FiCamera size={16} /> Scan QR
          </button>
        </div>

        {/* ─── Code Input Mode ─── */}
        {mode === 'code' && (
          <form onSubmit={handleSubmit} className="animate-in">
            <input
              className="join-input"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="TABLE CODE"
              maxLength={8}
              autoFocus
            />
            <button className="btn btn-accent btn-lg" type="submit"
              disabled={loading} style={{ width: '100%', marginTop: 20 }}>
              <FiUsers />
              {loading ? 'Joining...' : 'Join Table'}
            </button>
          </form>
        )}

        {/* ─── QR Scanner Mode ─── */}
        {mode === 'scan' && (
          <div className="animate-in">
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '2px solid var(--primary)',
              background: '#000',
            }}>
              {/* Scanner viewport */}
              <div id="qr-reader" style={{ width: '100%' }} />

              {/* Scanning overlay animation */}
              {scannerReady && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 220, height: 220,
                    border: '2px solid rgba(0, 206, 201, 0.5)',
                    borderRadius: 12,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Scanning line */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                      animation: 'scanLine 2s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              )}

              {/* Close scanner button */}
              <button
                onClick={stopScanner}
                style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 10,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <p style={{
              marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              {scannerReady
                ? '📷 Point your camera at the QR code on your table'
                : '⏳ Starting camera...'}
            </p>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <div className="pulse" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  Joining table...
                </div>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--text-secondary)' }}>How it works:</strong>{' '}
            {mode === 'scan'
              ? 'Point your phone camera at the QR code printed on your table. The code will be scanned automatically and you\'ll join the table instantly!'
              : 'Ask your waiter for the table code or use "Scan QR" to scan it with your camera. Everyone at the same table shares one cart — add items together and place a single order!'}
          </p>
        </div>
      </div>

      {/* Scanning animation keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        #qr-reader video {
          border-radius: var(--radius-md) !important;
        }
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          min-height: 250px;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
