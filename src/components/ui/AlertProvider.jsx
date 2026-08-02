import { createContext, useContext, useState, useCallback} from 'react';

const AlertContext = createContext();

let idCounter = 1;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const _sanitizeMessage = useCallback((raw) => {
    if (raw === undefined || raw === null) return '';
    let s = raw;
    if (typeof s === 'object') {
      try { s = JSON.stringify(s); } catch(e) { s = String(s); }
    }
    s = String(s);
     s = s.replace(/https?:\/\/[^\s)]+/g, '');
    s = s.replace(/localhost(?::\d+)?/g, '');
    s = s.replace(/http:\/\//g, '').replace(/https:\/\//g, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (!s) return 'Server returned an error';
    if (s.length > 300) s = s.slice(0, 300) + '...';
    return s;
  }, []);

  const showAlert = useCallback(({ title = 'Notice', message = '', type = 'info', duration }) => {
    const defaultDuration = duration !== undefined ? duration : (type === 'success' ? 4000 : (type === 'error' ? 7000 : 5000));
    const id = idCounter++;
    const cleaned = _sanitizeMessage(message);
    setAlerts(prev => [...prev, { id, title, message: cleaned, type, duration: defaultDuration }]);
    if (defaultDuration !== 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, defaultDuration);
    }
    return id;
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alerts }}>
      {children}
      <div className="alert-root" aria-live="polite">
        {alerts.map(a => (
          <div key={a.id} className={`alert-toast ${a.type}`} role="status" aria-live="polite" style={{ '--duration': `${a.duration}ms` }}>
            <div className="alert-left">
              <span className="alert-icon" aria-hidden>
                {a.type === 'success' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : a.type === 'error' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </span>
            </div>
            <div className="alert-content">
              <div className="alert-header">
                <strong className="alert-title">{a.title}</strong>
                <button className="alert-close" onClick={() => hideAlert(a.id)} aria-label="Close">✕</button>
              </div>
              {a.message && <div className="alert-body">{a.message}</div>}
              <div className="alert-progress" aria-hidden><i /></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .alert-root {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
          align-items: center;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .alert-toast {
          pointer-events: auto;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--card-bg);
          color: var(--text-primary);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-left: 4px solid var(--border-light);
          animation: toastIn 200ms cubic-bezier(.2,.9,.2,1) both;
          transform-origin: top right;
          max-width: 420px;
          min-width: 280px;
          width: 100%;
          overflow: hidden;
        }

        .alert-toast.success { border-left-color: #10b981; }
        .alert-toast.error { border-left-color: #ef4444; }
        .alert-toast.info { border-left-color: #60a5fa; }

        .alert-left { display:flex; align-items:center; }
        .alert-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:10px; background: rgba(255,255,255,0.02); flex-shrink:0; }
        .alert-toast.success .alert-icon { background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,197,94,0.04)); }
        .alert-toast.error .alert-icon { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(244,63,94,0.02)); }
        .alert-toast.info .alert-icon { background: linear-gradient(135deg, rgba(96,165,250,0.08), rgba(59,130,246,0.02)); }

        .alert-content { flex:1 1 auto; min-width:0; }
        .alert-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .alert-title { font-weight:700; color:var(--text-primary); font-size:0.96rem; }
        .alert-body { margin-top:6px; color:var(--text-secondary); font-size:0.92rem; line-height:1.3; max-height:6em; overflow:auto; word-break:break-word; }
        .alert-close { background:transparent; border:none; color:var(--text-muted); font-size:16px; cursor:pointer; padding:4px; margin-left:8px; }

        .alert-progress { height:4px; margin-top:8px; background: var(--border-light); border-radius:4px; overflow:hidden; }
        .alert-progress i { display:block; height:100%; background: var(--text-muted); transform-origin:left; animation: progress var(--duration) linear forwards; }
        @keyframes progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }

        /* Small screens: make toasts full width with comfortable margins */
        @media (max-width: 640px) {
          .alert-root { top: 12px; left: 12px; right: 12px; transform: none; align-items: center; }
          .alert-toast { min-width: 0; width: calc(100% - 24px); padding: 10px; border-radius: 10px; }
          .alert-icon { width:32px; height:32px; border-radius:8px; }
        }
      `}</style>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}

export default AlertProvider;
