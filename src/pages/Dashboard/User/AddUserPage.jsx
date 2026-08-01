import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/reqInterceptor";

export default function AddUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (roleValue) => {
    setForm((prev) => ({ ...prev, role: roleValue }));
    setIsRoleOpen(false);
    setError("");
  };
  
  const navigate = useNavigate();

  const roles = [
    { label: "Moderator", value: "MODERATOR" },
    { label: "Admin", value: "ADMIN" },
    { label: "QC Member", value: "QC_MEMBER" },
    { label: "Department Head", value: "DEPARTMENT_HEAD" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.role) {
      setError("Please select a role.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { name, email, role } = form;
      const res = await api.post("/users/create", { name, email, role });

      if (res.status === 201) {
        setSuccess(true);
        setForm({ name: "", email: "", role: "" });

        if (res.data.tempPassword) {
          alert(`Temporary password for user: ${res.data.tempPassword}`);
        }

        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-blue-500 mb-1">
            Add New User
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Create a new team member account</p>
        </div>

        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-600 dark:text-emerald-400 relative z-10">
              <span className="text-xl font-bold">✓</span>
              <div>
                <p className="font-semibold text-sm">User Created Successfully!</p>
                <p className="text-xs opacity-90 mt-1">Redirecting back...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 relative z-10">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-sm">Error</p>
                <p className="text-xs opacity-90 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-3" autoComplete="off">
            <div>
              <label htmlFor="name" className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="w-full rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className="w-full rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-left"
                >
                  <span className={!form.role ? "opacity-50" : ""}>
                    {form.role ? roles.find((r) => r.value === form.role)?.label : "Select a role"}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </button>
                
                {isRoleOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => handleRoleSelect(r.value)}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                            form.role === r.value 
                            ? 'bg-brand-primary/10 text-brand-primary font-medium' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {r.label}
                          {form.role === r.value && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-primary to-blue-600 hover:from-blue-600 hover:to-brand-primary transition-all shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
