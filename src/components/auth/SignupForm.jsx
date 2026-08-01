"use client"

import { useState } from "react"
import { FiEye, FiEyeOff, FiMail, FiUser, FiLock } from "react-icons/fi"

export default function SignupForm({ onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    onSubmit(formData)
  }

  return (
    <form className="space-y-3.5 w-full" onSubmit={handleSubmit}>
      {/* Name */}
      <div className="relative flex items-center w-full">
        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
        <input
          type="text"
          name="name"
          required
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          style={{ paddingLeft: '2.75rem' }}
          className="w-full !pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-[#060d20]/80 text-slate-900 dark:text-white placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
        />
      </div>

      {/* Email */}
      <div className="relative flex items-center w-full">
        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
        <input
          type="email"
          name="email"
          required
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          style={{ paddingLeft: '2.75rem' }}
          className="w-full !pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-[#060d20]/80 text-slate-900 dark:text-white placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
        />
      </div>

      {/* Password */}
      <div className="relative flex items-center w-full">
        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={{ paddingLeft: '2.75rem' }}
          className="w-full !pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-[#060d20]/80 text-slate-900 dark:text-white placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:text-purple-400 transition-colors focus:outline-none"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative flex items-center w-full">
        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          required
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{ paddingLeft: '2.75rem' }}
          className="w-full !pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-[#060d20]/80 text-slate-900 dark:text-white placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:text-purple-400 transition-colors focus:outline-none"
          onClick={() => setShowConfirmPassword((v) => !v)}
        >
          {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      {/* Submit */}
      <button 
        type="submit" 
        className={`w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer active:scale-[0.98] ${isLoading ? 'opacity-70 pointer-events-none' : ''}`} 
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  )
}
