"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi"

export default function LoginForm({ onSubmit, isLoading = false }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isLoading) {
      onSubmit(credentials)
    }
  }

  return (
    <form className="space-y-3.5 w-full" onSubmit={handleSubmit}>
      {/* Email */}
      <div className="relative flex items-center w-full">
        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          value={credentials.email}
          onChange={handleChange}
          style={{ paddingLeft: '2.75rem' }}
          className="w-full !pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-[#060d20]/80 text-slate-900 dark:text-white placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
        />
      </div>

      {/* Password */}
      <div>
        <div className="relative flex items-center w-full">
          <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            value={credentials.password}
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
        <div className="text-right mt-1">
          <Link to="/forgot-password" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-600 dark:text-purple-300 transition-colors">Forgot password?</Link>
        </div>
      </div>

      {/* Submit */}
      <button 
        type="submit" 
        className={`w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer active:scale-[0.98] ${isLoading ? 'opacity-70 pointer-events-none' : ''}`} 
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}
