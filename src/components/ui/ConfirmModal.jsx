import React from 'react';

export default function ConfirmModal({ open, title = 'Confirm', message = '', onConfirm = () => {}, onCancel = () => {} }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm-box">
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>

      <style jsx>{`
        .confirm-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(2,6,23,0.6);
          z-index: 10000;
          padding: 20px;
        }
        .confirm-box {
          width: 100%;
          max-width: 520px;
          background: #ffffff; /* White themed box */
          color: #0f172a; /* Dark text */
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 8px 30px rgba(2,6,23,0.35);
        }
        .confirm-title { margin: 0 0 8px 0; font-size: 18px; font-weight: 700; }
        .confirm-message { margin: 0 0 18px 0; color: #334155; line-height: 1.4; }
        .confirm-actions { display:flex; gap: 10px; justify-content: flex-end; }
        .btn { padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
        .btn-cancel { background: transparent; color: #334155; border: 1px solid #e6eef8; }
        .btn-confirm { background: #ef4444; color: white; }
        @media (max-width: 480px) {
          .confirm-box { padding: 16px; }
          .confirm-actions { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
