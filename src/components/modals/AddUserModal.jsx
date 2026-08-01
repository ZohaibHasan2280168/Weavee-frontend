"use client"

import { useState } from "react"

export default function AddUserModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password || !form.role) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setForm({ name: "", email: "", password: "", role: "" })
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError("Failed to add user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-container">
        <div className="modal-bg-gradient"></div>
        <div className="modal-blur-element"></div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">Add New User</h2>
            <p className="modal-subtitle">Fill in the details below to add a new team member</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Error Message */}
            {error && (
              <div className="form-error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="form-success">
                <span className="success-icon">✓</span>
                <p>User added successfully!</p>
              </div>
            )}

            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Role Select */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className="form-input form-select"
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
                <option value="QA">QA</option>
                <option value="Moderator">Moderator</option>
                <option value="QC_OFFICER">QC Officer</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="form-buttons">
              <button type="button" onClick={onClose} disabled={loading} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Adding...
                  </>
                ) : (
                  "Add User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-50;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-backdrop:hover {
          background: rgba(0, 0, 0, 0.6);
        }

        .modal-container {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 450px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-bg-gradient {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .modal-blur-element {
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .modal-content {
          position: relative;
          z-index: 2;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: #fca5a5;
          animation: slideDown 0.3s ease-out;
        }

        .form-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: #86efac;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-icon,
        .success-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .form-error p,
        .form-success p {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: #cbd5e1;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #e2e8f0;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-input:hover:not(:disabled) {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.07);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }

        .form-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-cancel,
        .btn-submit {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          outline: none;
        }

        .btn-cancel {
          background: rgba(99, 102, 241, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-2px);
        }

        .btn-cancel:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-submit {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .spinner-small {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .modal-container {
            width: 95%;
            padding: 1.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .form-buttons {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
