import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../../components/ui/AlertProvider';
import { FiEdit3, FiArrowLeft, FiSave } from "react-icons/fi";
import api from '../../../../services/reqInterceptor';

export default function OperationEdit() {
  const params = useParams();
  const { opId } = params;
  const deptId = params.deptId || localStorage.getItem('currentDeptId');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    const loadOperation = async () => {
      const dept = deptId || localStorage.getItem('currentDeptId');
      if (!dept) return; // rely on localStorage fallback
      try {
        const res = await api.get(`/departments/${dept}`);
        const department = res.data.data || res.data;
        const op = department.operations.find(o => o._id.toString() === opId);
        if (!op) return;
        setForm({ name: op.name || "", description: op.description || "" });
      } catch (err) {
        console.error('Failed to load operation data', err);
      }
    };

    loadOperation();
  }, [opId, deptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!deptId) {
        showAlert({ title: 'Missing Context', message: 'Missing department context. Please open the department first.', type: 'error' });
        setLoading(false);
        return;
      }

      const url = `/departments/${deptId}/operations/${opId}`;
      await api.put(url, form);
      showAlert({ title: 'Success', message: 'Operation updated!', type: 'success' });
      navigate(-1);
    } catch (err) {
      console.error('OperationEdit error', err);
      const status = err.response?.status;
      let serverMessage = err.response?.data?.message || err.response?.data || err.message || 'Update failed';
      if (typeof serverMessage === 'object') {
        try { serverMessage = JSON.stringify(serverMessage); } catch(e) { serverMessage = String(serverMessage); }
      }
      showAlert({ title: 'Error', message: `Update failed${status ? ` (HTTP ${status})` : ''}: ${serverMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      <div className="w-full max-w-lg z-10 flex flex-col h-full max-h-full justify-center">
        
        <div className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="p-5 sm:p-6 flex flex-col relative z-10">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors mb-2 w-fit"
            >
              <FiArrowLeft /> Back
            </button>
            
            <div className="text-center mb-4 flex flex-col items-center">
              <div className="w-10 h-10 mb-2 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <FiEdit3 size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Edit Operation</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Modify operation details and workflow name</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operation Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md shadow-orange-500/25 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? "Saving..." : <><FiSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
