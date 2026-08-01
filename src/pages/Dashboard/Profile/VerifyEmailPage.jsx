import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from '../../../utils/constants';
import { useAlert } from '../../../components/ui/AlertProvider';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {

    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data.message);
        showAlert({ title: 'Verification', message: res.data.message, type: 'success' });

        setTimeout(() => {
          navigate("/admin-login");
        }, 3000);
      } catch (err) {
        const errMsg = err.response?.data?.message || "Verification failed. Invalid or expired token.";
        setStatus("error");
        setMessage(errMsg);
        showAlert({ title: 'Verification Failed', message: errMsg, type: 'error' });
      }
    };

    verifyEmail();
  }, [token, navigate, showAlert]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        {status === "loading" && <p className="loading-text">Verifying your email...</p>}
        {status === "success" && <p className="success">{message}</p>}
        {status === "error" && <p className="error">{message}</p>}
      </div>

      <style jsx>{`
        .verify-page {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: var(--main-bg);
          color: var(--text-primary);
          transition: background 0.3s ease;
        }
        .verify-card {
          background: var(--card-bg);
          padding: 40px 30px;
          border-radius: 16px;
          border: 1px solid var(--border-light);
          box-shadow: var(--card-shadow);
          text-align: center;
          font-size: 16px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .loading-text { color: var(--text-primary); font-weight: 500; }
        .success { color: #10b981; font-weight: 600; }
        .error { color: #ef4444; font-weight: 600; }
      `}</style>
    </div>
  );
}
