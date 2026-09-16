import { useNavigate } from "react-router-dom"
import { useAlert } from "../../../components/ui/AlertProvider"
import { FiUser, FiShield } from "react-icons/fi"

export default function RoleSelection() {
  const navigate = useNavigate()
  const { showAlert } = useAlert()

  // Handle Moderator click with an alert
  const handleModeratorClick = () => {
    showAlert({
      title: "Coming Soon",
      message: "This feature is coming soon! Moderator controls are currently under development.",
      type: "info",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-300">

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 dark:bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Central Role Selection Card */}
      <div className="relative w-full max-w-md bg-white/80 dark:bg-[#0a1128]/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 z-30">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/20 dark:border-brand-primary/30 text-brand-primary text-sm font-semibold tracking-wide mb-6 shadow-sm dark:shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            Weave
          </div>
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
            Welcome to<br />Weave
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Choose your role to get started</p>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={handleModeratorClick}
            className="flex items-center gap-4 p-4 w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl opacity-60 cursor-not-allowed transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
              <FiUser size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-700 dark:text-slate-200 font-semibold text-lg">Moderator</h3>
            </div>
            <div className="text-slate-400 dark:text-slate-500 mr-2">→</div>
          </button>

          <button
            onClick={() => navigate("/admin-signup")}
            className="flex items-center gap-4 p-4 w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-brand-primary/50 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all text-left hover:-translate-y-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md dark:shadow-lg dark:shadow-indigo-500/30">
              <FiShield size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Admin</h3>
            </div>
            <div className="text-slate-400 group-hover:text-brand-primary dark:group-hover:text-white transition-colors mr-2">→</div>
          </button>
        </div>
      </div>
    </div>
  )
}
