import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../../services/reqInterceptor";
import { useAlert } from '../../../components/ui/AlertProvider';
import Loader from '../../../components/ui/Loader';

export default function UpdateDepartments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: "",
    description: "",
    departmentHead: "", 
    status: "ACTIVE",
    operations: [],
  });

  const [availableHeads, setAvailableHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  
  const [isHeadOpen, setIsHeadOpen] = useState(false);
  const headDropdownRef = useRef(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headDropdownRef.current && !headDropdownRef.current.contains(e.target)) {
        setIsHeadOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeadSelect = (id) => {
    setForm((p) => ({ ...p, departmentHead: id }));
    setIsHeadOpen(false);
  };

  const handleStatusSelect = (val) => {
    setForm((p) => ({ ...p, status: val }));
    setIsStatusOpen(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setFetching(true);
      try {
        // Fetch available department heads
        const headsRes = await api.get(`/users/available-department-heads`);
        setAvailableHeads(headsRes.data.data || []);

        // Fetch department details
        const deptRes = await api.get(`/departments/${id}`);
        const d = deptRes.data.data || deptRes.data;

        setForm({
          name: d.name || "",
          description: d.description || "",
          departmentHead: (d.departmentHead && typeof d.departmentHead === 'object') 
            ? d.departmentHead._id 
            : (d.departmentHead || ""),
          status: d.status || "ACTIVE",
          operations: d.operations || [],
        });
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load department data. Please try again.";
        setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        showAlert({ 
          title: 'Error', 
          message: 'Failed to load department details', 
          type: 'error' 
        });
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, [id]);

  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.name.trim()) {
      setError("Department name is required");
      setLoading(false);
      return;
    }

    if (!form.departmentHead) {
      setError("Please select a department head");
      setLoading(false);
      return;
    }

    const requestBody = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      departmentHead: form.departmentHead
    };

    try {
      await api.put(`/departments/${id}`, requestBody);
      showAlert({ 
        title: 'Success', 
        message: `Department "${form.name}" updated successfully!`, 
        type: 'success' 
      });
      navigate("/departments");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update department";
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
      showAlert({ 
        title: 'Error', 
        message: 'Failed to update department', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader label="Loading Department Details..." />;

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-2xl z-10 flex flex-col h-full max-h-full">
        
        {/* Header */}
        <div className="flex items-center mb-4 shrink-0">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={18} />
            <span>Back to Departments</span>
          </button>
        </div>
        
        <div className="text-center mb-4 shrink-0">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-blue-500 mb-1">
            Edit Department
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update department details and settings
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4 shrink-0">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden relative flex-1 min-h-0">
          {/* Background Orbs */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 relative z-10">
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Basic Information</h3>
                
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Department Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleRootChange} 
                    required 
                    placeholder="Enter department name"
                    className="w-full rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleRootChange} 
                    rows="3" 
                    placeholder="Describe the department's purpose and responsibilities"
                    className="w-full rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Department Head</label>
                    <div className="relative" ref={headDropdownRef}>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-left"
                        onClick={() => setIsHeadOpen((s) => !s)}
                      >
                        <span className={!form.departmentHead ? 'opacity-50' : ''}>
                          {availableHeads.find(h => h._id === form.departmentHead)?.name || '-- Select Head --'}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isHeadOpen ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </button>

                      {isHeadOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden p-1 max-h-48 overflow-y-auto">
                          <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!form.departmentHead ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => handleHeadSelect('')}>-- Select Head --</button>
                          {availableHeads.map((head) => (
                            <button key={head._id} type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${form.departmentHead === head._id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => handleHeadSelect(head._id)}>
                              {head.name}{head.email ? ` (${head.email})` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <div className="relative" ref={statusDropdownRef}>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-left"
                        onClick={() => setIsStatusOpen((s) => !s)}
                      >
                        <span className={!form.status ? 'opacity-50' : ''}>
                          {form.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </button>

                      {isStatusOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden p-1">
                          <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${form.status === 'ACTIVE' ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => handleStatusSelect('ACTIVE')}>Active</button>
                          <button type="button" className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${form.status === 'INACTIVE' ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`} onClick={() => handleStatusSelect('INACTIVE')}>Inactive</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {form.operations && form.operations.length > 0 && (
                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-900 dark:text-white">Note:</strong> This department has {form.operations.length} workflow 
                    {form.operations.length === 1 ? ' operation' : ' operations'} configured.
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Operations can only be edited through the department template interface.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-primary to-blue-600 hover:from-blue-600 hover:to-brand-primary transition-all shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button 
                type="button" 
                className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                onClick={() => navigate("/departments")}
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
