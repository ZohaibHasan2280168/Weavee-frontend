import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import ScrollVideoHero from '../../components/ScrollVideoHero';
import { Scissors, ShieldCheck, Truck, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleStart = () => {
    navigate('/role-selection');
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen">
      
      {/* Sticky Glassmorphic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-xl">
        <div className="text-2xl font-black tracking-wider text-cyan-400 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          DARZI<span className="text-white">FLOW</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
          <a href="#flow" className="hover:text-cyan-400 transition">3D Production Flow</a>
          <a href="#workflows" className="hover:text-cyan-400 transition">Stage Workflows</a>
          <a href="#about" className="hover:text-cyan-400 transition">About</a>
          <a href="#contact" className="hover:text-cyan-400 transition">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleStart}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-cyan-500/20 text-sm"
          >
            Request Demo / Login
          </button>
        </div>
      </nav>

      {/* 1. SCROLL-DRIVEN 3D VIDEO HERO SECTION */}
      <section id="flow">
        <ScrollVideoHero />
      </section>

      {/* 2. PRODUCTION WORKFLOW STAGES */}
      <section id="workflows" className="py-28 px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Enterprise System</h2>
        <p className="text-4xl font-extrabold text-white mb-16">Smart Production Management Architecture</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md hover:border-cyan-500/50 transition duration-300">
            <Scissors className="text-cyan-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Stage 1: Precision Cut</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated pattern allocation and laser-precision fabric cutting tracking with minimal material waste.
            </p>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md hover:border-indigo-500/50 transition duration-300">
            <ShieldCheck className="text-indigo-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Stage 2: Stitch & QC Approval</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time approval workflows across Admins, Department Heads, and Quality Control teams.
            </p>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md hover:border-pink-500/50 transition duration-300">
            <Truck className="text-pink-400 w-10 h-10 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Stage 3: Pack & Dispatch</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Smart magnetic box packaging and automated logistics dispatch directly to tailoring houses & clients.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT DARZIFLOW */}
      <section id="about" className="py-24 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for Modern Apparel Manufacturers</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
            At DarziFlow, we revolutionize the garment production ecosystem by replacing fragmented manual processes with an advanced, role-based production management system designed specifically for tailoring houses.
          </p>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-28 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Transform Your Factory Floor</h2>
            <p className="text-slate-400 mb-8">Get in touch with our team to set up DarziFlow production engine for your business.</p>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center gap-4"><Mail className="text-cyan-400"/> support@darziflow.com</div>
              <div className="flex items-center gap-4"><Phone className="text-cyan-400"/> +92 300 1234567</div>
              <div className="flex items-center gap-4"><MapPin className="text-cyan-400"/> Karachi, Pakistan</div>
            </div>
          </div>

          <form className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400" />
            <input type="email" placeholder="Work Email" className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400" />
            <textarea placeholder="Tell us about your production capacity" rows="4" className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"></textarea>
            <button type="submit" onClick={handleStart} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
              Book Platform Demo <ArrowRight className="w-5 h-5"/>
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
