"use client"

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, SendHorizonal } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");

    try {
      setLoading(true);
      const BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_AZURE_BASE_URL || "";
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to send reset link.");

      setSuccess("Password reset link has been sent to your email.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      <div className="forgot-card">
        <div className="header">
          <div className="logo-circle">
            <Mail size={28} />
          </div>
          <h1 className="title">Forgot Password</h1>
          <p className="subtitle">Enter your email to reset your password</p>
        </div>

        <div className="form-wrapper">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="animated-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="input-underline"></div>
                <div className="input-icon email-icon">
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Sending..." : <>
                <SendHorizonal size={18} /> Send Reset Link
              </>}
            </button>

            <div className="forgot-password-wrapper text-center">
              <Link to="/login" className="forgot-password-link">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .forgot-bg {
          background: var(--main-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          position: relative;
          transition: background 0.3s ease;
        }

        .forgot-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 450px;
          border: 1px solid var(--border-light);
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .header { text-align: center; margin-bottom: 32px; }
        .logo-circle {
          width: 64px; height: 64px;
          background: linear-gradient(135deg,#667eea,#764ba2);
          border-radius: 50%; display:flex; align-items:center; justify-content:center;
          color:white; margin:0 auto 16px; box-shadow:0 8px 24px rgba(102,126,234,0.4);
        }
        .title { font-size:28px; font-weight:800; margin-bottom:8px; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .subtitle { font-size:14px; color: var(--text-secondary); margin:0; font-weight:500; }

        .space-y-6 { display:flex; flex-direction:column; gap:24px; }
        .input-group { position: relative; }
        .input-wrapper { position: relative; display: flex; align-items:center; }
        
        .animated-input {
          width: 100%; padding:14px 16px 14px 44px;
          border: 2px solid var(--border-light); border-radius:12px;
          font-size:16px; font-weight:500; color: var(--text-primary); background: var(--input-bg); outline:none;
          transition: all 0.3s ease;
        }
        .animated-input:focus { border-color:#667eea; background: var(--card-bg); transform:translateY(-1px); box-shadow:0 0 0 3px rgba(102,126,234,0.1), 0 8px 16px rgba(102,126,234,0.15); }
        .input-underline { position:absolute; bottom:0; left:0; height:2px; width:0; background:linear-gradient(90deg,#667eea,#764ba2); border-radius:2px; transition:width 0.3s ease; pointer-events:none; }
        .animated-input:focus ~ .input-underline { width:100%; }
        .input-icon { position:absolute; left:12px; color: var(--text-muted); display:flex; align-items:center; justify-content:center; pointer-events:none; }

        .submit-button {
          width:100%; padding:14px 24px; background:linear-gradient(135deg,#667eea,#764ba2);
          color:white; border:none; border-radius:12px; font-size:16px; font-weight:700; cursor:pointer;
          transition: all 0.3s ease; display:flex; justify-content:center; align-items:center; gap:8px;
        }
        .submit-button:disabled { opacity:0.7; cursor:not-allowed; }
        .forgot-password-wrapper { margin-top:12px; }
        .forgot-password-link { color:#764ba2; font-size:14px; font-weight:600; text-decoration:none; }
        .forgot-password-link:hover { color:#667eea; }

        .error-message { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; border-left:4px solid #ef4444; }
        .success-message { background: rgba(16, 185, 129, 0.1); color: #10b981; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; border-left:4px solid #10b981; }

        .floating-orb { position:absolute; border-radius:50%; filter:blur(40px); z-index: 0;}
        .orb-1 { width:300px; height:300px; background:rgba(102, 126, 234, 0.15); top:-100px; right:-100px; animation:float 8s ease-in-out infinite; }
        .orb-2 { width:200px; height:200px; background:rgba(118, 75, 162, 0.12); bottom:-50px; left:-50px; animation:float 10s ease-in-out infinite reverse; }
        .orb-3 { width:250px; height:250px; background:rgba(102, 126, 234, 0.1); top:50%; left:10%; animation:float 12s ease-in-out infinite; }

        @keyframes float { 0%,100%{transform:translate(0,0);}50%{transform:translate(30px,30px);} }

        @media (max-width:640px){ .forgot-card{padding:32px 24px;} .title{font-size:24px;} .logo-circle{width:56px;height:56px;} }
      `}</style>
    </div>
  );
}
