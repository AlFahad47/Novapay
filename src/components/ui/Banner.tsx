"use client";
import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, LineChart, ShieldCheck, Star, ArrowUpRight, Wallet, Fingerprint, Wifi, Plus } from 'lucide-react';
import Link from 'next/link';

const Banner: React.FC = () => {
  // --- STATES ---
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState<number>(1); // 1 = Main, 2 = Base, 3 = Dark
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // --- SCROLL TRACKER (FIXED SYNTAX) ---
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- SCROLL SCATTER LOGIC ---
  const scatterProgress = Math.min(Math.max(scrollY - 200, 0) / 400, 1);

  // --- DYNAMIC CARD POSITIONING ENGINE ---
  const getCardStyle = (cardId: number) => {
    const visualActive = hoveredCard ?? activeCard;
    const isActive = visualActive === cardId;
    let position = 'center';

    if (!isActive) {
      if (visualActive === 1) position = cardId === 2 ? 'left' : 'right';
      else if (visualActive === 2) position = cardId === 3 ? 'left' : 'right';
      else if (visualActive === 3) position = cardId === 1 ? 'left' : 'right';
    }

    let tx = 0, ty = 0, rot = 0, zIndex = 10, scale = 1;

    if (position === 'center') {
      tx = 0; ty = 0; rot = 0; scale = 1.05; zIndex = 50; 
      ty -= 800 * scatterProgress; 
    } else if (position === 'left') {
      tx = -150; ty = 20; rot = -12; scale = 0.95; zIndex = 20; 
      tx -= 800 * scatterProgress; ty -= 200 * scatterProgress; rot -= 45 * scatterProgress; 
    } else if (position === 'right') {
      tx = 150; ty = 20; rot = 12; scale = 0.95; zIndex = 20; 
      tx += 800 * scatterProgress; ty -= 200 * scatterProgress; rot += 45 * scatterProgress; 
    }

    return {
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      zIndex: zIndex,
      opacity: Math.max(0, 1 - (scatterProgress * 1.5)),
      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out'
    };
  };

  // Custom Gradient
  const hedwigGradient = 'linear-gradient(to right, #4DA1FF, #1E50FF)';

  return (
    <section className="relative w-full min-h-[90vh] bg-white dark:bg-[#050B14] flex flex-col items-center pt-28 pb-10 overflow-hidden text-white font-sans z-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Light mode */
.bg-tech-grid {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Dark mode */
.dark .bg-tech-grid {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}
          
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-gentle-float { animation: gentleFloat 4s ease-in-out infinite; }
        @keyframes floatIconPulse {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-25px) scale(1.1); opacity: 0.6; }
        }
        .floating-icon { animation: floatIconPulse 6s ease-in-out infinite; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-txt-1 { animation-delay: 0.1s; }
        .delay-txt-2 { animation-delay: 0.2s; }
        .delay-txt-3 { animation-delay: 0.3s; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .card-enter-anim { animation: cardEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* Background Elements */}
      <div className="absolute inset-0 bg-tech-grid z-[-2]" style={{ transform: `translateY(${scrollY * 0.3}px)` }}></div>
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] dark:bg-[#2C64FF] opacity-[0.25] blur-[150px] rounded-full pointer-events-none z-[-2] transition-transform duration-500" style={{ transform: `translate(-50%, ${scrollY * 0.05}px)` }}></div>
      
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none z-[-1] max-w-7xl mx-auto hidden sm:block" style={{ opacity: 1 - scatterProgress }}>
        <Plus className="absolute top-[15%] left-[10%] text-white/20 floating-icon" size={24} style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <Plus className="absolute top-[35%] right-[15%] text-white/20 floating-icon" size={32} style={{ animationDelay: '1.5s', animationDuration: '8s' }} />
        <Plus className="absolute bottom-[40%] left-[20%] text-[#4DA1FF]/40 floating-icon" size={20} style={{ animationDelay: '3s', animationDuration: '6s' }} />
        <Plus className="absolute top-[25%] left-[80%] text-white/20 floating-icon" size={16} style={{ animationDelay: '0.5s', animationDuration: '9s' }} />
      </div>

      {/* --- TOP SECTION --- */}
      <div className="flex flex-col items-center text-center px-4 mb-8 z-10" style={{ opacity: 1 - (scatterProgress * 2) }}>
        
        <div className="anim-fade-up flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-blue-400 dark:bg-[#0F172A]/50 backdrop-blur-md mb-6 shadow-[0_0_15px_-3px_rgba(77,161,255,0.3)]">
          <div className="p-1.5 rounded-full flex items-center justify-center shadow-sm" style={{ background: hedwigGradient }}>
            <Wallet size={12} className="text-white" />
          </div>
          <span className="text-white dark:text-[#4DA1FF] text-xs font-bold tracking-widest uppercase pr-2">NovaPay Network</span>
        </div>

        <h1 className="anim-fade-up delay-txt-1 text-[2.5rem] md:text-5xl lg:text-[4rem] text-[#4DA1FF] dark:text-white font-bold tracking-tight leading-[1.1] mb-5 max-w-3xl">
          Your Gateway to Digital<br />
          <span className="text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(77,161,255,0.4)]" style={{ backgroundImage: hedwigGradient }}>
            Finance Innovation
          </span>
        </h1>

        <p className="anim-fade-up delay-txt-2 text-[#64748B] text-sm md:text-base max-w-xl mb-8">
          Take full control of your digital wallet. Seamless transactions, live analytics, and modern bank-grade security built directly into your pocket.
        </p>

        <div className="anim-fade-up delay-txt-3 flex items-center justify-center gap-4">
          <Link href={'/register'} className="group relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full overflow-hidden border border-white/10 shadow-sm hover:shadow-[0_8px_25px_-5px_rgba(77,161,255,0.25)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out group-hover:scale-[1.05]"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-40 rounded-t-full pointer-events-none"></div>
            <span className="relative text-white text-sm font-semibold tracking-wide drop-shadow-sm">Get Started</span>
            <ArrowUpRight size={16} strokeWidth={2.5} className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>

          <a href="#demo" className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-[#4DA1FF]/20bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] hover:bg-[#0F172A]/80 backdrop-blur-md transition-all group text-[#64748B] hover:text-[#4DA1FF] shadow-sm">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/10 text-[#4DA1FF] group-hover:scale-110  transition-transform">
              <Play size={12} fill="currentColor" />
            </div>
            <span className="text-sm  text-[#4DA1FF] font-semibold">Watch Demo</span>
          </a>
        </div>
      </div>

      {/* --- CENTERPIECE --- */}
      <div className="relative w-full max-w-6xl h-[320px] md:h-[400px] flex items-center justify-center z-20 card-enter-anim">
        
        {/* Left Widgets */}
        <div className="absolute left-[2%] lg:left-[5%] top-[5%] flex items-center gap-4 hidden md:flex" style={{ opacity: 1 - (scatterProgress * 2) }}>
          <div className="text-right">
            <h4 className="font-bold text-sm text-white">Excellence Beyond</h4>
            <p className="text-[11px] text-[#4DA1FF] mt-0.5">Top tier features.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl border border-[#4DA1FF]/20 bg-[#0F172A]/70 flex items-center justify-center text-[#4DA1FF] backdrop-blur-xl shadow-lg">
            <ThumbsUp size={18} />
          </div>
        </div>

        {/* --- CARDS --- */}
        <div className="relative w-[300px] h-[200px] md:w-[360px] md:h-[230px] flex items-center justify-center">
          
          {/* Card 2 */}
          <div onClick={() => setActiveCard(2)} onMouseEnter={() => setHoveredCard(2)} onMouseLeave={() => setHoveredCard(null)} className="absolute cursor-pointer" style={getCardStyle(2)}>
            <div className={`w-[260px] h-[160px] md:w-[300px] md:h-[190px] bg-[#0F172A]/90 rounded-2xl border border-[#4DA1FF]/20 p-5 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 ${activeCard === 2 ? 'animate-gentle-float shadow-xl' : ''}`}>
              <div className="flex justify-between items-start z-10"><span className="font-bold text-white">NovaPay Base</span><Wifi size={20} className="text-[#4DA1FF]/80 rotate-90" /></div>
              <div className="z-10"><p className="font-mono text-sm text-white/80">**** **** **** 1245</p><div className="w-8 h-5 bg-[#4DA1FF]/30 rounded-[3px]"></div></div>
            </div>
          </div>

          {/* Card 3 */}
          <div onClick={() => setActiveCard(3)} onMouseEnter={() => setHoveredCard(3)} onMouseLeave={() => setHoveredCard(null)} className="absolute cursor-pointer" style={getCardStyle(3)}>
            <div className={`w-[260px] h-[160px] md:w-[300px] md:h-[190px] bg-[#050B14]/90 rounded-2xl border border-[#1E293B] flex flex-col overflow-hidden transition-all duration-300 ${activeCard === 3 ? 'animate-gentle-float' : ''}`}>
               <div className="w-full h-10 bg-[#0F172A] mt-6"></div>
               <div className="w-[80%] h-8 bg-[#0F172A]/80 mx-auto mt-4 rounded flex items-center justify-between px-3 border border-[#1E50FF]/30">
                  <Fingerprint size={16} className="text-[#4DA1FF]/50" />
                  <div className="px-2 py-1 text-[10px] text-white font-mono rounded-sm" style={{ background: hedwigGradient }}>892</div>
               </div>
            </div>
          </div>

          {/* MAIN CARD (Card 1) */}
          <div onClick={() => setActiveCard(1)} onMouseEnter={() => setHoveredCard(1)} onMouseLeave={() => setHoveredCard(null)} className="absolute cursor-pointer" style={getCardStyle(1)}>
            <div className={`w-[280px] h-[175px] md:w-[340px] md:h-[215px] rounded-2xl border border-white/20 p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 backdrop-blur-2xl ${activeCard === 1 ? 'animate-gentle-float shadow-[0_30px_80px_rgba(77,161,255,0.4)]' : ''}`}
                 style={{ background: `linear-gradient(115deg, rgba(77, 161, 255, 0.95) 0%, rgba(30, 80, 255, 0.95) 100%)` }}>
              <div className="flex justify-between items-start z-10 relative">
                <div className="w-10 h-7 md:w-12 md:h-8 bg-gradient-to-br from-white/80 to-slate-300 rounded-[6px] border border-white/40"></div>
                <div className="bg-white/90 p-1.5 rounded-full text-[#1E50FF]"><Star size={16} fill="currentColor" /></div>
              </div>
              <div className="z-10 relative mt-auto">
                <div className="font-mono text-[1.2rem] md:text-[1.5rem] tracking-widest text-white drop-shadow-md">5235 4200 2432 222</div>
                <div className="flex justify-end mt-2"><span className="text-[9px] text-white font-bold uppercase">Exp 09/24</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;