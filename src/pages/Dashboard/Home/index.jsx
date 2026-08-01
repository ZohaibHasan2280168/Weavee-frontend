import { useNavigate } from "react-router-dom"

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex-center modern-bg">
      <div className="container">
        <div className="text-center mb-12">
          <div className="logo-badge mb-6">DarziFlow</div>
          <h1 className="main-title mb-3">Welcome to DarziFlow</h1>
          <p className="subtitle">Choose your role to get started</p>
        </div>

        <div className="button-container">
          <button onClick={() => navigate("/moderator-login")} className="role-button moderator-button">
            <div className="button-icon moderator-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="button-content">
              <h3 className="button-title">Moderator</h3>
              {/* <p className="button-description">Manage content and users</p> */}
            </div>
            <div className="button-arrow">→</div>
          </button>

          <button onClick={() => navigate("/admin-signup")} className="role-button admin-button">
            <div className="button-icon admin-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="button-content">
              <h3 className="button-title">Admin</h3>
              {/* <p className="button-description">Full system control</p> */}
            </div>
            <div className="button-arrow">→</div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        
        .flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        /* Global theme background apply kiya hai */
        .modern-bg {
          background: var(--main-bg);
          position: relative;
          overflow: hidden;
          transition: background 0.3s ease;
        }

        .modern-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          /* Dots color ko dono theme ke liye friendly banaya hai */
          background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }
        
        /* Card ko theme connect kiya hai */
        .container {
          max-width: 500px;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          border: 1px solid var(--border-light);
          box-shadow: var(--card-shadow);
          margin: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        .logo-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        
        .subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .text-center {
          text-align: center;
        }
        
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-12 { margin-bottom: 3rem; }
        
        .button-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-top: 2rem;
        }
        
        /* Enhanced role button styling with theme support */
        .role-button {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border: 2px solid var(--border-light);
          border-radius: 16px;
          background: var(--input-bg);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1rem;
          font-weight: 600;
          position: relative;
          overflow: hidden;
        }

        .role-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .role-button:hover::before {
          left: 100%;
        }

        .role-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .role-button:active {
          transform: translateY(-2px);
        }

        /* Moderator button styling */
        .moderator-button {
          border-color: var(--border-light);
        }

        .moderator-button:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }

        /* Admin button styling */
        .admin-button {
          border-color: var(--border-light);
        }

        .admin-button:hover {
          background: rgba(118, 75, 162, 0.1);
          border-color: #764ba2;
        }

        .button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .moderator-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .admin-icon {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          color: white;
        }

        .role-button:hover .button-icon {
          transform: scale(1.1);
        }

        .button-content {
          flex: 1;
          text-align: left;
        }

        .button-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          margin-bottom: 4px;
        }

        .button-description {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          font-weight: 500;
        }

        /* Arrow indicator */
        .button-arrow {
          font-size: 1.5rem;
          color: var(--text-muted);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .role-button:hover .button-arrow {
          transform: translateX(4px);
        }

        .moderator-button:hover .button-arrow { color: #667eea; }
        .admin-button:hover .button-arrow { color: #764ba2; }

        @media (max-width: 640px) {
          .container { padding: 32px 24px; max-width: 100%; }
          .main-title { font-size: 2rem; }
          .role-button { padding: 16px 20px; gap: 12px; }
          .button-icon { width: 40px; height: 40px; }
          .button-icon svg { width: 24px; height: 24px; }
        }
      `}</style>
    </div>
  )
}
