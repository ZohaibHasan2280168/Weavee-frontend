import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiDownload as Download,
  FiEye as Eye,
  FiUpload as Upload,
  FiCheck as CheckCircle2,
  FiFileText as FileText,
  FiX as X,
  FiPlay as Zap,
  FiTag,
  FiDollarSign,
  FiInfo,
  FiImage,
  FiVideo,
  FiFile,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiCalendar,
  FiClock,
  FiAlignLeft,
  FiActivity,
} from 'react-icons/fi';
import api from '../../../services/reqInterceptor';
import Loader from '../../../components/ui/Loader';
import { toast } from 'react-hot-toast';
import WorkflowSection from './components/WorkflowSection';
import FilePreviewModal from './components/FilePreviewModal';
import uploadToCloudinary from '../../../utils/uploadToCloudinary';
import { getFileIcon } from '../../../utils/fileUtils';


const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [activeDeptIndex, setActiveDeptIndex] = useState(0);
  const [checkpointPreview, setCheckpointPreview] = useState(null);


  const statusColor = {
    UPLOADED: 'status-uploaded',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    PENDING: 'status-pending',
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/order/${orderId}`);
      const orderData = res.data.order || res.data;
      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load order details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  //final approve checkpoint (new API integration)
  const handleFinalApproveCheckpoint = async (checkpointId, operationId) => {
    try {
      await api.patch(
        `/checkpoints/${orderId}/workflow/${operationId}/checkpoints/${checkpointId}/final-approve`
      );
      toast.success('Department Final Approved');
      fetchOrderDetails();
    } catch (err) {
      toast.error('Failed to finalize department');
      throw err;
    }
  };

  // NOTE: Department-head/admin submission flows removed per new requirements.

  const handleFileUpload = async (e, docType) => {

    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(docType);

    try {

      const uploaded = await uploadToCloudinary(
        file,
        orderId,
        "prerequisite"
      );

      await api.post(
        `/workflow/${orderId}/prerequisites/${docType}`,
        uploaded
      );

      toast.success(`${docType.replace(/_/g, " ")} uploaded successfully`);
      await fetchOrderDetails();

    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingDoc(null);
    }

  };

  const handleDownload = async (url, fileName) => {
    try {
      setDocumentLoading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleDocAction = async (docType, action) => {
    setActionLoading(true);
    try {
      await api.patch(
        `/workflow/${orderId}/prerequisite/${docType}/${action}`
      );
      toast.success(`Document ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchOrderDetails();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };


  const getStatusStyle = (status) => {
    return statusColor[status] || 'status-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] p-6 md:p-10 font-sans text-slate-900 dark:text-slate-200 transition-colors duration-200">
      {/* File Preview Modals */}
      <FilePreviewModal
        previewDoc={previewDoc} // same logic, previewDoc can be { fileUrl: string, docType: string }
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />

      <FilePreviewModal
        previewDoc={checkpointPreview} // already a file object from Cloudinary
        onClose={() => setCheckpointPreview(null)}
        onDownload={handleDownload}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20" title={order?.uniqueId}>
                {truncateId(order?.uniqueId)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{order?.name}</h1>
          </div>
        </div>
        {order?.overallStatus === 'READY_TO_START' && (
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            onClick={() =>
              api.put(`/workflow/${orderId}/start-workflow`).then(fetchOrderDetails)
            }
          >
            <Zap size={18} />
            <span>Start Production</span>
          </button>
        )}
      </div>

      {/* ORDER STATS SECTION */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <FiActivity size={22} className="text-blue-500" />
            <h2 className="text-xl font-bold tracking-wide">Order Stats</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-500/20 text-purple-400">
              <FiTag size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order?.type || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-emerald-500/20 text-emerald-400">
              <FiDollarSign size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quote:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {order?.currency && order?.amount
                  ? `${order.currency} ${order.amount}`
                  : 'Not set'}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-500/20 text-blue-400">
              <FiInfo size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {order?.overallStatus?.replace(/_/g, ' ') || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-amber-500/20 text-amber-400">
              <FiCalendar size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(order?.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-pink-500/20 text-pink-400">
              <FiClock size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(order?.dueDate)}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-indigo-500/20 text-indigo-400">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">QC Member:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order?.qcMember?.name || 'Not Assigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT DETAILS SECTION */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <FiUser size={22} className="text-emerald-500" />
            <h2 className="text-xl font-bold tracking-wide">Client Details</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-cyan-500/20 text-cyan-400">
              <FiUser size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client Name:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order?.clientName || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-rose-500/20 text-rose-400">
              <FiMail size={20} />
            </div>
            <div className="flex flex-col gap-1 mt-auto">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client Email:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order?.clientEmail || 'N/A'}</span>
            </div>
          </div>

          {order?.description && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-3">
                <FiAlignLeft size={18} className="text-blue-500 dark:text-blue-400" />
                <span>Description</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">{order.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* PREREQUISITE DOCUMENTS SECTION */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
            <FileText size={22} className="text-amber-500" />
            Required Documents
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium bg-white dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
            <span className="text-slate-900 dark:text-white font-bold">{order?.requiredDocuments?.filter((d) => d.status === 'APPROVED').length || 0}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-bold">{order?.requiredDocuments?.length || 0}</span> documents approved
          </p>
        </div>

        {order?.requiredDocuments && order?.requiredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {order?.requiredDocuments.map((doc) => (
              <div key={doc.docType} className="relative w-full flex flex-col rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden transition-all duration-300 hover:border-blue-500/30">
                <div className="flex items-start p-5 gap-4">
                  {/* Left Icon Area - Gradient Blue Box */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-inner">
                    {getFileIcon(doc.fileUrl)}
                  </div>
                  
                  {/* Right Content Area */}
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col items-start gap-2">
                        <h3 className="text-[17px] font-bold text-slate-800 dark:text-white tracking-wide">
                          {doc.docType.replace(/_/g, ' ')}
                        </h3>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                          doc.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                          doc.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          doc.status === 'REJECTED' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                          'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description text for pending uploads */}
                    {!doc.fileUrl && (doc.status === 'PENDING' || doc.status === 'REJECTED') && (
                      <div className="mt-3 flex flex-col gap-1">
                        <p className="text-[13px] text-slate-500 dark:text-slate-400">Select and upload the files of your choices</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action / Dropzone Area */}
                <div className="px-5 pb-5">
                  {doc.fileUrl ? (
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-sm" 
                        onClick={() => setPreviewDoc({
                          fileUrl: doc.fileUrl,
                          docType: doc.docType,
                          fileName: doc.docType.replace(/_/g, ' ')
                        })}
                      >
                        <Eye size={16} /> View File
                      </button>
                      <button 
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm" 
                        onClick={() => handleDownload(
                          doc.fileUrl,
                          `${doc.docType.replace(/_/g, '_')}_${new Date().getTime()}`
                        )}
                        disabled={documentLoading}
                      >
                        <Download size={16} /> {documentLoading ? '...' : 'Download'}
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full py-5 px-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all cursor-pointer group mt-2">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-3">
                        <Upload size={16} />
                        <span className="text-[11px] font-medium text-center">Drop a JPEG, PNG and MP4 format, up to 50MB</span>
                      </div>
                      <div className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold shadow-md transition-colors">
                        {uploadingDoc === doc.docType ? 'Uploading...' : 'Browse File'}
                      </div>
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, doc.docType)} 
                        disabled={uploadingDoc === doc.docType} 
                        className="hidden" 
                      />
                    </label>
                  )}

                  {doc.status === 'UPLOADED' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm"
                        onClick={() => handleDocAction(doc.docType, 'approve')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm"
                        onClick={() => handleDocAction(doc.docType, 'reject')}
                        disabled={actionLoading}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-slate-700 text-slate-500 gap-4 bg-slate-800/20">
            <FileText size={48} className="text-slate-600" />
            <p className="text-lg font-medium">No documents required for this order</p>
          </div>
        )}
      </div>

      {/* WORKFLOW SECTION */}
      {order?.workflow && order.workflow.length > 0 && (
        <WorkflowSection
          workflow={order.workflow}
          activeDeptIndex={activeDeptIndex}
          onDeptTabChange={setActiveDeptIndex}
          orderId={order._id}
          onFinalApproveCheckpoint={handleFinalApproveCheckpoint}
          onPreviewFile={(file) => setCheckpointPreview(file)}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
