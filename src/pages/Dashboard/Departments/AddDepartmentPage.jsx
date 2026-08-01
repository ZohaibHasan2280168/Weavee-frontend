import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAlert } from '../../../components/ui/AlertProvider';
import api from '../../../services/reqInterceptor';

const ALLOWED_SUBMISSION_TYPES = ["DOCUMENT", "TEXT", "IMAGE", "VIDEO"];

const initialCheckpoint = () => ({
  name: "",
  allowedSubmissionTypes: ["TEXT"],
  qcRequired: false,
  minRequiredUploads: 1,
  id: Date.now() + Math.random(),
});

const initialOperation = () => ({
  name: "",
  description: "",
  checkpoints: [initialCheckpoint()],
  id: Date.now() + Math.random() + 100,
});

const initialFormState = {
  name: "",
  description: "",
  departmentHead: "", 
  status: "ACTIVE",
  operations: [initialOperation()],
};

export default function AddDepartment() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(initialFormState);
  const [availableHeads, setAvailableHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isHeadOpen, setIsHeadOpen] = useState(false);
  const headDropdownRef = useRef(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const fetchHeads = async () => {
      try {
        const res = await api.get(`/users/available-department-heads`);
        setAvailableHeads(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch department heads", err);
      }
    };
    fetchHeads();
  }, []);

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

  const handleRootChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOperationChange = (opId, e) => {
    const newOperations = form.operations.map((op) =>
      op.id === opId ? { ...op, [e.target.name]: e.target.value } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleAddOperation = () => {
    setForm({ ...form, operations: [...form.operations, initialOperation()] });
  };

  const handleRemoveOperation = (opId) => {
    setForm({ ...form, operations: form.operations.filter((op) => op.id !== opId) });
  };

  const handleCheckpointChange = (opId, chkId, e) => {
    const { name, value, type, checked } = e.target;
    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        const newCheckpoints = op.checkpoints.map((chk) => {
          if (chk.id === chkId) {
            if (type === "checkbox") return { ...chk, [name]: checked };
            if (name === "allowedSubmissionTypes") {
              return { ...chk, allowedSubmissionTypes: value.split(',').map(s => s.trim().toUpperCase()) };
            }
            return { ...chk, [name]: value };
          }
          return chk;
        });
        return { ...op, checkpoints: newCheckpoints };
      }
      return op;
    });
    setForm({ ...form, operations: newOperations });
  };

  const handleAddCheckpoint = (opId) => {
    const newOperations = form.operations.map((op) =>
      op.id === opId ? { ...op, checkpoints: [...op.checkpoints, initialCheckpoint()] } : op
    );
    setForm({ ...form, operations: newOperations });
  };

  const handleRemoveCheckpoint = (opId, chkId) => {
    const newOperations = form.operations.map((op) => {
      if (op.id === opId) {
        return { ...op, checkpoints: op.checkpoints.filter((chk) => chk.id !== chkId) };
      }
      return op;
    });
    setForm({ ...form, operations: newOperations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.departmentHead) {
      const msg = 'Department Head is required. Please select a Department Head from the dropdown.';
      setError(msg);
      showAlert({ title: 'Validation', message: msg, type: 'error' });
      setLoading(false);
      return;
    }

    const cleanedOperations = form.operations.map(op => {
        const { id, ...opData } = op;
        opData.checkpoints = opData.checkpoints.map(chk => {
            const { id: chkId, ...chkData } = chk;
            chkData.allowedSubmissionTypes = chkData.allowedSubmissionTypes
                .filter(type => ALLOWED_SUBMISSION_TYPES.includes(type));
            return chkData;
        });
        return opData;
    }).filter(op => op.name && op.checkpoints.length > 0);

    const requestBody = {
        name: form.name,
        description: form.description,
        departmentHead: form.departmentHead || null,
        status: form.status,
        operations: cleanedOperations,
    };

    try {
      const res = await api.post(`/departments`, requestBody);

      if (res.status === 201 || res.status === 200) { 
        showAlert({ title: 'Success', message: `Department '${form.name}' created successfully!`, type: 'success' });
        navigate("/departments");
      }
    } catch (err) {
      console.error('Create department failed', err, err.response?.data);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : (err.response?.data ? JSON.stringify(err.response.data) : null));
      const displayMsg = serverMsg || `Server Error${status ? ` (HTTP ${status})` : ''}: Failed to create department. Please try again or contact support.`;
      setError(displayMsg);
      showAlert({ title: 'Error', message: displayMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions ---
  const renderCheckpointForm = (opId, chk, chkIndex) => (
    <div key={chk.id} className="p-3 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl mb-3 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="flex-1">
          <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Checkpoint Name</label>
          <input 
            type="text" 
            name="name" 
            value={chk.name} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            required 
            placeholder={`Checkpoint ${chkIndex + 1}`}
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
        <div className="sm:w-32">
          <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Min Uploads</label>
          <input 
            type="number" 
            name="minRequiredUploads" 
            value={chk.minRequiredUploads} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            min="0" 
            placeholder="1"
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="qcRequired" 
              checked={chk.qcRequired} 
              onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
            <span className="ml-2 text-xs font-medium text-slate-700 dark:text-slate-300">QC Required</span>
          </label>
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Submission Types</label>
          <input 
            type="text" 
            name="allowedSubmissionTypes" 
            value={chk.allowedSubmissionTypes.join(', ')} 
            onChange={(e) => handleCheckpointChange(opId, chk.id, e)} 
            placeholder="DOCUMENT, IMAGE, TEXT, VIDEO"
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
      </div>
    </div>
  );

  const renderOperationForm = (op, opIndex) => (
    <div key={op.id} className="p-4 bg-slate-50/50 dark:bg-[#081024] border border-slate-200 dark:border-slate-800 rounded-xl mb-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
            {opIndex + 1}
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operation: {op.name || `Unnamed`}</h3>
        </div>
        {form.operations.length > 1 && (
          <button 
            type="button" 
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            onClick={() => handleRemoveOperation(op.id)}
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Operation Name</label>
          <input 
            type="text" 
            name="name" 
            value={op.name} 
            onChange={(e) => handleOperationChange(op.id, e)} 
            required 
            placeholder={`Enter operation ${opIndex + 1} name`}
            className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
          <input 
            type="text"
            name="description" 
            value={op.description} 
            onChange={(e) => handleOperationChange(op.id, e)} 
            placeholder="Brief description of this operation"
            className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
          Checkpoints 
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{op.checkpoints.length}</span>
        </h4>
        {op.checkpoints.map((chk, chkIndex) => renderCheckpointForm(op.id, chk, chkIndex))}
        <div className="flex items-center gap-2 mt-2">
          <button 
            type="button" 
            className="text-xs font-semibold text-brand-primary hover:text-brand-secondary bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            onClick={() => handleAddCheckpoint(op.id)}
          >
            <span className="text-lg leading-none">+</span> Add Checkpoint
          </button>
          {op.checkpoints.length > 1 && (
            <button 
              type="button" 
              className="text-xs font-semibold text-slate-500 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              onClick={() => handleRemoveCheckpoint(op.id, op.checkpoints[op.checkpoints.length - 1].id)}
            >
              <span>×</span> Remove Last
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-4xl z-10 flex flex-col h-full max-h-full">
        
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
            Create Department Template
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define department workflow, operations, and checkpoints
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
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Department Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Department Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleRootChange} 
                    required 
                    placeholder="e.g., Graphic Design"
                    className="w-full rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <input 
                    type="text"
                    name="description" 
                    value={form.description} 
                    onChange={handleRootChange} 
                    required 
                    placeholder="Describe the department's purpose"
                    className="w-full rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  />
                </div>
                <div className="md:col-span-1">
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
              
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Workflow Operations
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{form.operations.length}</span>
                </h2>
                <button 
                  type="button" 
                  className="text-xs font-semibold text-brand-primary hover:text-brand-secondary bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  onClick={handleAddOperation}
                >
                  <span className="text-lg leading-none">+</span> Add Operation
                </button>
              </div>
              
              <div className="space-y-4">
                {form.operations.map((op, index) => renderOperationForm(op, index))}
              </div>
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
                    Creating...
                  </>
                ) : (
                  'Create Department Template'
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
