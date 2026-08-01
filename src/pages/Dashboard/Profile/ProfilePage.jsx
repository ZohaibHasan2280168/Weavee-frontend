import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaArrowLeft, FaCheck, FaCamera } from "react-icons/fa"
import { useAlert } from '../../../components/ui/AlertProvider'
import api from "../../../services/reqInterceptor"
import { useAuth } from "../../../components/context/AuthContext"
import { uploadAvatarToCloudinary } from "../../../utils/uploadToCloudinary"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { setMustChangePassword, updateAvatar } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordMsgType, setPasswordMsgType] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile`)
        setUser(res.data)
      } catch (err) {
        setError(err.response?.data?.msg || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg("")

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("New passwords do not match")
      setPasswordMsgType("error")
      return
    }

    try {
        const res = await api.put("/profile/password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      })

      showAlert({ title: 'Success', message: res.data.msg || 'Password updated', type: 'success' })
      setMustChangePassword(false)
      navigate("/dashboard")

      setPasswordMsg("")
      setPasswordMsgType("")
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to change password"
      showAlert({ title: 'Error', message: msg, type: 'error' })
      setPasswordMsg(msg)
      setPasswordMsgType("error")
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      showAlert({ title: "Invalid File", message: "Please select a JPEG, PNG, GIF, or WebP image.", type: "error" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert({ title: "File Too Large", message: "Image must be under 5MB.", type: "error" })
      return
    }

    setUploading(true)
    try {
      const { url, publicId } = await uploadAvatarToCloudinary(file)
      await api.put("/profile/avatar", { url, publicId })
      updateAvatar({ url, publicId })
      setUser((prev) => ({ ...prev, avatar: { url, publicId } }))
      showAlert({ title: "Success", message: "Profile picture updated.", type: "success" })
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Failed to upload profile picture"
      showAlert({ title: "Error", message: msg, type: "error" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-700 dark:text-slate-300">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-[#0d1936] p-6 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm">
          <p className="text-red-500 font-semibold text-lg">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 font-sans w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-[#0d1936] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-6 sm:p-10 transition-colors duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-semibold text-sm"
          >
            <FaArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Profile Section */}
        <div className="text-center mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="relative inline-block mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 mx-auto transition-transform group-hover:scale-105 duration-300">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <FaUser size={48} className="text-white" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer border-4 border-white dark:border-[#0d1936] shadow-md hover:scale-110 transition-transform duration-200" title="Upload profile picture">
              <FaCamera size={16} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name || "User"}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{user?.email || "email@example.com"}</p>
        </div>

        {/* Password Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-6">
            <FaLock className="text-purple-600 dark:text-purple-400 text-xl" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-sm">
                <FaLock className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-sm">
                <FaLock className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-sm">
                <FaLock className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              <FaCheck size={14} />
              Update Password
            </button>

            {passwordMsg && (
              <div
                className={`mt-2 px-4 py-3 rounded-xl text-sm font-medium text-center border ${
                  passwordMsgType === "success" 
                    ? "bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
                    : "bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                }`}
              >
                {passwordMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
