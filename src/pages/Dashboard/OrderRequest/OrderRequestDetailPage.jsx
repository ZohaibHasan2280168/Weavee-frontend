import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiCheckCircle, FiClock,
  FiFileText, FiCalendar, FiDollarSign, FiMessageSquare,
  FiPaperclip, FiExternalLink, FiXCircle, FiRepeat,
  FiUser, FiUsers
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import { useAlert } from "../../../components/ui/AlertProvider";
import { useAuth } from "../../../components/context/AuthContext";
import AddProposalModal from "../../../components/modals/AddProposalModal";

const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return pkrFormatter.format(amount);
};

const OrderRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showAlert } = useAlert();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const isAdmin = useMemo(() => authUser?.role === 'ADMIN' || authUser?.role === 'MODERATOR', [authUser?.role]);
  const isClient = useMemo(() => authUser?.role === 'CLIENT', [authUser?.role]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/requests/${id}`);
      // Safely unpack the request object whether it's wrapped in data or request
      const unwrappedRequest = res.data?.data || res.data?.request || res.data;
      setRequest(unwrappedRequest);
    } catch (err) {
      console.error("Error fetching order request:", err);
      showAlert({ title: "Error", message: "Failed to load order request", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleConvert = async () => {
    if (!window.confirm("Are you sure you want to convert this request into an Order? This will use the latest proposal details.")) return;

    try {
      setConverting(true);
      await api.post(`/requests/${id}/convert`);
      showAlert({ title: "Success", message: "Request converted to Order successfully!", type: "success" });
      fetchRequest();
    } catch (err) {
      console.error("Error converting request:", err);
      showAlert({
        title: "Error",
        message: err.response?.data?.message || "Failed to convert request",
        type: "error"
      });
    } finally {
      setConverting(false);
    }
  };

  const handleProposalAdded = () => {
    fetchRequest();
    showAlert({ title: "Success", message: "Proposal submitted successfully!", type: "success" });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING_ADMIN': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20';
      case 'PENDING_CLIENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20';
      case 'CANCELED': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20';
    }
  };

  // Determine who should act next
  const canAddProposal = useMemo(() => {
    if (!request) return false;
    if (request.status === 'CONVERTED' || request.status === 'CANCELED') return false;
    if (isAdmin && request.status === 'PENDING_ADMIN') return true;
    if (isClient && request.status === 'PENDING_CLIENT') return true;
    return false;
  }, [request, isAdmin, isClient]);

  const canConvert = useMemo(() => {
    if (!request) return false;
    if (!isAdmin) return false;
    if (request.status === 'CONVERTED' || request.status === 'CANCELED') return false;
    return request.proposals && request.proposals.length > 0;
  }, [request, isAdmin]);

  const statusSteps = [
    { key: 'PENDING_ADMIN', label: 'Pending Admin Review', icon: <FiClock size={14} /> },
    { key: 'PENDING_CLIENT', label: 'Pending Client Review', icon: <FiUser size={14} /> },
    { key: 'CONVERTED', label: 'Converted to Order', icon: <FiCheckCircle size={14} /> },
  ];

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading request details...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <FiXCircle size={48} className="text-rose-500" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Request not found</span>
          <button 
            className="flex items-center gap-2 px-4 py-2 mt-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm" 
            onClick={() => navigate('/order-requests')}
          >
            <FiArrowLeft size={16} /> Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Header (Sticky) */}
      <div className="shrink-0 bg-white dark:bg-[#0d1936] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700" 
            onClick={() => navigate('/order-requests')}
          >
            <FiArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{request.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <span className={`px-2.5 py-0.5 rounded-full ${getStatusClass(request.status)}`}>
                {request.status?.replace(/_/g, ' ') || 'UNKNOWN'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <FiCalendar size={12} />
                Created {formatDate(request.createdAt)}
              </span>
              {request.type && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px]">
                  {request.type}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canAddProposal && (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 hover:-translate-y-0.5" 
              onClick={() => setShowProposalModal(true)}
            >
              <FiPlus size={16} />
              Add Proposal
            </button>
          )}
          {canConvert && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              onClick={handleConvert}
              disabled={converting}
            >
              <FiRepeat size={16} className={converting ? 'animate-spin' : ''} />
              {converting ? 'Converting...' : 'Convert to Order'}
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column (Main Info & Timeline) */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
            
            {/* Request Details Card */}
            <div className="bg-white dark:bg-[#0d1936] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <FiFileText size={16} />
                  </div>
                  Request Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{request.name || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{request.type || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Due Date</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(request.targetDueDate)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created By</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <FiUser size={12} />
                      </div>
                      {request.createdBy?.name || request.clientName || '—'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</span>
                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[80px]">
                      {request.description || <span className="italic text-slate-400">No description provided.</span>}
                    </div>
                  </div>
                </div>

                {/* Reference Files */}
                {request.originalReferenceFiles && request.originalReferenceFiles.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Reference Files</span>
                    <div className="flex flex-col gap-2">
                      {request.originalReferenceFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 group hover:border-brand-primary/30 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                              <FiPaperclip size={14} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.fileName || `File ${idx + 1}`}</span>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white rounded-lg transition-colors shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiExternalLink size={12} /> View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Proposals Timeline */}
            <div className="bg-white dark:bg-[#0d1936] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <FiMessageSquare size={16} />
                  </div>
                  Proposals &amp; Negotiation
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {request.proposals?.length || 0} proposal(s)
                </span>
              </div>
              <div className="p-6">
                {(!request.proposals || request.proposals.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                      <FiMessageSquare size={24} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      No proposals yet. {isAdmin ? 'Submit the first proposal.' : 'Waiting for admin proposal.'}
                    </span>
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 pb-4">
                    {request.proposals.map((proposal, idx) => {
                      const isAdminProposal = proposal.proposedBy?.role === 'ADMIN' || proposal.proposedBy?.role === 'MODERATOR';

                      return (
                        <div key={proposal._id || idx} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[33px] sm:-left-[41px] top-4 w-4 h-4 rounded-full border-4 border-white dark:border-[#0d1936] ${isAdminProposal ? 'bg-indigo-500' : 'bg-emerald-500'} shadow-sm`}></div>
                          
                          {/* Proposal Card */}
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                            {/* Card Header */}
                            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/80">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isAdminProposal ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                  {proposal.proposedBy?.name ? proposal.proposedBy.name.charAt(0).toUpperCase() : (isAdminProposal ? 'A' : 'C')}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {proposal.proposedBy?.name || 'Unknown'}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${isAdminProposal ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                      {isAdminProposal ? 'Admin' : 'Client'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <FiClock size={12} />
                                {formatDate(proposal.createdAt)}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                              <div className="flex flex-wrap gap-6 mb-4">
                                {proposal.amount !== undefined && proposal.amount !== null && (
                                  <div>
                                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Proposed Amount</span>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                      {formatCurrency(proposal.amount)}
                                    </span>
                                  </div>
                                )}
                                {proposal.dueDate && (
                                  <div>
                                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Proposed Due Date</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
                                      <FiCalendar size={14} className="text-slate-400" />
                                      {formatDate(proposal.dueDate)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {proposal.requiredDocs && proposal.requiredDocs.length > 0 && (
                                <div className="mb-4">
                                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Required Documentation</span>
                                  <div className="flex flex-wrap gap-2">
                                    {proposal.requiredDocs.map((doc, i) => (
                                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium">
                                        {doc}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {proposal.remarks && (
                                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 relative">
                                  <div className="absolute top-4 left-4 text-slate-200 dark:text-slate-800 text-3xl font-serif leading-none">"</div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 relative z-10 pl-6 italic">
                                    {proposal.remarks}
                                  </p>
                                </div>
                              )}

                              {proposal.referenceFiles && proposal.referenceFiles.length > 0 && (
                                <div>
                                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Attached Files</span>
                                  <div className="flex flex-col gap-2">
                                    {proposal.referenceFiles.map((file, i) => (
                                      <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                                            <FiPaperclip size={12} />
                                          </div>
                                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.fileName}</span>
                                        </div>
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors shrink-0">
                                          <FiExternalLink size={14} />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="flex flex-col gap-6 lg:gap-8">
            
            {/* Status Flow Card */}
            <div className="bg-white dark:bg-[#0d1936] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <FiRepeat size={16} />
                  </div>
                  Status Flow
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
                  
                  {statusSteps.map((step) => {
                    const isCurrent = request.status === step.key;
                    const isCompleted = (
                      step.key === 'PENDING_ADMIN' && ['PENDING_CLIENT', 'CONVERTED'].includes(request.status)
                    ) || (
                      step.key === 'PENDING_CLIENT' && request.status === 'CONVERTED'
                    );

                    let iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                    let borderClass = 'border-transparent';
                    if (isCompleted) iconBg = 'bg-brand-primary text-white';
                    if (isCurrent) {
                      iconBg = 'bg-white dark:bg-slate-900 text-brand-primary border-2 border-brand-primary';
                      borderClass = 'border-brand-primary shadow-sm shadow-brand-primary/20';
                    }

                    return (
                      <div key={step.key} className={`flex items-center gap-4 p-3 rounded-xl border ${borderClass} ${isCurrent ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg} z-10`}>
                          {isCompleted ? <FiCheckCircle size={14} /> : step.icon}
                        </div>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-brand-primary font-bold' : (isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500')}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}

                  {request.status === 'CANCELED' && (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-sm shadow-rose-500/20 mt-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-rose-500 text-white z-10">
                        <FiXCircle size={14} />
                      </div>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Canceled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white dark:bg-[#0d1936] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FiUsers size={16} />
                  </div>
                  Quick Info
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Proposals</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{request.proposals?.length || 0}</span>
                  </div>
                  {request.proposals && request.proposals.length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Latest Amount</span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(request.proposals[request.proposals.length - 1]?.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Latest Due Date</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
                          <FiCalendar size={14} className="text-slate-400" />
                          {formatDate(request.proposals[request.proposals.length - 1]?.dueDate)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Proposal Modal */}
      {showProposalModal && (
        <AddProposalModal
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          requestId={id}
          userRole={authUser?.role}
          onProposalAdded={handleProposalAdded}
        />
      )}
    </div>
  );
};

export default OrderRequestDetailPage;
