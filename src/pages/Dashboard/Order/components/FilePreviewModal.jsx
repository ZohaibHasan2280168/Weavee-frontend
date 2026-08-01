import { FiDownload, FiX, FiFileText,FiExternalLink } from 'react-icons/fi';

const FilePreviewModal = ({ previewDoc, onClose, onDownload }) => {
  if (!previewDoc) return null;

  const { fileUrl, docType } = previewDoc;

  const getDocumentPreview = () => {
    if (!fileUrl) {
      return (
        <div className="preview-empty">
          <FiFileText size={48} />
          <p>No document uploaded</p>
        </div>
      );
    }

    if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={fileUrl || "/placeholder.svg"} alt="Document preview" className="preview-image" />;
    }

    if (fileUrl.match(/\.(mp4|webm|mov)$/i)) {
      return (
        <video controls className="preview-video">
          <source src={fileUrl} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileUrl.match(/\.pdf$/i)) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          title="PDF preview"
          className="preview-iframe"
        />
      );
    }

    return (
      <div className="preview-empty">
        <FiExternalLink size={48} />
        <p>Preview not available</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
          Open document in new tab
        </a>
      </div>
    );
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{docType?.replace(/_/g, ' ') || 'File Preview'}</h3>
            <p className="modal-subtitle">Document Preview</p>
          </div>
          <div className="modal-controls">
            {fileUrl && (
              <button
                onClick={() => onDownload(fileUrl, docType)}
                className="control-btn download-btn"
                title="Download"
              >
                <FiDownload size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="control-btn close-btn"
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
        <div className="modal-body">{getDocumentPreview()}</div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
