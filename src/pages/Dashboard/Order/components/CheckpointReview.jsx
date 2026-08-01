// CheckpointReview.jsx
import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CheckpointReview = ({
  checkpoint,
  operationId,
  orderId,
  onApprove,
  onReject,
  onFinalApprove,
  onPreview
}) => {
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(checkpoint._id, operationId, "Approved by QC/Admin");
    } finally {
      setLoading(false);
    }
  };



  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a rejection comment');
      return;
    }

    setLoading(true);
    try {
      await onReject(checkpoint._id, operationId, rejectComment);
      setShowRejectInput(false);
      setRejectComment('');
    } finally {
      setLoading(false);
    }
  };

  const shouldShowSubmission = checkpoint.status === 'SUBMITTED';

  if (!shouldShowSubmission) return null;

  return (
    <div className="checkpoint-review-section">
      <div className="review-section-header">
        <h4>Review Submission</h4>
        <span className="review-badge submitted-badge">
          Awaiting QC Review
        </span>
      </div>

      {/* Review Actions - Show different buttons based on status */}
      <div className="review-actions">
        {checkpoint.status === 'SUBMITTED' ? (
          <>
            <button
              className="action-btn approve-btn"
              onClick={handleApprove}
              disabled={loading}
            >
              Approve QC
            </button>

            <div className="reject-section">
              {showRejectInput ? (
                <div className="reject-input-group">
                  <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="reject-textarea"
                    rows={3}
                  />
                  <div className="reject-input-actions">
                    <button
                      className="action-btn confirm-reject-btn"
                      onClick={handleReject}
                      disabled={loading || !rejectComment.trim()}
                    >
                      Confirm Reject
                    </button>
                    <button
                      className="action-btn cancel-reject-btn"
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectComment('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="action-btn reject-btn"
                  onClick={() => setShowRejectInput(true)}
                  disabled={loading}
                >
                  Reject
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CheckpointReview;
