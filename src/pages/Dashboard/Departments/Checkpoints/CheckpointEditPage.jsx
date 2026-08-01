import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from '../../../../components/ui/AlertProvider';
import { FiEdit, FiArrowLeft, FiSave } from "react-icons/fi";
import api from '../../../../services/reqInterceptor';

export default function CheckpointEdit() {
  const params = useParams();
  const { chkId } = params;
  const deptId = params.deptId || localStorage.getItem('currentDeptId');
  const opId = params.opId || localStorage.getItem('currentOpId');
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    allowedSubmissionTypes: [],
    minRequiredUploads: 0,
    isOptional: false,
    qcRequired: false
  });

  const subTypes = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"];

  useEffect(() => {
    const loadCheckpoint = async () => {
      if (!deptId) return; 
      try {
        const res = await api.get(`/departments/${deptId}`);
        const department = res.data.data || res.data;
        const operation = department.operations.find(op => op._id.toString() === opId);
        if (!operation) return;
        const chk = operation.checkpoints.find(c => c._id.toString() === chkId);
        if (!chk) return;
        setForm({
          name: chk.name || "",
          description: chk.description || "",
          allowedSubmissionTypes: chk.allowedSubmissionTypes || [],
          minRequiredUploads: chk.minRequiredUploads || 0,
          isOptional: !!chk.isOptional,
          qcRequired: !!chk.qcRequired
        });
      } catch (err) {
        console.error('Failed to load checkpoint data', err);
        showAlert({ title: 'Error', message: 'Failed to load checkpoint data', type: 'error' });
      }
    };

    loadCheckpoint();
  }, [deptId, opId, chkId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!deptId || !opId) {
        showAlert({ title: 'Missing Context', message: 'Missing department or operation context. Please open the department and select the operation.', type: 'error' });
        setLoading(false);
        return;
      }

      // Validation
      if (!form.name || form.name.trim() === "") {
        showAlert({ title: 'Validation', message: 'Checkpoint name is required.', type: 'error' });
        setLoading(false);
        return;
      }
      if (!Array.isArray(form.allowedSubmissionTypes) || form.allowedSubmissionTypes.length === 0) {
        showAlert({ title: 'Validation', message: 'Select at least one submission type.', type: 'error' });
        setLoading(false);
        return;
      }

      const url = `/departments/${deptId}/operations/${opId}/checkpoints/${chkId}`;
      await api.put(url, form);
      showAlert({ title: 'Success', message: 'Checkpoint Updated!', type: 'success' });
      navigate(-1);
    } catch (err) {
      console.error('CheckpointEdit error', err);
      const status = err.response?.status;
      let serverMessage = err.response?.data?.message || err.response?.data || err.message || 'Update Failed';
      if (typeof serverMessage === 'object') {
        try { serverMessage = JSON.stringify(serverMessage); } catch(e) { serverMessage = String(serverMessage); }
      }
      showAlert({ title: 'Error', message: `Update failed${status ? ` (HTTP ${status})` : ''}: ${serverMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container checkpoint-edit-page">
      <div className="form-card wide">
        <button onClick={() => navigate(-1)} className="btn-back"><FiArrowLeft /> Back</button>
        <div className="form-header">
          <div className="icon-box purple"><FiEdit /></div>
          <h1>Edit Checkpoint</h1>
        </div>

        <form onSubmit={handleSubmit} className="modern-form checkpoint-edit-form">
          <div className="form-group full">
            <label>Checkpoint Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="checkpoint-edit-input"
            />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea 
              rows="2" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              className="checkpoint-edit-textarea"
            />
          </div>

          <div className="form-group">
            <label>Submission Types</label>
            <div className="chip-group">
              {subTypes.map(t => (
                <div key={t} className={`chip ${form.allowedSubmissionTypes.includes(t) ? 'active' : ''}`} 
                onClick={() => setForm(prev => ({...prev, allowedSubmissionTypes: prev.allowedSubmissionTypes.includes(t) ? prev.allowedSubmissionTypes.filter(x => x !== t) : [...prev.allowedSubmissionTypes, t]}))}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Min Uploads</label>
            <input 
              type="number" 
              value={form.minRequiredUploads} 
              onChange={e => setForm({...form, minRequiredUploads: parseInt(e.target.value)})} 
              className="checkpoint-edit-number"
            />
          </div>

          <div className="form-group checkbox-group full">
            <label className="switch checkpoint-edit-switch">
              <input type="checkbox" checked={form.isOptional} onChange={e => setForm({...form, isOptional: e.target.checked})} />
              <span className="switch-slider" aria-hidden></span>
              <span className="switch-label">Is Optional</span>
            </label>
            <label className="switch checkpoint-edit-switch">
              <input type="checkbox" checked={form.qcRequired} onChange={e => setForm({...form, qcRequired: e.target.checked})} />
              <span className="switch-slider" aria-hidden></span>
              <span className="switch-label">QC Required</span>
            </label>
          </div>

          <button type="submit" className="btn-submit purple-btn full" disabled={loading}>
            <FiSave /> Save Changes
          </button>
        </form>
      </div>
      
      <style jsx>{`
        /* Scoped styles for Checkpoint Edit page only */
        .checkpoint-edit-page .checkpoint-edit-form { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .form-group { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .form-group.full { 
          width: 100%; 
        }

        .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-input,
        .checkpoint-edit-page .checkpoint-edit-form textarea.checkpoint-edit-textarea,
        .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-number {
          background: #0f172a !important;
          border: 1px solid #334155 !important;
          color: #f8fafc !important;
          caret-color: #ffffff !important;
          padding: 10px 14px;
          border-radius: 10px;
        }

        .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-input::placeholder,
        .checkpoint-edit-page .checkpoint-edit-form textarea.checkpoint-edit-textarea::placeholder { 
          color: #94a3b8 !important; 
        }

        .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-input:focus,
        .checkpoint-edit-page .checkpoint-edit-form textarea.checkpoint-edit-textarea:focus,
        .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-number:focus {
          background: #0f172a !important;
          color: #f8fafc !important;
          caret-color: #ffffff !important;
          border-color: #3b82f6 !important;
          outline: none !important;
        }

        /* Override global light theme specifically for this page */
        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-input,
        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form textarea.checkpoint-edit-textarea,
        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-number {
          color: #f8fafc !important;
          background: #0f172a !important;
        }

        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-input:focus,
        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form textarea.checkpoint-edit-textarea:focus,
        :global(:root.light) .checkpoint-edit-page .checkpoint-edit-form input.checkpoint-edit-number:focus {
          color: #f8fafc !important;
          background: #0f172a !important;
        }

        /* Checkpoint edit form switch styles - scoped to this page */
        .checkpoint-edit-page .checkpoint-edit-form .checkbox-group.full { 
          display:flex; 
          flex-direction:row; 
          gap:24px; 
          align-items:center; 
          justify-content:flex-start; 
          flex-wrap:nowrap; 
          width:100%; 
          min-width:0; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch { 
          flex: 0 0 50%; 
          min-width:0; 
          display:flex; 
          align-items:center; 
          gap:12px; 
          justify-content:flex-start; 
          cursor:pointer; 
          padding:6px 8px; 
          box-sizing:border-box; 
          margin:0; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch input { 
          display:none; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch .switch-slider { 
          width:44px; 
          height:24px; 
          background:#334155; 
          border-radius:999px; 
          position:relative; 
          transition:0.18s ease; 
          flex-shrink:0; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch .switch-slider::after { 
          content:''; 
          position:absolute; 
          width:18px; 
          height:18px; 
          background:#fff; 
          border-radius:50%; 
          top:3px; 
          left:3px; 
          transition:0.18s ease; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.25); 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch input:checked + .switch-slider { 
          background:#a855f7; 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch input:checked + .switch-slider::after { 
          transform: translateX(20px); 
        }
        
        .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch .switch-label { 
          color:#cbd5e1; 
          font-weight:600; 
          margin-left:12px; 
          white-space:nowrap; 
          overflow:hidden; 
          text-overflow:ellipsis; 
        }

        @media (max-width: 640px) {
          .checkpoint-edit-page .checkpoint-edit-form .checkbox-group.full { 
            flex-direction: column; 
            gap:12px; 
          }
          
          .checkpoint-edit-page .checkpoint-edit-form .checkpoint-edit-switch { 
            flex: 0 0 100%; 
            justify-content:flex-start; 
          }
        }
      `}</style>
    </div>
  );
}
