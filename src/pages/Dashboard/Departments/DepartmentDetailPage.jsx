import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../components/ui/AlertProvider';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { 
  FiEdit, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, 
  FiCheckCircle, FiUser, FiActivity, FiArrowLeft } from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';


export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // States
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOps, setExpandedOps] = useState({});


  const fetchDeptDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/departments/${id}`);
      setDept(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load department details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeptDetails();
  }, [fetchDeptDetails]);

  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const _sanitizeMessage = (raw) => {
    if (raw === undefined || raw === null) return '';
    let s = raw;
    if (typeof s === 'object') {
      try { s = JSON.stringify(s); } catch(e) { s = String(s); }
    }
    s = String(s);
    s = s.replace(/https?:\/\/[^\s)]+/g, '');
    s = s.replace(/localhost(?::\d+)?/g, '');
    s = s.replace(/http:\/\//g, '').replace(/https:\/\//g, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (!s) return 'Are you sure?';
    if (s.length > 300) s = s.slice(0, 300) + '...';
    return s;
  };  

  const showConfirm = (title, message, onConfirm) => {
    setConfirmState({ open: true, title, message: _sanitizeMessage(message), onConfirm });
  };

  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null });

  const handleDeleteDept = () => {
    showConfirm('Delete Department', 'Are you sure? This will delete the entire department!', async () => {
      try {
        await api.delete(`/departments/${id}`);

        showAlert({ title: 'Deleted', message: 'Department deleted successfully', type: 'success' });
        closeConfirm();
        navigate("/departments");
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting department', type: 'error' });
      }
    });
  };

  const handleDeleteOperation = (opId) => {
    showConfirm('Delete Operation', 'Are you sure you want to delete this operation?', async () => {
      try {
        await api.delete(`/departments/${id}/operations/${opId}`);

        closeConfirm();
        showAlert({ title: 'Deleted', message: 'Operation removed', type: 'success' });
        fetchDeptDetails();
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting operation', type: 'error' });
      }
    });
  };

  const handleDeleteCheckpoint = (opId, chkId) => {
    showConfirm('Delete Checkpoint', 'Are you sure you want to delete this checkpoint?', async () => {
      try {
        await api.delete(`/departments/${id}/operations/${opId}/checkpoints/${chkId}`);
        closeConfirm();
        showAlert({ title: 'Deleted', message: 'Checkpoint removed', type: 'success' });
        fetchDeptDetails();
      } catch (err) {
        closeConfirm();
        showAlert({ title: 'Error', message: 'Error deleting checkpoint', type: 'error' });
      }
    });
  };

  const saveContextInStorage = (deptId, opId) => {
    try {
      localStorage.setItem('currentDeptId', deptId);
      localStorage.setItem('currentOpId', opId);
    } catch (e) { /* ignore write errors */ }
  };

  const toggleExpand = (opId) => {
    setExpandedOps(prev => {
      const next = !prev[opId];
      if (next) saveContextInStorage(id, opId);
      return { ...prev, [opId]: next };
    });
  };

if (loading) return <Loader label="Loading Department Details..." />;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  if (!dept) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* --- SEGMENT 1: DEPARTMENT --- */}
        <section className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary font-semibold text-sm mb-6 transition-colors">
            <FiArrowLeft /> Back to Departments
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-blue-500 mb-2">{dept.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-3xl leading-relaxed">{dept.description || "No description provided."}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => navigate(`/update-department/${id}`)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl font-semibold transition-all">
                <FiEdit /> Edit
              </button>
              <button onClick={handleDeleteDept} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl font-semibold transition-all">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <FiUser size={20} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Head</label>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {dept.departmentHead ? dept.departmentHead.name : "Not Assigned"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <FiActivity size={20} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  (dept.status || 'INACTIVE').toUpperCase() === 'ACTIVE'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${(dept.status || 'INACTIVE').toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {(dept.status || 'INACTIVE').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SEGMENT 2: OPERATIONS --- */}
        <section className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Operations</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage the steps required for this department's workflow</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-semibold shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => navigate(`/departments/${id}/add-operation`)}>
              <FiPlus /> Add Operation
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {dept.operations?.length === 0 && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <FiActivity size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No operations found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">This department doesn't have any workflow operations yet. Add one to get started.</p>
              </div>
            )}
            
            <div className="space-y-4">
              {dept.operations?.map((op, index) => (
                <div key={op._id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(op._id)}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${expandedOps[op._id] ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm'}`}>
                        {expandedOps[op._id] ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Step {index + 1}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{op.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button className="p-2 text-slate-500 hover:text-brand-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-primary/30 rounded-lg shadow-sm transition-all" title="Edit Operation" onClick={() => { saveContextInStorage(id, op._id); navigate(`/edit-operation/${op._id}`); }}><FiEdit size={16} /></button>
                      <button className="p-2 text-slate-500 hover:text-rose-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shadow-sm transition-all" title="Delete Operation" onClick={() => handleDeleteOperation(op._id)}><FiTrash2 size={16} /></button>
                    </div>
                  </div>

                  {/* --- SEGMENT 3: CHECKPOINTS (Nested) --- */}
                  {expandedOps[op._id] && (
                    <div className="bg-white dark:bg-[#081024] p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          Checkpoints
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{op.checkpoints?.length || 0}</span>
                        </h4>
                        <button className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-secondary bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors" onClick={() => { saveContextInStorage(id, op._id); navigate(`/departments/${id}/operations/${op._id}/add-checkpoint`); }}>
                          <span className="text-lg leading-none">+</span> New Checkpoint
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {op.checkpoints?.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">No checkpoints added to this operation yet.</p>
                        ) : (
                          op.checkpoints?.map((chk) => (
                            <div key={chk._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-brand-primary/30 transition-colors group">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="mt-0.5 sm:mt-0 text-brand-primary">
                                  <FiCheckCircle size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{chk.name}</p>
                                  <div className="flex flex-wrap gap-2 mt-1.5">
                                    {chk.allowedSubmissionTypes?.map(type => (
                                      <span key={type} className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {type}
                                      </span>
                                    ))}
                                    {chk.qcRequired && (
                                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                                        QC REQ
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" onClick={() => { saveContextInStorage(id, op._id); navigate(`/departments/${id}/operations/${op._id}/edit-checkpoint/${chk._id}`); }}><FiEdit size={14} /></button>
                                <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={() => handleDeleteCheckpoint(op._id, chk._id)}><FiTrash2 size={14} /></button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={closeConfirm}
        onConfirm={() => { if (typeof confirmState.onConfirm === 'function') confirmState.onConfirm(); }}
      />
    </div>
  );
}
