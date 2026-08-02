import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiArrowLeft, FiPlus, FiFilter,
  FiChevronRight, FiTrash2, FiFileText,
  FiPackage, FiClock, FiCheckCircle, FiXCircle,
  FiCalendar, FiChevronDown
} from "react-icons/fi";
import api from '../../../services/reqInterceptor';
import { useAlert } from "../../../components/ui/AlertProvider";
import { useAuth } from "../../../components/context/AuthContext";
import CreateOrderRequestModal from "../../../components/modals/CreateOrderRequestModal";

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const OrderRequestsPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { showAlert } = useAlert();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      const dataObj = res.data;
      let requestsArray = [];
      if (Array.isArray(dataObj)) {
        requestsArray = dataObj;
      } else if (dataObj && Array.isArray(dataObj.data)) {
        requestsArray = dataObj.data;
      } else if (dataObj && Array.isArray(dataObj.requests)) {
        requestsArray = dataObj.requests;
      }
      setRequests(requestsArray);
    } catch (err) {
      console.error("Error fetching order requests:", err);
      showAlert({ title: "Error", message: "Failed to load order requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredRequests = useMemo(() => requests.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [requests, searchTerm, statusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING_ADMIN': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20';
      case 'PENDING_CLIENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20';
      case 'CANCELED': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20';
    }
  };

  const handleRequestCreated = () => {
    fetchRequests();
    showAlert({ title: "Success", message: "Order request created successfully!", type: "success" });
  };

  const statCounts = useMemo(() => ({
    total: requests.length,
    pendingAdmin: requests.filter(r => r.status === 'PENDING_ADMIN').length,
    pendingClient: requests.filter(r => r.status === 'PENDING_CLIENT').length,
    converted: requests.filter(r => r.status === 'CONVERTED').length,
  }), [requests]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden font-sans">
      
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#0d1936] border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <FiArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Order Requests
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Quote negotiation &amp; request management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(authUser?.role === 'CLIENT') && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 hover:-translate-y-0.5"
            >
              <FiPlus size={16} />
              <span>New Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0d1936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <FiFileText size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{statCounts.total}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/30">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <FiClock size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Pending Admin</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{statCounts.pendingAdmin}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <FiPackage size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Pending Client</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{statCounts.pendingClient}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <FiCheckCircle size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Converted</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{statCounts.converted}</span>
              </div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Search requests by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-48" ref={statusRef}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-brand-primary/20 shadow-sm"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                >
                  <span className="truncate">{statusFilter === 'ALL' ? 'All Status' : statusFilter.replace(/_/g, ' ')}</span>
                  <FiFilter size={14} className={isStatusOpen ? "text-brand-primary" : "text-slate-400"} />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-56 bg-white dark:bg-[#0d1936] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                      {['ALL', 'PENDING_ADMIN', 'PENDING_CLIENT', 'CONVERTED', 'CANCELED'].map(status => (
                        <div
                          key={status}
                          className={`px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                            statusFilter === status 
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => { setStatusFilter(status); setIsStatusOpen(false); }}
                        >
                          {status === 'ALL' ? 'All Status' : status.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white dark:bg-[#0d1936] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Request Details</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Target Due Date</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                          <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">Loading requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                          <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                            <FiFileText size={32} className="text-slate-300 dark:text-slate-600" />
                          </div>
                          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No requests found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr 
                        key={req._id} 
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => navigate(`/order-requests/${req._id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[280px]">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">{req.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{req.description || 'No description'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px] font-semibold">
                            {req.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                            <FiCalendar size={14} className="text-slate-400" />
                            {formatDate(req.targetDueDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusClass(req.status)}`}>
                            {req.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/order-requests/${req._id}`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                              title="View Details"
                            >
                              <FiChevronRight size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateOrderRequestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onRequestCreated={handleRequestCreated}
        />
      )}
    </div>
  );
};

export default OrderRequestsPage;
