import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../../components/auth/LoginForm';
import authService from "../../../services/authService";

export default function ModeratorLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    setIsLoading(true);
    setError('');
    try {
      const userData = await authService.login({ email, password });
      if (userData.user.role !== "ADMIN" && userData.user.role !== "MODERATOR") {
        setError("Access denied: Only moderators and admins can login here.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center moderator-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="login-title">Moderator Login</h2>
            <p className="login-subtitle">Access your moderator dashboard</p>
          </div>

          <div className="form-wrapper">
            {error && <div className="error-message" role="alert">{error}</div>}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </div>

          <div className="login-footer"></div>
        </div>
      </div>

      <style jsx>{`
        .moderator-page-wrapper {
          background: transparent !important;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 10;
        }
        .login-container { width: 100%; max-width: 480px; padding: 20px; z-index: 11; }
        .login-card {
          background: rgba(15, 23, 42, 0.4) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 22px; padding: 44px 36px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: var(--card-shadow);
        }
        .logo-circle {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 12px;
        }
        .login-title {
          font-size: 26px; font-weight: 800; text-align: center;
          background: linear-gradient(135deg,#667eea,#764ba2);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .login-subtitle { text-align: center; color: var(--text-secondary); font-size: 14px; margin-bottom: 16px; }
        .error-message { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 8px; margin-bottom: 14px; border-left: 4px solid #ef4444; }
        .login-footer { text-align: center; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--border-light); }
      `}</style>
    </div>
  );
}
