"use client";
import React, { useState, useEffect, useRef } from "react";
import { Play, ArrowUpRight, Wallet, Wifi, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import T from "@/components/T";

const Banner: React.FC = () => {
  // --- STATES ---
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState<number>(1); // 1 = Main, 2 = Base, 3 = Dark
  const [isSwipingMainToBase, setIsSwipingMainToBase] = useState(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    };
  }, []);

  // --- SCROLL SCATTER LOGIC ---
  const scatterProgress = Math.min(Math.max(scrollY - 200, 0) / 400, 1);

  // --- DYNAMIC CARD POSITIONING ENGINE ---
  const getCardStyle = (cardId: number) => {
    const isActive = activeCard === cardId;
    let position = "center";

    if (!isActive) {
      if (activeCard === 1) position = cardId === 2 ? "left" : "right";
      else if (activeCard === 2) position = cardId === 3 ? "left" : "right";
      else if (activeCard === 3) position = cardId === 1 ? "left" : "right";
    }

    let tx = 0,
      ty = 0,
      rot = 0,
      zIndex = 10,
      scale = 1;

    if (position === "center") {
      tx = 0;
      ty = 0;
      rot = 0;
      scale = 1.05;
      zIndex = 50;
      ty -= 800 * scatterProgress;
    } else if (position === "left") {
      tx = -150;
      ty = 20;
      rot = -12;
      scale = 0.95;
      zIndex = 20;
      tx -= 800 * scatterProgress;
      ty -= 200 * scatterProgress;
      rot -= 45 * scatterProgress;
    } else if (position === "right") {
      tx = 150;
      ty = 20;
      rot = 12;
      scale = 0.95;
      zIndex = 20;
      tx += 800 * scatterProgress;
      ty -= 200 * scatterProgress;
      rot += 45 * scatterProgress;
    }

    return {
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      zIndex: zIndex,
      opacity: Math.max(0, 1 - scatterProgress * 1.5),
      transition:
        "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out",
    };
  };

  // Custom Gradient
  const hedwigGradient = "linear-gradient(to right, #4DA1FF, #1E50FF)";

  const handleMainCardClick = () => {
    if (isSwipingMainToBase) return;

    if (activeCard === 1) {
      setIsSwipingMainToBase(true);

      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
      swipeTimeoutRef.current = setTimeout(() => {
        setActiveCard(2);
        setIsSwipingMainToBase(false);
      }, 360);
      return;
    }

    setActiveCard(1);
  };

  return (
    <section className="relative w-full min-h-[90vh] bg-white dark:bg-[#050B14] flex flex-col items-center pt-28 pb-10 overflow-hidden text-white font-sans z-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
        @keyframes swipeMainToBase {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1.05); opacity: 1; }
          100% { transform: translate(-155px, 24px) rotate(-14deg) scale(0.95); opacity: 0.94; }
        }
        .animate-swipe-main-to-base {
          animation: swipeMainToBase 0.36s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `,
        }}
      />

      {/* Background Elements */}
      <div
        className="absolute inset-0 bg-tech-grid z-[-2]"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      ></div>
      <div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] dark:bg-[#2C64FF] opacity-[0.25] blur-[150px] rounded-full pointer-events-none z-[-2] transition-transform duration-500"
        style={{ transform: `translate(-50%, ${scrollY * 0.05}px)` }}
      ></div>

      {/* Floating Icons */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1] max-w-7xl mx-auto hidden sm:block"
        style={{ opacity: 1 - scatterProgress }}
      >
        <Plus
          className="absolute top-[15%] left-[10%] text-white/20 floating-icon"
          size={24}
          style={{ animationDelay: "0s", animationDuration: "7s" }}
        />
        <Plus
          className="absolute top-[35%] right-[15%] text-white/20 floating-icon"
          size={32}
          style={{ animationDelay: "1.5s", animationDuration: "8s" }}
        />
        <Plus
          className="absolute bottom-[40%] left-[20%] text-[#4DA1FF]/40 floating-icon"
          size={20}
          style={{ animationDelay: "3s", animationDuration: "6s" }}
        />
        <Plus
          className="absolute top-[25%] left-[80%] text-white/20 floating-icon"
          size={16}
          style={{ animationDelay: "0.5s", animationDuration: "9s" }}
        />
      </div>

      {/* --- TOP SECTION --- */}
      <div
        className="flex flex-col items-center text-center px-4 mb-8 z-10"
        style={{ opacity: 1 - scatterProgress * 2 }}
      >
        <div className="anim-fade-up flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-blue-400 dark:bg-[#0F172A]/50 backdrop-blur-md mb-6 shadow-[0_0_15px_-3px_rgba(77,161,255,0.3)]">
          <div
            className="p-1.5 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: hedwigGradient }}
          >
            <Wallet size={12} className="text-white" />
          </div>
          <span className="text-white dark:text-[#4DA1FF] text-xs font-bold tracking-widest uppercase pr-2">
            <T>NovaPay Network</T>
          </span>
        </div>

        <h1 className="anim-fade-up delay-txt-1 text-[2.5rem] md:text-5xl lg:text-[4rem] text-[#4DA1FF] dark:text-white font-bold tracking-tight leading-[1.1] mb-5 max-w-3xl">
          <T>Your Gateway to Digital</T>
          <br />
          <span
            className="text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(77,161,255,0.4)]"
            style={{ backgroundImage: hedwigGradient }}
          >
            <T>Finance Innovation</T>
          </span>
        </h1>

        <p className="anim-fade-up delay-txt-2 text-[#64748B] text-sm md:text-base max-w-xl mb-8">
          <T>Take full control of your digital wallet. Seamless transactions, live analytics, and modern bank-grade security built directly into your pocket.</T>
        </p>

        <div className="anim-fade-up delay-txt-3 flex items-center justify-center gap-4">
          <Button
            asChild
            variant="novapay"
            size="pill"
            className="group border border-white/10 text-sm font-semibold tracking-wide"
          >
            <Link href={"/register"}>
              <T>Get Started</T>
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="pill"
            className="border-[#4DA1FF]/25 bg-white/80 text-[#1E50FF] hover:bg-[#4DA1FF]/10"
          >
            <a href="#demo">
              <Play size={12} fill="currentColor" />
              <T>Watch Demo</T>
            </a>
          </Button>
        </div>
      </div>

      {/* --- CENTERPIECE --- */}
      <div className="relative w-full max-w-6xl h-[320px] md:h-[400px] flex items-center justify-center z-20 card-enter-anim">
        {/* --- CARDS --- */}
        <div className="relative w-[300px] h-[200px] md:w-[360px] md:h-[230px] flex items-center justify-center">
          {/* Card 2 */}
          <div
            onClick={() => setActiveCard(2)}
            className="absolute cursor-pointer"
            style={getCardStyle(2)}
          >
            <div
              className={`relative w-[260px] h-[160px] md:w-[300px] md:h-[190px] rounded-2xl border border-slate-200 p-4 md:p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.16)] ${activeCard === 2 ? "animate-gentle-float" : ""}`}
              style={{
                background: "linear-gradient(115deg, #FFFFFF 0%, #F5F7FA 100%)",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-slate-800 text-base md:text-lg font-bold tracking-wide uppercase">
                  NovaPay
                </span>
                <span className="text-slate-400 text-[9px] md:text-[10px] font-semibold tracking-widest uppercase">
                  Credit Card
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 md:w-8 md:h-6 rounded-[4px] border border-[#D7B96B] bg-gradient-to-br from-[#F6DC93] via-[#D6AE4F] to-[#B8871C]"></div>
                <Wifi size={13} className="text-slate-500 -rotate-90" />
              </div>
              <div className="font-mono text-[15px] md:text-[20px] tracking-[0.18em] text-slate-700">
                1234 5678 9012 3456
              </div>
              <div className="flex justify-center -mt-1">
                <span className="font-mono text-[10px] md:text-xs text-slate-600">
                  12/34
                </span>
              </div>
              <div className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wide">
                Cardholder Name
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setActiveCard(3)}
            className="absolute cursor-pointer"
            style={getCardStyle(3)}
          >
            <div
              className={`relative w-[260px] h-[160px] md:w-[300px] md:h-[190px] rounded-2xl border border-[#4DA1FF]/30 p-4 md:p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-[0_14px_34px_rgba(30,80,255,0.28)] ${activeCard === 3 ? "animate-gentle-float" : ""}`}
              style={{
                background:
                  "linear-gradient(120deg, #050B14 0%, #0F172A 65%, #112A57 100%)",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(77,161,255,0.18),transparent_40%)] pointer-events-none"></div>
              <div className="flex justify-between items-start z-10 relative">
                <span className="text-white text-base md:text-lg font-bold tracking-wide uppercase">
                  NovaPay
                </span>
                <span className="text-white/75 text-[9px] md:text-[10px] font-semibold tracking-widest uppercase">
                  Gift Card
                </span>
              </div>
              <div className="z-10 relative flex items-center gap-2">
                <div className="w-7 h-5 md:w-8 md:h-6 rounded-sm border border-[#D7B96B] bg-gradient-to-br from-[#F6DC93] via-[#D6AE4F] to-[#B8871C]"></div>
                <Wifi size={13} className="text-white/80 -rotate-90" />
              </div>
              <div className="z-10 relative font-mono text-[15px] md:text-[20px] tracking-[0.18em] text-white">
                4455 9902 7761 2048
              </div>
              <div className="z-10 flex justify-center -mt-1">
                <span className="font-mono text-[10px] md:text-xs text-white/85">
                  12/34
                </span>
              </div>
              <div className="z-10 text-[9px] md:text-[10px] text-white/85 uppercase tracking-wide">
                Cardholder Name
              </div>
            </div>
          </div>

          {/* MAIN CARD (Card 1) */}
          <div
            onClick={handleMainCardClick}
            className="absolute cursor-pointer"
            style={getCardStyle(1)}
          >
            <div
              className={`relative w-[280px] h-[175px] md:w-[340px] md:h-[215px] rounded-2xl border border-[#4DA1FF]/30 p-5 md:p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${activeCard === 1 ? "animate-gentle-float shadow-[0_26px_70px_rgba(30,80,255,0.38)]" : ""}`}
              style={{
                background: "linear-gradient(120deg, #4DA1FF 0%, #1E50FF 100%)",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.28),transparent_38%)] pointer-events-none"></div>
              <div
                className={`w-full h-full flex flex-col justify-between ${isSwipingMainToBase && activeCard === 1 ? "animate-swipe-main-to-base" : ""}`}
              >
                <div className="flex justify-between items-start z-10 relative">
                  <span className="text-white text-base md:text-lg font-bold tracking-wide uppercase">
                    NovaPay
                  </span>
                  <span className="text-white/65 text-[9px] md:text-[10px] font-semibold tracking-widest uppercase">
                    Credit Card
                  </span>
                </div>
                <div className="z-10 relative flex items-center gap-2 mt-1">
                  <div className="w-7 h-5 md:w-8 md:h-6 rounded-[4px] border border-[#D7B96B] bg-gradient-to-br from-[#F6DC93] via-[#D6AE4F] to-[#B8871C]"></div>
                  <Wifi size={13} className="text-white/70 -rotate-90" />
                </div>
                <div className="z-10 relative mt-1 font-mono text-[15px] md:text-[22px] tracking-[0.18em] text-white">
                  1234 5678 9012 3456
                </div>
                <div className="z-10 flex justify-center -mt-1">
                  <span className="font-mono text-[10px] md:text-xs text-white/80">
                    12/34
                  </span>
                </div>
                <div className="z-10 text-[9px] md:text-[10px] text-white/70 uppercase tracking-wide">
                  Cardholder Name
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
