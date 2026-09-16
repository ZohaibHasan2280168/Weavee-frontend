import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#070e20] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs to match Privacy Page */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-3xl h-[85vh] bg-white/90 dark:bg-white dark:bg-[#091128]/90 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800/60 gap-4">
          <button 
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2 cursor-pointer w-fit self-start sm:self-auto"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={14} />
            Back
          </button>

          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-300 shadow-inner">
              <FiFileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Terms of Service</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please read these terms carefully</p>
          </div>
          
          <div className="w-20 hidden sm:block"></div> {/* Spacer for center alignment */}
        </div>

        {/* Structured Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto pr-3 space-y-6 mt-6 custom-scrollbar text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          <div className="border-l-2 border-purple-500 pl-4 py-1 bg-purple-500/5 rounded-r-lg">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Weave (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
            </p>
          </div>

          <div className="border-l-2 border-purple-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">2. Description of Service</h2>
            <p>
              Weave provides a digital management platform for garment manufacturing. We act solely as a software provider; we are not responsible for the quality of physical manufacturing services, fabric handling, or transactions between manufacturers and their clients.
            </p>
          </div>

          <div className="border-l-2 border-purple-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for maintaining the security of your account and password.</li>
              <li>Weave is not liable for any loss or damage arising from your failure to protect your login credentials.</li>
            </ul>
          </div>

          <div className="border-l-2 border-purple-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">4. Payments and Subscriptions</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Certain features require a paid subscription. All fees are non-refundable unless required by law.</li>
              <li>Failure to pay subscription fees may result in the suspension of access to your data.</li>
            </ul>
          </div>

          <div className="border-l-2 border-purple-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">5. Prohibited Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Use the Service for any illegal activities.</li>
              <li>Attempt to hack, reverse-engineer, or disrupt the Service.</li>
              <li>Store sensitive data that violates the privacy of your clients without their consent.</li>
            </ul>
          </div>

          <div className="border-l-2 border-purple-500 pl-4 py-1">
            <h2 className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-2">6. Limitation of Liability</h2>
            <p>
              Weave is provided "as is." We are not liable for any business interruptions, loss of client data, or financial losses resulting from the use or inability to use the app.
            </p>
          </div>

        </div>
      </div>

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
