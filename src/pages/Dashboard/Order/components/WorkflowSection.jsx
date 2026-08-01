import { useState, useEffect } from 'react';
import { FiLayers, FiGrid, FiActivity, FiCheckSquare, FiChevronDown, FiChevronUp, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import CheckpointItem from './CheckpointItem';
import { useAuth } from '../../../../components/context/AuthContext';


const WorkflowSection = ({
  workflow,
  activeDeptIndex,
  onDeptTabChange,
  orderId,
  onFinalApproveCheckpoint,
  onPreviewFile,
}) => {
  const { user } = useAuth();
  const [expandedOperations, setExpandedOperations] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get status style
  const getStatusStyle = (status) => {
    const statusColor = {
      UPLOADED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      APPROVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
      PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return statusColor[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  const activeDept = workflow[activeDeptIndex];

  // Initialize expanded operations based on status
  useEffect(() => {
    if (activeDept?.operations) {
      const initialExpanded = {};
      activeDept.operations.forEach((operation, index) => {
        // Expand current operation (IN_PROGRESS or first PENDING)
        if (operation.status === 'IN_PROGRESS') {
          initialExpanded[index] = true;
        } else if (operation.status === 'PENDING' && 
                  !activeDept.operations.some(op => op.status === 'IN_PROGRESS') &&
                  !Object.values(initialExpanded).some(val => val)) {
          // Expand first PENDING if no IN_PROGRESS exists
          initialExpanded[index] = true;
        } else if (operation.status === 'COMPLETED') {
          // Collapse completed operations by default
          initialExpanded[index] = false;
        } else {
          initialExpanded[index] = false;
        }
      });
      setExpandedOperations(initialExpanded);
    }
  }, [activeDept]);

  const toggleOperationExpansion = (index) => {
    setExpandedOperations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Calculate operation progress
  const calculateOperationProgress = (operation) => {
    if (!operation.checkpoints || operation.checkpoints.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = operation.checkpoints.filter(
      cp => cp.status === 'COMPLETED' || cp.status === 'APPROVED'
    ).length;
    const total = operation.checkpoints.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const allOperationsCompleted = activeDept?.operations?.every(op => op.status === 'COMPLETED') || false;
  
  let lastOperationId = null;
  let lastCheckpointId = null;
  
  if (activeDept?.operations?.length > 0) {
    const lastOp = activeDept.operations[activeDept.operations.length - 1];
    lastOperationId = lastOp._id;
    if (lastOp.checkpoints?.length > 0) {
      lastCheckpointId = lastOp.checkpoints[lastOp.checkpoints.length - 1]._id;
    }
  }

  const showFinalApprove = user?.role === 'ADMIN' && 
                           allOperationsCompleted && 
                           activeDept?.status === 'IN_PROGRESS' && 
                           lastOperationId && lastCheckpointId;

  const handleDepartmentFinalApprove = async () => {
    if (!window.confirm("Are you sure you want to grant final approval for this department?")) return;
    setIsProcessing(true);
    try {
      await onFinalApproveCheckpoint(lastCheckpointId, lastOperationId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 text-xl font-bold text-white">
          <FiLayers size={24} className="text-purple-500" />
          <h2>Workflow</h2>
        </div>
        <p className="text-sm text-slate-400 font-medium bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-white font-bold">{workflow.length}</span> department{workflow.length > 1 ? 's' : ''} in pipeline
        </p>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {workflow.map((dept, index) => (
          <button
            key={dept._id || index}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
              index === activeDeptIndex 
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
            onClick={() => onDeptTabChange(index)}
          >
            {dept.departmentName}
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusStyle(dept.status)}`}>
              {dept.status?.charAt(0)}
            </span>
          </button>
        ))}
      </div>

      {/* Active Department Content */}
      {activeDept && (
        <div className="flex flex-col p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 shadow-lg">
          {/* Department Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                <FiGrid size={22} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-100">{activeDept.departmentName}</h3>
                <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700" title={activeDept.departmentId}>
                  ID: {truncateId(activeDept.departmentId)}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-xs uppercase font-bold tracking-wider border ${getStatusStyle(activeDept.status)}`}>
              {activeDept.status?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Operations - Now Expandable */}
          {activeDept.operations && activeDept.operations.length > 0 && (
            <div className="flex flex-col gap-4">
              {activeDept.operations.map((operation, operationIndex) => {
                const progress = calculateOperationProgress(operation);
                const isExpanded = expandedOperations[operationIndex];
                
                return (
                  <div key={operation._id} className="flex flex-col rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-hidden transition-all duration-200 hover:border-slate-600">
                    {/* Operation Header - Clickable for Expansion */}
                    <div 
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => toggleOperationExpansion(operationIndex)}
                    >
                      <div className="flex-1 flex items-center gap-4 w-full">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                          <FiActivity size={18} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-200 font-semibold text-sm">{operation.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border inline-block w-max sm:hidden ${getStatusStyle(operation.status)}`}>
                            {operation.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 ml-auto sm:ml-0 flex-1 max-w-[150px] hidden sm:flex">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {progress.completed}/{progress.total} Checkpoints
                          </span>
                          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="flex flex-col gap-1.5 flex-1 max-w-[150px] sm:hidden">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {progress.completed}/{progress.total} Checkpoints
                          </span>
                          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border hidden sm:block ${getStatusStyle(operation.status)}`}>
                          {operation.status?.replace(/_/g, ' ')}
                        </span>
                        <button 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOperationExpansion(operationIndex);
                          }}
                        >
                          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Checkpoints Container - Collapsible */}
                    {isExpanded && operation.checkpoints && operation.checkpoints.length > 0 && (
                      <div className="p-4 pt-0 border-t border-slate-700/50 bg-slate-900/40">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-4">
                          <FiCheckSquare size={14} />
                          <span>Checkpoints ({operation.checkpoints.length})</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {operation.checkpoints.map((checkpoint) => (
                              <CheckpointItem
                                key={checkpoint._id}
                                checkpoint={checkpoint}
                                operationId={operation._id}
                                orderId={orderId}
                                onFinalApprove={onFinalApproveCheckpoint}
                                onPreviewFile={onPreviewFile}
                              />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Final Approve Button (Admin Only, when all ops are completed) */}
          {showFinalApprove && (
            <div className="mt-5 p-5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h4 className="text-slate-200 font-bold m-0 text-lg">Department Completed</h4>
                <p className="text-slate-400 text-sm m-0">All operations have passed QC. Grant final approval to send to the client.</p>
              </div>
              <button 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                onClick={handleDepartmentFinalApprove}
                disabled={isProcessing}
              >
                <FiCheckCircle size={18} />
                {isProcessing ? 'Processing...' : 'Final Approve Department'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowSection;
