import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
export default function BackButton({ label = "Back", onClick, to, className = "" }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <button 
      type="button" 
      className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold text-sm cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 ${className}`} 
      onClick={handleClick}
    >
      <FiArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}
