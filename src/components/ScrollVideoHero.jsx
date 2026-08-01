import React, { useRef } from 'react';
import { ArrowDown } from 'lucide-react';

export default function ScrollVideoHero() {
  const videoRef = useRef(null);

  // Video khatam hotay hi agle section par smooth scroll karne ka function
  const handleVideoEnd = () => {
    const nextSection = document.getElementById('workflows');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manual Skip Button
  const handleSkip = () => {
    handleVideoEnd();
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      
      {/* 1. AUTOPLAY VIDEO (No Scroll Lag, Pure 60 FPS) */}
      <video
        ref={videoRef}
        src="/landing_page.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover opacity-85"
      />

      {/* Cinematic Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

      {/* 2. OVERLAY UI */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16 z-10 pointer-events-none">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center pointer-events-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-4 py-1.5 rounded-full backdrop-blur-md">
            AI Production Engine 2.0
          </span>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="text-xs text-slate-300 bg-slate-900/80 border border-slate-700/80 px-4 py-2 rounded-full hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
          >
            Skip Intro <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        {/* Hero Content */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl">
            From Raw Fabric to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500">
              Precision Delivery
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-lg md:text-xl max-w-xl font-light drop-shadow">
            DarziFlow automates garment manufacturing with stage-wise order tracking, real-time QC approvals, and factory-level precision.
          </p>
        </div>

      </div>
    </div>
  );
}
