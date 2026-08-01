import { useState, useEffect } from "react";
import {
  FiX, FiPlus, FiEdit2, FiInfo, FiUser, FiLayers, FiFileText, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight,
  FiTag, FiMail, FiChevronUp, FiChevronDown, FiLoader, FiTrash2
} from "react-icons/fi";
import api from "../../services/reqInterceptor";
import { useAlert } from "../../components/ui/AlertProvider";
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import CustomSelect from '../../components/ui/CustomSelect';

const EditOrderModal = ({ isOpen, onClose, orderData, onUpdateSuccess, departments }) => {
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [docInput, setDocInput] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedQCId, setSelectedQCId] = useState("");
  const { showAlert } = useAlert();

  const [departmentsList, setDepartmentsList] = useState(departments || []);
  const [qcMembersList, setQCMembersList] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingQC, setLoadingQC] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [qcError, setQcError] = useState("");

  const [checkingUser, setCheckingUser] = useState(false);
  const [userExistsStatus, setUserExistsStatus] = useState(null);
  const [matchedUserId, setMatchedUserId] = useState(null);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [editedOrder, setEditedOrder] = useState({
    name: "",
    type: "PANT",
    description: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    currency: "Rs.",
    dueDate: "",
    requiredDocTypes: [],
    departmentSequenceIds: [],
    qcMemberId: ""
  });

  useEffect(() => {
    if (orderData && isOpen) {
      const baseDocsArray = orderData.requiredDocuments || orderData.requiredDocTypes || [];
      const extractedTypes = [];

      baseDocsArray.forEach(d => {
        const typeStr = d.docType || d;
        if (typeStr && typeof typeStr === 'string') {
          extractedTypes.push(typeStr);
        }
      });

      setEditedOrder({
        name: orderData.name || "",
        type: orderData.type || "PANT",
        description: orderData.description || "",
        clientName: orderData.clientName || "",
        clientEmail: orderData.clientEmail || "",
        amount: orderData.amount || "",
        currency: orderData.currency || "Rs.",
        dueDate: orderData.dueDate ? formatDateForInput(orderData.dueDate) : "",
        requiredDocTypes: extractedTypes,
        departmentSequenceIds: orderData.departmentSequence?.map(d => d._id || d) || orderData.departmentSequenceIds || [],
        qcMemberId: orderData.qcMember?._id || orderData.qcMemberId || ""
      });

      setFormStep(1);
      setFormErrors({});
      setDocInput("");
      setSelectedDeptId("");
      setSelectedQCId(orderData.qcMember?._id || orderData.qcMemberId || "");
      setUserExistsStatus('EXISTS');
      const rawClientId = orderData.clientId?._id || orderData.clientId || null;
      setMatchedUserId(rawClientId ? String(rawClientId) : null);
    }
  }, [orderData, isOpen]);

  const stepInfo = [
    { num: 1, title: 'Details', icon: FiInfo },
    { num: 2, title: 'Client Info', icon: FiUser },
    { num: 3, title: 'Workflow', icon: FiLayers },
    { num: 4, title: 'Doc Specifications', icon: FiFileText }
  ];

  const garmentTypes = [
    { value: 'PANT', label: 'Pant' },
    { value: 'JACKET', label: 'Jacket' },
    { value: 'SHORTS', label: 'Shorts' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleEmailBlur = async () => {
    const email = editedOrder.clientEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    try {
      setCheckingUser(true);
      const response = await api.get(`/users?email=${email}`);
      const data = response.data?.users || response.data || [];
      const match = Array.isArray(data) ? data.find(u => u.email?.toLowerCase() === email.toLowerCase()) : null;

      if (match) {
        setUserExistsStatus('EXISTS');
        setMatchedUserId(match._id || match.id);
      } else {
        setUserExistsStatus('NOT_FOUND');
        setMatchedUserId(null);
      }
    } catch (err) {
      setUserExistsStatus(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const addDocType = (e) => {
    if (e) e.preventDefault();
    if (docInput.trim()) {
      const formattedDoc = docInput.trim().toUpperCase().replace(/\s+/g, '_');
      if (!editedOrder.requiredDocTypes.includes(formattedDoc)) {
        setEditedOrder(prev => ({
          ...prev,
          requiredDocTypes: [...prev.requiredDocTypes, formattedDoc]
        }));
      }
      setDocInput("");
    }
  };

  const removeDocType = (doc) => {
    setEditedOrder(prev => ({
      ...prev,
      requiredDocTypes: prev.requiredDocTypes.filter(d => d !== doc)
    }));
  };

  const addDeptToSequence = () => {
    if (selectedDeptId) {
      setEditedOrder(prev => ({
        ...prev,
        departmentSequenceIds: [...prev.departmentSequenceIds, selectedDeptId]
      }));
      setSelectedDeptId("");
    }
  };

  const moveDept = (index, direction) => {
    setEditedOrder(prev => {
      const seq = [...prev.departmentSequenceIds];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= seq.length) return prev;
      const tmp = seq[newIndex];
      seq[newIndex] = seq[index];
      seq[index] = tmp;
      return { ...prev, departmentSequenceIds: seq };
    });
  };

  const removeDeptFromSequence = (index) => {
    setEditedOrder(prev => {
      const updatedSeq = [...prev.departmentSequenceIds];
      updatedSeq.splice(index, 1);
      return { ...prev, departmentSequenceIds: updatedSeq };
    });
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
        setDepartmentsError('Failed to sync pipelines.');
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

  const validateStep = (step) => {
    const errors = {};
    if (step === 1 || step === 'all') {
      if (!editedOrder.name.trim()) errors.name = "Order name required";
      if (!editedOrder.amount) errors.amount = "Quote metric required";
      if (!editedOrder.dueDate) errors.dueDate = "Target deadline parameters required";
    }
    if (step === 2 || step === 'all') {
      if (!editedOrder.clientName.trim()) errors.clientName = "Client identity name required";
      if (!editedOrder.clientEmail.trim()) errors.clientEmail = "Client email required";
    }
    if (step === 3 || step === 'all') {
      if (editedOrder.departmentSequenceIds.length === 0) errors.departments = "Workflow route tracks required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) setFormStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!validateStep('all')) return;

    try {
      const payload = {
        name: editedOrder.name,
        type: editedOrder.type,
        amount: Number(editedOrder.amount),
        currency: editedOrder.currency,
        dueDate: editedOrder.dueDate ? new Date(editedOrder.dueDate).toISOString() : null,
        description: editedOrder.description,
        clientName: editedOrder.clientName,
        clientEmail: editedOrder.clientEmail,
        departmentSequenceIds: editedOrder.departmentSequenceIds,
        requiredDocTypes: editedOrder.requiredDocTypes
      };

      if (editedOrder.qcMemberId) {
        payload.qcMemberId = editedOrder.qcMemberId;
      }

      if (userExistsStatus === 'EXISTS' && matchedUserId) {
        payload.clientId = matchedUserId;
      }

      const activeOrderId = orderData._id || orderData.id;
      await api.put(`/order/${activeOrderId}`, payload);

      showAlert({
        title: "Updated Successfully",
        message: "Order blueprint modified cleanly.",
        type: "success"
      });
      onUpdateSuccess();
      onClose();
    } catch (err) {
      showAlert({
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update target configurations.",
        type: "error"
      });
    }
  };

  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-6 px-4 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-900/60 overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <FiEdit2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 m-0">Edit Order Parameters</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track Code: {orderData.uniqueId || orderData._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={onClose}>
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

        <form onSubmit={handleUpdateOrder} className="flex flex-col flex-1">
          <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            {formStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Operational Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors`}
                    value={editedOrder.name}
                    onChange={(e) => setEditedOrder({ ...editedOrder, name: e.target.value })}
                  />
                  {formErrors.name && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Garment Configuration Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {garmentTypes.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${editedOrder.type === g.value ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setEditedOrder({ ...editedOrder, type: g.value })}
                      >
                        <span className="text-sm font-medium">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Financial Evaluation Valuation <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <CustomSelect 
                      className="w-28 shrink-0"
                      options={[
                        { value: 'Rs.', label: 'Rs.' },
                        { value: '$', label: 'USD' }
                      ]}
                      value={editedOrder.currency}
                      onChange={(val) => setEditedOrder({ ...editedOrder, currency: val })}
                    />
                    <input 
                      type="number" 
                      className={`flex-1 bg-white dark:bg-slate-900 border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm box-border block w-full`}
                      value={editedOrder.amount} 
                      onChange={(e) => setEditedOrder({ ...editedOrder, amount: e.target.value })} 
                    />
                  </div>
                  {formErrors.amount && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.amount}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Commitment Deadline <span className="text-red-500">*</span></label>
                  <div className={`flex items-center w-full bg-white dark:bg-slate-900 border ${formErrors.dueDate ? 'border-red-500 focus-within:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus-within:ring-blue-500'} rounded-xl shadow-sm focus-within:ring-2 transition-all overflow-hidden box-border`}>
                    <div className="pl-4 pr-2.5 flex items-center justify-center pointer-events-none text-slate-400">
                      <FiCalendar size={18} />
                    </div>
                    <input
                      type="date"
                      className="flex-1 py-2.5 pr-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-full"
                      value={editedOrder.dueDate}
                      onChange={(e) => setEditedOrder({ ...editedOrder, dueDate: e.target.value })}
                    />
                  </div>
                  {formErrors.dueDate && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.dueDate}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Production Remarks & Scope</label>
                  <textarea
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors resize-y"
                    value={editedOrder.description}
                    onChange={(e) => setEditedOrder({ ...editedOrder, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client System Communication Email <span className="text-red-500">*</span></label>
                  <div className="relative w-full">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                      type="email"
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border ${formErrors.clientEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm`}
                      value={editedOrder.clientEmail}
                      onChange={(e) => setEditedOrder({ ...editedOrder, clientEmail: e.target.value })}
                      onBlur={handleEmailBlur}
                    />
                  </div>
                  {checkingUser && <span className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400"><FiLoader className="animate-spin" size={12} /> Auditing logs...</span>}
                  {userExistsStatus === 'EXISTS' && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm border border-emerald-200 dark:border-emerald-500/20">
                      <FiCheckCircle size={14} /> <span>User recognized correctly. Order updates will preserve identity linkage.</span>
                    </div>
                  )}
                  {userExistsStatus === 'NOT_FOUND' && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-500/20">
                      <FiAlertCircle size={14} /> <span>User not registered in standard directories.</span>
                    </div>
                  )}
                  {formErrors.clientEmail && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.clientEmail}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Registered Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${formErrors.clientName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors`}
                    value={editedOrder.clientName}
                    onChange={(e) => setEditedOrder({ ...editedOrder, clientName: e.target.value })}
                  />
                  {formErrors.clientName && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.clientName}</span>}
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modify Processing Path Map</label>
                  <div className="flex gap-2">
                    <CustomSelect 
                      className="flex-1"
                      placeholder="Select Processing Department..."
                      options={(departmentsList || []).map(d => ({
                        value: d._id,
                        label: d.name,
                        disabled: editedOrder.departmentSequenceIds.includes(d._id)
                      }))}
                      value={selectedDeptId}
                      onChange={(val) => setSelectedDeptId(val)}
                    />
                    <button type="button" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" onClick={addDeptToSequence} disabled={!selectedDeptId}><FiPlus size={16} /> Link Node</button>
                  </div>
                  {formErrors.departments && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {formErrors.departments}</span>}
                </div>

                <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex flex-col gap-2">
                    {editedOrder.departmentSequenceIds.length === 0 ? (
                      <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">No departments assigned yet.</div>
                    ) : (
                      editedOrder.departmentSequenceIds.map((id, index) => {
                        const deptNode = departmentsList.find(d => d._id === id);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                            <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                            <span className="flex-1 font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{deptNode?.name || 'Department Track Line'}</span>
                            <div className="flex gap-1 shrink-0">
                              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors" onClick={() => moveDept(index, 'up')} disabled={index === 0}><FiChevronUp /></button>
                              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors" onClick={() => moveDept(index, 'down')} disabled={index === editedOrder.departmentSequenceIds.length - 1}><FiChevronDown /></button>
                              <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" onClick={() => removeDeptFromSequence(index)}><FiTrash2 size={14} /></button>
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
                      setEditedOrder({ ...editedOrder, qcMemberId: val });
                    }}
                    disabled={loadingQC}
                  />
                  {loadingQC && <span className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400"><FiLoader className="animate-spin" size={12} /> Loading QC members...</span>}
                  {qcError && <span className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium"><FiAlertCircle size={12} /> {qcError}</span>}
                  {editedOrder.qcMemberId && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm border border-emerald-200 dark:border-emerald-500/20">
                      <FiCheckCircle size={14} />
                      <span>QC member assigned: {qcMembersList.find(q => q._id === editedOrder.qcMemberId)?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formStep === 4 && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Append Specification Verification Rules</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                      value={docInput}
                      onChange={(e) => setDocInput(e.target.value)}
                      placeholder="e.g., SEWING_GUIDE"
                      onKeyDown={(e) => e.key === 'Enter' && addDocType(e)}
                    />
                    <button type="button" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed" onClick={addDocType} disabled={!docInput.trim()}><FiPlus size={16} /> Add Rule Block</button>
                  </div>
                </div>

                <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editedOrder.requiredDocTypes.length === 0 ? (
                      <div className="col-span-full py-4 text-center text-sm text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        Add document types above.
                      </div>
                    ) : (
                      editedOrder.requiredDocTypes.map((docType, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold w-fit">{docType}</span>
                            <span className="text-xs italic text-slate-500 dark:text-slate-400 truncate">Managed on tracking panel</span>
                          </div>
                          <div className="shrink-0 ml-2">
                            <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" onClick={() => removeDocType(docType)}><FiX size={14} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center sticky bottom-0 rounded-b-2xl backdrop-blur-sm">
            <button type="button" className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm" onClick={onClose}>Cancel</button>
            <div className="flex items-center gap-3">
              {formStep > 1 && <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors shadow-sm text-sm" onClick={handlePrevStep}><FiArrowLeft size={16} /> Previous</button>}
              {formStep < 4 && <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors shadow-md shadow-brand-primary/20 text-sm" onClick={handleNextStep}>Next Step <FiChevronRight size={16} /></button>}
              {formStep === 4 && <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-md shadow-emerald-500/20 text-sm">Apply Track Updates</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
