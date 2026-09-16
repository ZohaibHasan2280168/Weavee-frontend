import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiShield, FiDatabase, FiServer, FiShare2, FiTrash2, FiMail } from 'react-icons/fi';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#070e20] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-3xl h-[85vh] bg-white/90 dark:bg-white dark:bg-[#091128]/90 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800/60 gap-4">
          <button 
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={14} />
            Back
          </button>

          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-2">
              <FiLock className="text-indigo-400" size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last updated: July 2026</p>
          </div>
          
          <div className="w-20 hidden sm:block"></div> {/* Spacer for center alignment */}
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-6 custom-scrollbar text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          
          <section className="border-l-2 border-indigo-500 pl-4 py-1 bg-indigo-500/5 rounded-r-lg">
            <h2 className="text-base font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <FiDatabase size={16} />
              1. Data We Collect
            </h2>
            <ul className="space-y-3 ml-2">
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-slate-800 dark:text-slate-200 font-medium shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">Account Data</span> 
                <span>Name, email address, and business contact details.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-slate-800 dark:text-slate-200 font-medium shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">Client Data</span> 
                <span>Names, contact details, and project/measurement specifications of your clients.</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-slate-800 dark:text-slate-200 font-medium shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">Usage Data</span> 
                <span>Information on how you interact with the app to help us improve performance.</span>
              </li>
            </ul>
          </section>

          <section className="border-l-2 border-indigo-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <FiServer size={16} />
              2. How We Use Your Data
            </h2>
            <p className="mb-2">We use the information collected to:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Enable core features (order tracking, workflow management, and data storage).</li>
              <li>Send automated notifications to you or your clients.</li>
              <li>Provide technical support and security updates.</li>
            </ul>
          </section>

          <section className="border-l-2 border-indigo-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <FiShield size={16} />
              3. Data Storage and Security
            </h2>
            <p>
              We implement industry-standard encryption to protect your data. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="border-l-2 border-indigo-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <FiShare2 size={16} />
              4. Third-Party Services
            </h2>
            <p>
              We do not sell your data to third parties. We may use third-party providers (such as cloud hosting or payment processors) to facilitate our service, only to the extent necessary for them to perform their functions.
            </p>
          </section>

          <section className="border-l-2 border-indigo-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <FiTrash2 size={16} />
              5. Data Ownership and Deletion
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>You own your data. You may export or delete your client records at any time.</li>
              <li>Upon account deletion, all personal data associated with your account will be permanently removed from our active databases within 30 days.</li>
            </ul>
          </section>

          <section className="border-l-2 border-indigo-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <FiMail size={16} />
              6. Contact Us
            </h2>
            <p>
              If you have any questions regarding these policies, please contact us at: <a href="mailto:support@weave.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">support@weave.com</a>
            </p>
          </section>

        </div>
      </div>
      
      {/* CSS for custom scrollbar hidden in normal Tailwind but you can add it via globals or a small style tag just for this if needed, but standard Tailwind standardizes custom scrollbar styling if a plugin is present. Otherwise it will gracefully degrade. */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
}
