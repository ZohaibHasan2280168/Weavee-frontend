export default function Loader({ label = "Loading..." }) {
  return (
    <div className="dashboard-loader-wrapper">
      <div className="dashboard-loader">
        <div className="spinner" />
        <p>{label}</p>
      </div>

      <style jsx>{`
        .dashboard-loader-wrapper {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85); /* slate-900 */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .dashboard-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top-color: #6366f1; /* indigo */
          animation: spin 0.8s linear infinite;
        }

        p {
          font-size: 0.95rem;
          color: #e5e7eb;
          opacity: 0.9;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
