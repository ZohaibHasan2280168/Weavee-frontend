import { useState, useEffect } from "react";
import {
  FiX, FiFileText, FiCalendar, FiUpload, FiLoader, FiTrash2, FiPaperclip
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import { useAlert } from "../../components/ui/AlertProvider";

const garmentTypes = [
  { value: 'PANT', label: 'Pants' },
  { value: 'JACKET', label: 'Jacket' },
  { value: 'SHORTS', label: 'Shorts' },
  { value: 'OTHER', label: 'Other' }
];

const CreateOrderRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    name: "",
    type: "PANT",
    description: "",
    targetDueDate: getTomorrowDate(),
    originalReferenceFiles: []
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        type: "PANT",
        description: "",
        targetDueDate: getTomorrowDate(),
        originalReferenceFiles: []
      });
      setFormErrors({});
      setSubmitting(false);
      setUploadingFiles({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
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
          originalReferenceFiles: [
            ...prev.originalReferenceFiles,
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
    // Reset file input
    e.target.value = '';
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      originalReferenceFiles: prev.originalReferenceFiles.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.targetDueDate) errors.targetDueDate = "Target due date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post('/requests', {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        targetDueDate: new Date(form.targetDueDate).toISOString(),
        originalReferenceFiles: form.originalReferenceFiles
      });
      onRequestCreated?.();
      onClose();
    } catch (err) {
      console.error("Error creating request:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to create order request",
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = Object.keys(uploadingFiles).length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Order Request</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit a quote request for a new order</p>
          </div>
          <button 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all" 
            onClick={onClose}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <FiFileText size={14} className="text-brand-primary" />
              Request Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border ${formErrors.name ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-200 dark:border-slate-800 focus:ring-brand-primary/50'} text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all`}
              placeholder="e.g. Winter Jacket Collection"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {formErrors.name && <span className="text-xs text-rose-500 mt-1 block font-medium">{formErrors.name}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Type */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Garment Type</label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all pr-10 cursor-pointer"
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {garmentTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </div>
            </div>

            {/* Target Due Date */}
            <div>
              <label className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FiCalendar size={14} className="text-brand-primary" />
                Target Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border ${formErrors.targetDueDate ? 'border-rose-500 focus:ring-rose-500/50' : 'border-slate-200 dark:border-slate-800 focus:ring-brand-primary/50'} text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all`}
                value={form.targetDueDate}
                min={getTomorrowDate()}
                onChange={(e) => handleChange('targetDueDate', e.target.value)}
              />
              {formErrors.targetDueDate && <span className="text-xs text-rose-500 mt-1 block font-medium">{formErrors.targetDueDate}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</label>
            <textarea
              className="w-full rounded-xl px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
              rows={3}
              placeholder="Describe your requirements, quantity, specifications..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Reference Files */}
          <div>
            <label className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <FiPaperclip size={14} className="text-brand-primary" />
              Reference Files <span className="normal-case text-[10px] text-slate-400 font-normal ml-1">(Tech Packs, Blueprints)</span>
            </label>
            <label
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-brand-primary/50 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 text-slate-500 dark:text-slate-400 cursor-pointer transition-all"
            >
              <FiUpload size={20} className="mb-2 text-slate-400" />
              <span className="text-sm font-medium">Click to upload files</span>
              <span className="text-xs mt-1 opacity-70">PDF, DOC, PNG, JPG, XLSX</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
              />
            </label>

            {/* Uploading indicator */}
            {isUploading && (
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <FiLoader size={16} className="animate-spin text-brand-primary" />
                Uploading files...
              </div>
            )}

            {/* Uploaded files list */}
            {form.originalReferenceFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {form.originalReferenceFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                      <FiPaperclip size={14} />
                    </div>
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 truncate">{file.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 dark:bg-rose-500/10 dark:hover:bg-rose-600 rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isUploading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-primary to-blue-600 hover:from-blue-600 hover:to-brand-primary transition-all shadow-md shadow-brand-primary/25 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none min-w-[140px]"
          >
            {submitting ? (
              <>
                <FiLoader size={16} className="animate-spin" /> Submitting...
              </>
            ) : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderRequestModal;
