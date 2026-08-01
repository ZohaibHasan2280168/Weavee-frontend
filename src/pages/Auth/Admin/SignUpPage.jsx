import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../components/context/AuthContext";
import SignupForm from '../../../components/auth/SignupForm';
import authService from '../../../services/authService';
import { FiUserPlus } from "react-icons/fi";

export default function AdminSignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.register({ ...formData, role: "ADMIN" });
      await login({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#070e20] p-4 overflow-hidden relative font-sans">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-[28px] bg-white/95 dark:bg-[#091128]/95 border-2 border-purple-500/40 shadow-[0_0_40px_rgba(147,51,234,0.15)] backdrop-blur-xl flex flex-col justify-center relative z-10">
        
        <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-300 shadow-inner">
          <FiUserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center tracking-tight mb-1">Admin Sign Up</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-5">Create your account</p>

        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

        <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 my-4 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800/60 pb-4">
          <button className="hover:text-purple-600 dark:text-purple-400 transition-colors" onClick={() => navigate('/terms')}>Terms & Conditions</button>
          <button className="hover:text-purple-600 dark:text-purple-400 transition-colors" onClick={() => navigate('/privacy')}>Privacy Policy</button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Already have an account?{' '}
          <Link to="/admin-login" className="text-purple-600 dark:text-purple-400 hover:text-purple-600 dark:text-purple-300 font-semibold transition-colors ml-1">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
