import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';
import { toast } from 'react-hot-toast';

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });
  const [markingRead, setMarkingRead] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const actionCategories = {
    'Auth & User': ['SIGNUP', 'LOGIN', 'LOGOUT', 'CHANGE_PASSWORD', 'USER_CREATE', 'USER_DELETE', 'USER_UPDATE', 'ROLE_ASSIGN'],
    'Department & Template': ['DEPT_CREATE', 'DEPT_UPDATE', 'DEPT_DELETE', 'OP_CREATE', 'OP_UPDATE', 'OP_DELETE', 'CHK_CREATE', 'CHK_UPDATE', 'CHK_DELETE'],
    'Order Management': ['ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE', 'PREREQ_UPLOAD', 'PREREQ_APPROVE', 'PREREQ_REJECT', 'WORKFLOW_START', 'CHK_SUBMIT']
  };

  const priorityConfig = {
    info: { 
      icon: <FiInfo size={14} />, 
      colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' 
    },
    success: { 
      icon: <FiCheckCircle size={14} />, 
      colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
    },
    warning: { 
      icon: <FiAlertTriangle size={14} />, 
      colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' 
    },
    error: { 
      icon: <FiAlertCircle size={14} />, 
      colorClass: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageNumber: page,
        ...(filters.action && { action: filters.action }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(searchQuery && { search: searchQuery })
      });

      const res = await api.get(`/audit/?${params}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pages);
      setTotalLogs(res.data.total);
    } catch (err) {
      toast.error('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingRead(true);
      await api.patch('/audit/read');
      toast.success('All logs marked as read');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to mark logs as read');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await api.get('/audit/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Logs exported successfully');
    } catch (err) {
      toast.error('Failed to export logs');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionCategory = (action) => {
    for (const [category, actions] of Object.entries(actionCategories)) {
      if (actions.includes(action)) {
        return category;
      }
    }
    return 'Other';
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading && logs.length === 0) return <Loader />;

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden font-sans">
      {/* Header Section */}
      <div className="shrink-0 bg-white dark:bg-[#0d1936] border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 shadow-sm relative">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor all system activities and security events</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative flex items-center w-full sm:w-64 group">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input 
              type="text" 
              className="!pl-11 w-full pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400 shadow-sm"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm focus:ring-2 focus:ring-brand-primary/20" 
              onClick={handleExportLogs}
            >
              <FiDownload size={16} /> <span>Export</span>
            </button>
            <button 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
              onClick={handleMarkAllAsRead} 
              disabled={markingRead}
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

          <div className="bg-white dark:bg-[#0d1936] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Module</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {logs.map((log) => (
                    <React.Fragment key={log._id}>
                      <tr className={`group transition-colors ${expandedLogId === log._id ? 'bg-slate-50 dark:bg-slate-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                              <FiUser size={14} />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[150px]">
                              {log.userId?.name || 'System'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                            {getActionCategory(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${priorityConfig[log.priority]?.colorClass || 'bg-slate-100 text-slate-700'}`}>
                            {priorityConfig[log.priority]?.icon}
                            {log.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              expandedLogId === log._id 
                              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            onClick={() => toggleLogExpansion(log._id)}
                          >
                            {expandedLogId === log._id ? <><FiEyeOff size={14} /> Close</> : <><FiEye size={14} /> View</>}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedLogId === log._id && (
                        <tr className="bg-slate-50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/60 shadow-inner">
                          <td colSpan="6" className="px-6 py-6">
                            <div className="bg-slate-900 dark:bg-[#060b17] rounded-xl overflow-hidden shadow-sm border border-slate-800">
                              <div className="bg-slate-800 dark:bg-slate-900/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                  <FiFileText size={14} /> Detailed Payload
                                </span>
                              </div>
                              <div className="p-4 overflow-x-auto custom-scrollbar">
                                <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                                  {JSON.stringify(log.details || log.metadata || log, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {logs.length === 0 && !loading && (
              <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <FiFileText size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No logs found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Try adjusting your search filters to find what you're looking for.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Showing page <span className="text-slate-900 dark:text-white font-semibold">{page}</span> of <span className="text-slate-900 dark:text-white font-semibold">{totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={16} /> Prev
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
