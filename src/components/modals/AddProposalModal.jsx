import { useState, useEffect, useRef } from "react";
import {
  FiX, FiDollarSign, FiCalendar, FiUpload, FiLoader,
  FiTrash2, FiPaperclip, FiMessageSquare, FiFileText, FiLayers, FiUser, FiChevronDown
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import { useAlert } from "../../components/ui/AlertProvider";

const AddProposalModal = ({ isOpen, onClose, requestId, userRole, onProposalAdded }) => {
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';

  // Department & QC member lists (admin only)
  const [departments, setDepartments] = useState([]);
  const [qcMembers, setQcMembers] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingQC, setLoadingQC] = useState(false);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    amount: "",
    dueDate: getTomorrowDate(),
    requiredDocs: [],
    departmentSequenceIds: [],
    qcMemberId: "",
    referenceFiles: [],
    remarks: ""
  });

  const [docInput, setDocInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // QC Dropdown State
  const [isQCOpen, setIsQCOpen] = useState(false);
  const qcRef = useRef(null);

  // Fetch departments and QC members when modal opens (admin only)
  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchDepartments();
      fetchQCMembers();
    }
    if (isOpen) {
      setForm({
        amount: "",
        dueDate: getTomorrowDate(),
        requiredDocs: [],
        departmentSequenceIds: [],
        qcMemberId: "",
        referenceFiles: [],
        remarks: ""
      });
      setDocInput("");
      setFormErrors({});
      setSubmitting(false);
      setUploadingFiles({});
      setIsQCOpen(false);
    }
  }, [isOpen]);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (qcRef.current && !qcRef.current.contains(e.target)) {
        setIsQCOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepts(true);
      const res = await api.get('/department');
      setDepartments(res.data.departments || res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchQCMembers = async () => {
    try {
      setLoadingQC(true);
      const res = await api.get('/users?role=QC');
      setQcMembers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching QC members:", err);
    } finally {
      setLoadingQC(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addDocType = () => {
    const trimmed = docInput.trim();
    if (!trimmed) return;
    if (form.requiredDocs.includes(trimmed)) return;
    setForm(prev => ({ ...prev, requiredDocs: [...prev.requiredDocs, trimmed] }));
    setDocInput("");
  };

  const removeDocType = (index) => {
    setForm(prev => ({
      ...prev,
      requiredDocs: prev.requiredDocs.filter((_, i) => i !== index)
    }));
  };

  const toggleDepartment = (deptId) => {
    setForm(prev => {
      const ids = [...prev.departmentSequenceIds];
      const idx = ids.indexOf(deptId);
      if (idx > -1) {
        ids.splice(idx, 1);
      } else {
        ids.push(deptId);
      }
      return { ...prev, departmentSequenceIds: ids };
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const tempId = `${file.name}_${Date.now()}`;
      setUploadingFiles(prev => ({ ...prev, [tempId]: true }));

      try {
        const result = await uploadToCloudinary(file, null, 'order-request');
        setForm(prev => ({
          ...prev,
          referenceFiles: [
            ...prev.referenceFiles,
            {
              fileName: file.name,
              fileUrl: result.url,
              publicId: result.publicId,
              resourceType: result.resourceType || 'auto'
            }
          ]
        }));
      } catch (err) {
        console.error("Upload failed:", err);
        showAlert({ title: "Upload Error", message: `Failed to upload ${file.name}`, type: "error" });
      } finally {
        setUploadingFiles(prev => {
          const copy = { ...prev };
          delete copy[tempId];
          return copy;
        });
      }
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        remarks: form.remarks.trim() || undefined
      };

      if (form.amount) payload.amount = Number(form.amount);
      if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
      if (form.requiredDocs.length > 0) payload.requiredDocs = form.requiredDocs;
      if (form.referenceFiles.length > 0) payload.referenceFiles = form.referenceFiles;

      // Admin-only fields
      if (isAdmin) {
        if (form.departmentSequenceIds.length > 0) payload.departmentSequenceIds = form.departmentSequenceIds;
        if (form.qcMemberId) payload.qcMemberId = form.qcMemberId;
      }

      await api.post(`/requests/${requestId}/proposals`, payload);
      onProposalAdded?.();
      onClose();
    } catch (err) {
      console.error("Error adding proposal:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to submit proposal",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = Object.keys(uploadingFiles).length > 0;

  if (!isOpen) return null;

  const selectedQCMember = form.qcMemberId 
    ? qcMembers.find(m => (m._id?.$oid || m._id || m.id) === form.qcMemberId) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0a1128] w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-full border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects (Dark Mode Only) */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl opacity-0 dark:opacity-100 pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl opacity-0 dark:opacity-100 pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between relative z-10 bg-white/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isAdmin ? 'Submit Proposal' : 'Counter Offer'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin
                ? 'Define pricing, timeline, and workflow for this request'
                : 'Submit your counter-offer with preferred terms'}
            </p>
          </div>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative z-10 custom-scrollbar">

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiDollarSign size={16} className="text-brand-primary" />
              Amount (PKR)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400"
              placeholder="e.g. 50000"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              min="0"
            />
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiCalendar size={16} className="text-brand-primary" />
              Proposed Due Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
              value={form.dueDate}
              min={getTomorrowDate()}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          {/* Required Docs (Admin) */}
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FiFileText size={16} className="text-brand-primary" />
                Required Documents
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400"
                  placeholder="e.g. Invoice, QC Report"
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDocType(); } }}
                />
                <button
                  type="button"
                  onClick={addDocType}
                  className="px-4 py-2.5 bg-brand-primary/10 text-brand-primary font-semibold text-sm rounded-xl hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
              {form.requiredDocs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.requiredDocs.map((doc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium border border-brand-primary/20">
                      {doc}
                      <button
                        type="button"
                        onClick={() => removeDocType(idx)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-primary/20 transition-colors"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Department Sequence (Admin) */}
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FiLayers size={16} className="text-brand-primary" />
                Department Sequence
              </label>
              {loadingDepts ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiLoader size={16} className="animate-spin" /> Loading departments...
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {departments.map(dept => {
                    const deptId = dept._id?.$oid || dept._id || dept.id;
                    const isSelected = form.departmentSequenceIds.includes(deptId);
                    return (
                      <label
                        key={deptId}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                          ? 'border-brand-primary bg-brand-primary/5 shadow-sm shadow-brand-primary/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDepartment(deptId)}
                          className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-900"
                        />
                        <span className={`text-sm ${isSelected ? 'text-brand-primary font-semibold' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                          {dept.name}
                        </span>
                      </label>
                    );
                  })}
                  {departments.length === 0 && (
                    <span className="text-slate-500 text-sm">No departments available</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* QC Member (Admin) */}
          {isAdmin && (
            <div className="flex flex-col gap-2" ref={qcRef}>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FiUser size={16} className="text-brand-primary" />
                QC Member
              </label>
              {loadingQC ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <FiLoader size={16} className="animate-spin" /> Loading QC members...
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsQCOpen(!isQCOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  >
                    <span className="truncate">
                      {selectedQCMember ? `${selectedQCMember.name} (${selectedQCMember.email})` : 'Select QC Member (optional)'}
                    </span>
                    <FiChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isQCOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isQCOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                      <div className="p-1">
                        <div 
                          className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => { handleChange('qcMemberId', ''); setIsQCOpen(false); }}
                        >
                          Select QC Member (optional)
                        </div>
                        {qcMembers.map(member => {
                          const memberId = member._id?.$oid || member._id || member.id;
                          return (
                            <div 
                              key={memberId}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                                form.qcMemberId === memberId 
                                ? 'bg-brand-primary/10 text-brand-primary font-medium' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                              }`}
                              onClick={() => { handleChange('qcMemberId', memberId); setIsQCOpen(false); }}
                            >
                              {member.name} <span className="text-slate-400">({member.email})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reference Files */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiPaperclip size={16} className="text-brand-primary" />
              Reference Files
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/5 rounded-2xl cursor-pointer transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary flex items-center justify-center mb-2 transition-colors">
                <FiUpload size={18} />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-brand-primary">Click to upload files</span>
              <span className="text-xs text-slate-400 mt-1">PDF, DOC, PNG, JPG, XLS (Max 5MB)</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
              />
            </label>

            {isUploading && (
              <div className="flex items-center gap-2 py-2 text-sm text-slate-500 dark:text-slate-400">
                <FiLoader size={16} className="animate-spin text-brand-primary" />
                Uploading files...
              </div>
            )}

            {form.referenceFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {form.referenceFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                        <FiPaperclip size={14} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors shrink-0"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiMessageSquare size={16} className="text-brand-primary" />
              Remarks
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400 min-h-[100px] resize-y"
              placeholder="Add any notes or comments about this proposal..."
              value={form.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isUploading}
            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white text-sm font-semibold shadow-md shadow-brand-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <FiLoader size={16} className="animate-spin" />}
            {submitting ? 'Submitting...' : (isAdmin ? 'Submit Proposal' : 'Submit Counter Offer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProposalModal;
