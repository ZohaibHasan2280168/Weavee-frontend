import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';

export default function UpdateUser() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { showAlert } = useAlert();

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
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        const user = res.data.user;

        if (user) {
          setForm({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "",
          });
        } else {
          throw new Error(res.data?.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const roles = [
    { label: 'Moderator', value: 'MODERATOR' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Department Head', value: 'DEPARTMENT_HEAD' },
    { label: 'QC Member', value: 'QC_MEMBER' },
    { label: 'Client', value: 'CLIENT' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.put(`/users/${id}`, { name: form.name, email: form.email, role: form.role });

      if (res.status === 200) {
        showAlert({ title: 'Success', message: 'User updated successfully!', type: 'success' });
        navigate(-1);
      } else {
        throw new Error(res.data?.message || "Failed to update user");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-blue-500 mb-1">
            Update User
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Modify user details below</p>
        </div>

        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6 text-red-600 dark:text-red-400 relative z-10">
              <span className="text-xl">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Role</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-left"
                >
                  <span className={!form.role ? "opacity-50" : ""}>
                    {form.role ? roles.find((r) => r.value === form.role)?.label : "Select Role"}
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

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-primary to-blue-600 hover:from-blue-600 hover:to-brand-primary transition-all shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                onClick={() => navigate(-1)}
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
