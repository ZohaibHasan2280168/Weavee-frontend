// CheckpointItem.jsx
import { useState } from 'react';
import { useEffect } from 'react';
import { FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi';
// toast removed; parent handles toasts

// Helper: simple history timeline stays

// History Timeline Component
const HistoryTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 bg-slate-800/30 p-4 rounded-xl mt-2 border border-slate-700/50">
        <FiClock size={16} />
        <span className="text-sm font-medium">No history available</span>
      </div>
    );
  }

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'SUBMIT': return 'bg-blue-500/20 text-blue-400 border border-blue-500/20';
      case 'APPROVE': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20';
      case 'REJECT': return 'bg-red-500/20 text-red-400 border border-red-500/20';
      case 'FINAL_APPROVE': return 'bg-purple-500/20 text-purple-400 border border-purple-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/20';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative flex flex-col gap-6 pl-4 pt-4 mt-2">
      <div className="absolute left-[23px] top-4 bottom-0 w-px bg-slate-700/50" />
      {sortedHistory.map((entry, index) => (
        <div key={index} className="relative pl-8">
          <div className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-900" />
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getActionBadgeColor(entry.action)}`}>
                  {entry.action.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  <FiUser size={12} className="text-slate-400" />
                  <span className="font-medium">{entry.actedBy || 'System'}</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <FiClock size={12} />
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
            {entry.comment && (
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-3.5 rounded-lg text-sm text-slate-300 border border-slate-700/50">
                <FiMessageSquare size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="m-0 leading-relaxed">{entry.comment}</p>
              </div>
            )}
            {entry.files && entry.files.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Files: {entry.files.length}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CheckpointItem = ({
  checkpoint,
  operationId,
  orderId,
  onFinalApprove,
  onPreviewFile,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent background scroll and layout shift when modal is open
  useEffect(() => {
    if (showConfirm) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      // lock body scroll and preserve scrollbar space to avoid layout shift
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
      // add modal-open class to root to disable background hover/interaction
      document.documentElement.classList.add('modal-open');
    } else {
      // restore
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.classList.remove('modal-open');
    };
  }, [showConfirm]);

  const getCheckpointStatusColor = (status) => {
    return status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
  };

  const getStatusBadgeVariant = (status) => {
    return status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  return (
    <div className="flex flex-col bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getCheckpointStatusColor(checkpoint.status)}`} />
          <span className="font-semibold text-slate-200 text-sm">{checkpoint.name}</span>
          {checkpoint.status === 'COMPLETED' && (
            <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={16} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getStatusBadgeVariant(checkpoint.status)}`}>
            {checkpoint.status === 'COMPLETED' ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      {/* History Audit Trail Section */}
      {checkpoint.history && checkpoint.history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <button 
            className="flex items-center gap-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
            onClick={() => setShowHistory(!showHistory)}
          >
            <span>View History ({checkpoint.history.length})</span>
            {showHistory ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          
          {showHistory && (
            <div className="mt-2">
              <HistoryTimeline history={checkpoint.history} />
            </div>
          )}
        </div>
      )}

      {/* Allowed Submission Types */}
      {checkpoint.allowedSubmissionTypes && checkpoint.allowedSubmissionTypes.length > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50 flex-wrap">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Allowed Types:</span>
          {checkpoint.allowedSubmissionTypes.map((type, typeIndex) => (
            <span key={typeIndex} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-xs font-mono border border-slate-700 shadow-sm">
              {type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckpointItem;
