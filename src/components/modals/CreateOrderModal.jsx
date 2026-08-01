import { useState, useEffect } from "react";
import {
  FiX, FiPlus, FiInfo, FiUser, FiLayers, FiFileText, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight,
  FiTag, FiMail, FiChevronUp, FiChevronDown, FiUpload, FiLoader
} from "react-icons/fi";
import api from '../../services/reqInterceptor';
import { useAlert } from "../../components/ui/AlertProvider";
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import CustomSelect from '../../components/ui/CustomSelect';

const CreateOrderModal = ({
  isOpen,
  onClose,
  departments,
  onOrderCreated
}) => {
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedQCId, setSelectedQCId] = useState("");
  const [departmentsList, setDepartmentsList] = useState(departments || []);
  const [qcMembersList, setQCMembersList] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingQC, setLoadingQC] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [qcError, setQcError] = useState("");

  const [checkingUser, setCheckingUser] = useState(false);
  const [userExistsStatus, setUserExistsStatus] = useState(null);
  const [matchedUserId, setMatchedUserId] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const { showAlert } = useAlert();

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [newOrder, setNewOrder] = useState({
    name: "",
    type: "PANT",
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    requiredDocTypes: [],
    uploadedDocsData: {},
    departmentSequenceIds: [],
    qcMemberId: "",
    dueDate: getTomorrowDate()
  });

  const moveDept = (index, direction) => {
    setNewOrder(prev => {
      const seq = [...prev.departmentSequenceIds];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= seq.length) return prev;
      const tmp = seq[newIndex];
      seq[newIndex] = seq[index];
      seq[index] = tmp;
      return { ...prev, departmentSequenceIds: seq };
    });
  };

  const garmentTypes = [
    { value: 'PANT', label: 'Pants' },
    { value: 'JACKET', label: 'Jacket' },
    { value: 'SHORTS', label: 'Shorts' },
    { value: 'OTHER', label: 'Other' }
  ];

  const stepInfo = [
    { num: 1, title: 'Details', icon: FiInfo },
    { num: 2, title: 'Client', icon: FiUser },
    { num: 3, title: 'Workflow', icon: FiLayers },
    { num: 4, title: 'Docs & Files', icon: FiFileText }
  ];

  const handleEmailBlur = async () => {
    const email = newOrder.clientEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    try {
      setCheckingUser(true);
      const response = await api.get(`/users?email=${email}`);
      const data = response.data?.users || response.data || [];

      const match = Array.isArray(data)
        ? data.find(u => u.email?.toLowerCase() === email.toLowerCase())
        : null;

      if (match) {
        setUserExistsStatus('EXISTS');
        const cleanRawId = match._id || match.id;
        if (cleanRawId) {
          setMatchedUserId(String(cleanRawId).trim());
        } else {
          setMatchedUserId(null);
        }

        if (match.name) {
          setNewOrder(prev => ({ ...prev, clientName: match.name }));
        }
      } else {
        setUserExistsStatus('NOT_FOUND');
        setMatchedUserId(null);
      }
    } catch (err) {
      setUserExistsStatus(null);
      setMatchedUserId(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const addDocType = (e) => {
    if (e) e.preventDefault();
    if (docInput.trim()) {
      const formattedDoc = docInput.trim().toUpperCase().replace(/\s+/g, '_');
      if (!newOrder.requiredDocTypes.includes(formattedDoc)) {
        setNewOrder(prev => ({
          ...prev,
          requiredDocTypes: [...prev.requiredDocTypes, formattedDoc]
        }));
      }
      setDocInput("");
    }
  };

  const removeDocType = (doc) => {
    setNewOrder(prev => {
      const updatedFiles = { ...prev.uploadedDocsData };
      delete updatedFiles[doc];
      return {
        ...prev,
        requiredDocTypes: prev.requiredDocTypes.filter(d => d !== doc),
        uploadedDocsData: updatedFiles
      };
    });
  };

  const addDeptToSequence = () => {
    if (!selectedDeptId) return;
    setNewOrder(prev => ({
      ...prev,
      departmentSequenceIds: [...prev.departmentSequenceIds, selectedDeptId]
    }));
    setSelectedDeptId("");
  };

  const removeDeptFromSequence = (index) => {
    setNewOrder(prev => {
      const seq = [...prev.departmentSequenceIds];
      seq.splice(index, 1);
      return { ...prev, departmentSequenceIds: seq };
    });
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1 || step === 'all') {
      if (!newOrder.name.trim()) errors.name = "Order name is required";
      if (!newOrder.amount) errors.amount = "Quote amount is required";
      if (!newOrder.dueDate) errors.dueDate = "Due date is required";
    }
    if (step === 2 || step === 'all') {
      if (!newOrder.clientName.trim()) errors.clientName = "Client name is required";
      if (!newOrder.clientEmail.trim()) {
        errors.clientEmail = "Client email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOrder.clientEmail)) {
        errors.clientEmail = "Please enter a valid email";
      }
    }
    if (step === 3 || step === 'all') {
      if (newOrder.departmentSequenceIds.length === 0) {
        errors.departments = "At least one department is required";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!validateStep('all')) {
      showAlert({
        title: "Validation Error",
        message: "Please verify all required field parameters.",
        type: "error"
      });
      return;
    }

    const orderPayload = {
      name: newOrder.name.trim(),
      type: newOrder.type,
      amount: Number(newOrder.amount),
      currency: newOrder.currency,
      description: newOrder.description.trim(),
      clientName: newOrder.clientName.trim(),
      clientEmail: newOrder.clientEmail.trim(),
      departmentSequenceIds: newOrder.departmentSequenceIds,
      requiredDocTypes: newOrder.requiredDocTypes,
      dueDate: newOrder.dueDate ? new Date(newOrder.dueDate).toISOString() : null
    };

    if (newOrder.qcMemberId) {
      orderPayload.qcMemberId = newOrder.qcMemberId;
    }

    if (userExistsStatus === 'EXISTS' && matchedUserId) {
      orderPayload.clientId = String(matchedUserId).trim();
    }

    try {
      const response = await api.post(`/order`, orderPayload);

      if (response.data?.success || response.data?.order || response.status === 201 || response.status === 200) {
        showAlert({
          title: "Success",
          message: "Order has been created successfully!",
          type: "success"
        });
        resetForm();
        onClose();
        onOrderCreated();
      } else {
        throw new Error(response.data?.message || "Invalid payload acknowledgment.");
      }
    } catch (err) {
      console.error("Primary creation failed. Initializing secure schema validation fallback...", err);

      try {
        const cleanStrippedPayload = { ...orderPayload };
        delete cleanStrippedPayload.clientId;

        const fallbackResponse = await api.post(`/order`, cleanStrippedPayload);
        if (fallbackResponse.data?.success || fallbackResponse.data?.order || fallbackResponse.status === 201 || fallbackResponse.status === 200) {
          showAlert({
            title: "Success",
            message: "Order has been created successfully!",
            type: "success"
          });
          resetForm();
          onClose();
          onOrderCreated();
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback route execution failed:", fallbackErr);
      }

      showAlert({
        title: "Order Generation Failed",
        message: err.response?.data?.message || err.message || "Server type mismatch constraints.",
        type: "error"
      });
    }
  };

  const resetForm = () => {
    setNewOrder({
      name: "",
      type: "PANT",
      description: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      currency: "Rs.",
      requiredDocTypes: [],
      uploadedDocsData: {},
      departmentSequenceIds: [],
      qcMemberId: "",
      dueDate: getTomorrowDate()
    });
    setFormStep(1);
    setFormErrors({});
    setDocInput("");
    setSelectedDeptId("");
    setSelectedQCId("");
    setUserExistsStatus(null);
    setMatchedUserId(null);
    setUploadingFiles({});
    setQcError("");
    setDepartmentsError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (departments && departments.length) return;
      try {
        setLoadingDepartments(true);
        setDepartmentsError("");
        const res = await api.get('/departments');
        setDepartmentsList(res.data?.departments || res.data || []);
      } catch (err) {
        setDepartmentsError('Failed to load system processes.');
      } finally {
        setLoadingDepartments(false);
      }
    };
    if (isOpen) fetchDepartments();
  }, [isOpen, departments]);

  useEffect(() => {
    const fetchQCMembers = async () => {
      try {
        setLoadingQC(true);
        setQcError("");
        const res = await api.get('/users/qc-members');
        setQCMembersList(res.data?.data || []);
      } catch (err) {
        setQcError('Failed to load QC members.');
      } finally {
        setLoadingQC(false);
      }
    };
    if (isOpen) fetchQCMembers();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-6 px-4 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-900/60 overflow-y-auto" onClick={handleClose}>
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <FiPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 m-0">Create New Order</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Setup workflow and client specifications</p>
            </div>
          </div>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={handleClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          {stepInfo.map((step, idx) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center gap-2 flex-1 cursor-pointer group"
              onClick={() => formStep > step.num && setFormStep(step.num)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 ${formStep === step.num ? 'border-brand-primary text-brand-primary bg-white dark:bg-slate-900' : formStep > step.num ? 'bg-blue-600 border-blue-600 dark:bg-blue-600 dark:border-blue-600' : 'border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900'}`}>
                {formStep > step.num ? <FiCheckCircle className="w-5 h-5 text-white" /> : <step.icon size={16} />}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${formStep >= step.num ? 'text-brand-primary' : 'text-slate-400'}`}>{step.title}</span>
              {idx < stepInfo.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${formStep > step.num ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleCreateOrder} className="flex flex-col flex-1">
          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            {formStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Order Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors`}
                    value={newOrder.name}
                    onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                    placeholder="e.g., Summer Denim Batch"
                  />
                  {formErrors.name && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Garment Type Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {garmentTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${newOrder.type === type.value ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setNewOrder({ ...newOrder, type: type.value })}
                      >
                        <FiTag size={18} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Financial Quote <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <CustomSelect 
                      className="w-28 shrink-0"
                      options={[
                        { value: 'Rs.', label: 'Rs.' },
                        { value: '$', label: 'USD' }
                      ]}
                      value={newOrder.currency}
                      onChange={(val) => setNewOrder({ ...newOrder, currency: val })}
                    />
                    <input
                      type="number"
                      className={`flex-1 bg-white dark:bg-slate-900 border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm box-border block w-full`}
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.amount && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.amount}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Target Due Date <span className="text-red-500">*</span></label>
                  <div className={`flex items-center w-full bg-white dark:bg-slate-900 border ${formErrors.dueDate ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus-within:ring-blue-500'} rounded-xl shadow-sm focus-within:ring-2 transition-all overflow-hidden box-border`}>
                    <div className="pl-4 pr-2.5 flex items-center justify-center pointer-events-none text-slate-400">
                      <FiCalendar size={18} />
                    </div>
                    <input
                      type="date"
                      className="flex-1 py-2.5 pr-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                      value={newOrder.dueDate}
                      onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Production Remarks & Scope</label>
                  <textarea
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors resize-y"
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    placeholder="Enter process details here..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Account Email Reference <span className="text-red-500">*</span></label>
                  <div className="relative w-full">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      type="email"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border ${formErrors.clientEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm`}
                      value={newOrder.clientEmail}
                      onChange={(e) => setNewOrder({ ...newOrder, clientEmail: e.target.value })}
                      onBlur={handleEmailBlur}
                      placeholder="client@example.com"
                    />
                  </div>
                  {checkingUser && <span className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400"><FiLoader className="animate-spin" size={12} /> Fetching profile schemas...</span>}

                  {userExistsStatus === 'EXISTS' && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm border border-emerald-200 dark:border-emerald-500/20">
                      <FiCheckCircle size={14} />
                      <span>User matched! String casting enforcement rules triggered automatically.</span>
                    </div>
                  )}
                  {userExistsStatus === 'NOT_FOUND' && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-500/20">
                      <FiAlertCircle size={14} />
                      <span>User record not cached. Setup triggers new baseline registration contextually.</span>
                    </div>
                  )}
                  {formErrors.clientEmail && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.clientEmail}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Registered Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${formErrors.clientName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors`}
                    value={newOrder.clientName}
                    onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                    placeholder="Enter full name"
                  />
                  {formErrors.clientName && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.clientName}</span>}
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Department Sequence</label>
                  <div className="flex gap-2">
                    <CustomSelect 
                      className="flex-1"
                      placeholder="Select Department Node..."
                      options={(departmentsList || []).map(d => ({
                        value: d._id,
                        label: d.name,
                        disabled: newOrder.departmentSequenceIds.includes(d._id)
                      }))}
                      value={selectedDeptId}
                      onChange={(val) => setSelectedDeptId(val)}
                    />
                    <button type="button" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" onClick={addDeptToSequence} disabled={!selectedDeptId}><FiPlus size={16} /> Add</button>
                  </div>
                  {formErrors.departments && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.departments}</span>}
                </div>

                <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex flex-col gap-2">
                    {newOrder.departmentSequenceIds.length === 0 ? (
                      <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">No departments assigned yet.</div>
                    ) : (
                      newOrder.departmentSequenceIds.map((id, index) => {
                        const targetDept = (departmentsList || []).find(d => d._id === id);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                            <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{targetDept?.name || 'Processing Unit'}</span>
                            <div className="flex gap-1 shrink-0">
                              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors" onClick={() => moveDept(index, 'up')} disabled={index === 0}><FiChevronUp /></button>
                              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors" onClick={() => moveDept(index, 'down')} disabled={index === newOrder.departmentSequenceIds.length - 1}><FiChevronDown /></button>
                              <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" onClick={() => removeDeptFromSequence(index)}><FiX size={16} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Quality Control (QC) Member</label>
                  <CustomSelect 
                    className="w-full"
                    placeholder="Select QC Member..."
                    options={(qcMembersList || []).map(qc => ({
                      value: qc._id,
                      label: qc.name
                    }))}
                    value={selectedQCId}
                    onChange={(val) => {
                      setSelectedQCId(val);
                      setNewOrder({ ...newOrder, qcMemberId: val });
                    }}
                    disabled={loadingQC}
                  />
                  {loadingQC && <span className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400"><FiLoader className="animate-spin" size={12} /> Loading QC members...</span>}
                  {qcError && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {qcError}</span>}
                  {newOrder.qcMemberId && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm border border-emerald-200 dark:border-emerald-500/20">
                      <FiCheckCircle size={14} />
                      <span>QC member assigned: {qcMembersList.find(q => q._id === newOrder.qcMemberId)?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formStep === 4 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Define Required Specification Blueprint (Doc Type)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                      placeholder="e.g., TECH_PACK, SIZE_CHART"
                      value={docInput}
                      onChange={(e) => setDocInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addDocType(e)}
                    />
                    <button type="button" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" onClick={addDocType} disabled={!docInput.trim()}><FiPlus size={16} /> Add Type</button>
                  </div>
                </div>

                <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Prerequisite Blueprint Grid Configuration:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {newOrder.requiredDocTypes.length === 0 ? (
                      <div className="col-span-full py-4 text-center text-sm text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        Add document types above. Structural instantiation initialized inside core blueprint workflows.
                      </div>
                    ) : (
                      newOrder.requiredDocTypes.map((docType, index) => {
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                            <div className="flex flex-col gap-1 overflow-hidden">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold w-fit">{docType}</span>
                              <span className="text-xs italic text-slate-500 dark:text-slate-400 truncate">Auto initialized as pending blueprint</span>
                            </div>
                            <div className="shrink-0 ml-2">
                              <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" onClick={() => removeDocType(docType)}><FiX size={14} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center sticky bottom-0 rounded-b-2xl backdrop-blur-sm">
            <button type="button" className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm" onClick={handleClose}>Cancel</button>
            <div className="flex items-center gap-3">
              {formStep > 1 && <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors shadow-sm text-sm" onClick={handlePrevStep}><FiArrowLeft size={16} /> Previous</button>}
              {formStep < 4 && <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors shadow-md shadow-brand-primary/20 text-sm" onClick={handleNextStep}>Next Step <FiChevronRight size={16} /></button>}
              {formStep === 4 && <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-md shadow-emerald-500/20 text-sm">Create Order Blueprint</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
