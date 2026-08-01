import { useState, useEffect, useRef } from "react"
import { Bell, Lock, Globe, Palette } from "lucide-react"

const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-48" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white dark:bg-[#0a1128] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all cursor-pointer shadow-sm flex justify-between items-center"
      >
        <span>{value}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col py-1">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 ${value === option ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: "Friends Only",
    language: "English",
    profilePicture: true,
    dataCollection: false,
  })

  useEffect(() => {
    // Keeping the original logic intact for theme
    document.body.setAttribute("data-theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const settingsCategories = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Theme",
          description: "Choose your preferred color scheme",
          type: "toggle",
          key: "theme",
          value: theme === "dark",
          action: toggleTheme,
          badge: theme === "dark" ? "Dark" : "Light",
        },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Lock,
      items: [
        {
          label: "Account Privacy",
          description: "Control who can see your profile",
          type: "select",
          key: "privacy",
          value: settings.privacy,
          options: ["Public", "Friends Only", "Private"],
          onChange: (value) => handleSettingChange("privacy", value),
        },
        {
          label: "Show Profile Picture",
          description: "Display your profile picture publicly",
          type: "toggle",
          key: "profilePicture",
          value: settings.profilePicture,
          onChange: () => handleSettingChange("profilePicture", !settings.profilePicture),
        },
      ],
    },
    {
      title: "Notifications & Data",
      icon: Bell,
      items: [
        {
          label: "Email Notifications",
          description: "Receive updates and alerts via email",
          type: "toggle",
          key: "notifications",
          value: settings.notifications,
          onChange: () => handleSettingChange("notifications", !settings.notifications),
        },
        {
          label: "Data Collection",
          description: "Help us improve by sharing usage data",
          type: "toggle",
          key: "dataCollection",
          value: settings.dataCollection,
          onChange: () => handleSettingChange("dataCollection", !settings.dataCollection),
        },
      ],
    },
    {
      title: "Preferences",
      icon: Globe,
      items: [
        {
          label: "Language",
          description: "Select your preferred language",
          type: "select",
          key: "language",
          value: settings.language,
          options: ["English", "Urdu", "Spanish", "French", "German"],
          onChange: (value) => handleSettingChange("language", value),
        },
      ],
    },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 font-sans w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account and preferences</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {settingsCategories.map((category, idx) => {
          const IconComponent = category.icon
          return (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#0d1936] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">
                <div className="w-10 h-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl shadow-sm">
                  <IconComponent size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{category.title}</h2>
              </div>

              {/* Category Items */}
              <div className="flex flex-col p-2 sm:p-4">
                {category.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <label className="block text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        {item.label}
                      </label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    {/* Item Control */}
                    <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
                      {item.type === "toggle" && (
                        <button
                          onClick={item.action || item.onChange}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                            item.value ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          aria-label={`Toggle ${item.label}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              item.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}

                      {item.type === "select" && (
                        <CustomSelect
                          value={item.value}
                          options={item.options}
                          onChange={item.onChange}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
