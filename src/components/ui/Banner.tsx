"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, ArrowUpRight, Wallet, Wifi } from "lucide-react";
import Link from "next/link";
import Loader from "./Loader";
import T from "@/components/T";

const Banner: React.FC = () => {
  // --- STATES ---
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState<number>(1); // 1 = Main(Blue), 2 = Base(White), 3 = Dark
  const [isSwipingMainToBase, setIsSwipingMainToBase] = useState(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- SCROLL TRACKER ---
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
  const scatterProgress = Math.min(Math.max(scrollY - 100, 0) / 400, 1);

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

    // Default resting positions (Matches the screenshot perfectly)
    if (position === "center") {
      tx = 0;
      ty = 0;
      rot = 0;
      scale = 1.05;
      zIndex = 50;
      ty -= 600 * scatterProgress; // Fly up on scroll
    } else if (position === "left") {
      tx = -140;
      ty = 25;
      rot = -10;
      scale = 0.95;
      zIndex = 20;
      tx -= 600 * scatterProgress; // Fly left on scroll
      ty -= 150 * scatterProgress;
      rot -= 30 * scatterProgress;
    } else if (position === "right") {
      tx = 140;
      ty = 25;
      rot = 10;
      scale = 0.95;
      zIndex = 20;
      tx += 600 * scatterProgress; // Fly right on scroll
      ty -= 150 * scatterProgress;
      rot += 30 * scatterProgress;
    }

    return {
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      zIndex: zIndex,
      opacity: Math.max(0, 1 - scatterProgress * 1.2),
      transition:
        "transform 0.7s cubic-bezier(0.25, 1, 0.2, 1), opacity 0.5s ease-out, box-shadow 0.5s ease",
    };
  };

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
    <section className="relative w-full min-h-screen bg-[#F8FAFC] dark:bg-[#050B14] flex flex-col items-center pt-40 pb-20 overflow-hidden font-sans z-0 transition-colors duration-700">
      {/* Dynamic Styles for Grid and Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Premium Light Grid */
        .bg-tech-grid {
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Premium Dark Grid */
        .dark .bg-tech-grid {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
          
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-gentle-float { animation: gentleFloat 4s ease-in-out infinite; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-txt-1 { animation-delay: 0.1s; }
        .delay-txt-2 { animation-delay: 0.2s; }
        .delay-txt-3 { animation-delay: 0.3s; }
        
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.9) translateY(60px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .card-enter-anim { animation: cardEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
        
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
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      ></div>

      {/* Central Glow Orb */}
      <div
        className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#4DA1FF]/20 dark:bg-[#2C64FF]/25 blur-[120px] rounded-full pointer-events-none z-[-2] transition-transform duration-500"
        style={{ transform: `translate(-50%, ${scrollY * 0.1}px)` }}
      ></div>

      {/* --- TOP CONTENT SECTION --- */}
      <div
        className="mx-auto w-full max-w-[1280px] flex flex-col items-center text-center px-4 mb-12 z-10"
        style={{ opacity: Math.max(0, 1 - scatterProgress * 2.5) }}
      >
        {/* Badge */}
        <div className="anim-fade-up flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 backdrop-blur-md mb-6 shadow-sm">
          <div className="p-1 rounded-full flex items-center justify-center bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] shadow-sm">
            <Wallet size={12} className="text-white" />
          </div>
          <span className="text-blue-600 dark:text-[#4DA1FF] text-[11px] font-extrabold tracking-[0.2em] uppercase pr-2">
            <T>NovaPay Network</T>
          </span>
        </div>

        {/* Headline */}
        <h1 className="anim-fade-up delay-txt-1 text-[2.75rem] md:text-6xl lg:text-[4.5rem] text-transparent bg-clip-text bg-gradient-to-r from-[#3d98ff] to-[#3561ff] font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl">
          <T>Your Gateway to Digital</T>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4598f8] to-[#446cff] drop-shadow-sm dark:drop-shadow-[0_0_25px_rgba(77,161,255,0.3)]">
            <T>Finance Innovation</T>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="anim-fade-up delay-txt-2 text-slate-600 dark:text-slate-400 text-[15px] md:text-[17px] font-medium max-w-2xl mb-10 leading-relaxed">
          <T>Take full control of your digital wallet. Seamless transactions, live analytics, and modern bank-grade security built directly into your pocket.</T>
        </p>

        {/* Buttons */}
        <div className="anim-fade-up delay-txt-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
          <Link
            href="/register"
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full overflow-hidden shadow-[0_10px_30px_-10px_rgba(44,100,255,0.5)] hover:shadow-[0_10px_40px_-10px_rgba(44,100,255,0.7)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 group-hover:scale-105"></div>
            <span className="relative text-white text-[15px] font-bold tracking-wide">
              <T>Get Started</T>
            </span>
            <ArrowUpRight
              size={18}
              strokeWidth={3}
              className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            />
          </Link>

          <a
            href="#demo"
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-800 border border-slate-200 dark:border-transparent font-bold text-[15px] tracking-wide hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-800 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Play size={10} fill="currentColor" className="ml-0.5" />
            </div>
            <T>Watch Demo</T>
          </a>
        </div>
      </div>

      {/* --- CARDS SHOWCASE --- */}
      <div className="relative w-full max-w-6xl h-[300px] md:h-[350px] flex items-center justify-center z-20 card-enter-anim mt-4">
        {/* CONTAINER TO HOLD ALL CARDS */}
        <div className="relative w-[300px] h-[190px] md:w-[340px] md:h-[215px] flex items-center justify-center perspective-[1000px]">
          {/* --- CARD 2: LEFT (WHITE/LIGHT MODE) --- */}
          <div
            onClick={() => setActiveCard(2)}
            className="absolute cursor-pointer"
            style={getCardStyle(2)}
          >
            <div className="relative w-[280px] h-[175px] md:w-[320px] md:h-[200px] rounded-[1.25rem] border border-slate-200/80 bg-gradient-to-br from-[#ffffff] to-[#f1f5f9] p-5 md:p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
              {/* Top Right: Bank Name */}
              <div className="flex justify-end w-full">
                <span className="text-slate-500 text-[13px] md:text-[14px] font-medium tracking-widest uppercase">
                  NovaPay
                </span>
              </div>

              {/* Middle: Chip & Contactless */}
              <div className="flex justify-between items-center w-full mt-2">
                {/* Realistic Gold Chip */}
                <div className="w-[42px] h-[30px] md:w-[48px] md:h-[34px] rounded-md border border-amber-200/50 bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#d97706] shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-evenly py-1 opacity-20">
                    <div className="w-full h-[1px] bg-black"></div>
                    <div className="w-full h-[1px] bg-black"></div>
                  </div>
                  <div className="absolute inset-0 flex justify-evenly px-2 opacity-20">
                    <div className="w-[1px] h-full bg-black"></div>
                  </div>
                </div>
                <Wifi size={22} className="text-slate-400 rotate-90" />
              </div>

              {/* Bottom: Numbers & Valid Thru */}
              <div className="flex flex-col w-full mt-auto gap-1">
                <div className="font-mono text-[18px] md:text-[21px] font-medium tracking-[0.14em] text-slate-700">
                  1234 4567 8910 0101
                </div>
                <div className="flex items-center w-full pl-12 md:pl-16 mt-0.5">
                  <div className="flex flex-col items-start leading-[0.8] mr-1.5 opacity-60">
                    <span className="text-[5px] md:text-[6px] text-slate-600 font-bold uppercase">
                      Valid
                    </span>
                    <span className="text-[5px] md:text-[6px] text-slate-600 font-bold uppercase">
                      Thru
                    </span>
                  </div>
                  <span className="font-mono text-[12px] md:text-[14px] font-semibold text-slate-600">
                    08/22
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- CARD 3: RIGHT (DARK MODE) --- */}
          <div
            onClick={() => setActiveCard(3)}
            className="absolute cursor-pointer"
            style={getCardStyle(3)}
          >
            <div className="relative w-[280px] h-[175px] md:w-[320px] md:h-[200px] rounded-[1.25rem] border border-slate-700/80 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 md:p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none"></div>

              {/* Top Right: Bank Name */}
              <div className="flex justify-end w-full z-10 relative">
                <span className="text-slate-300 text-[13px] md:text-[14px] font-medium tracking-widest uppercase">
                  NovaPay
                </span>
              </div>

              {/* Middle: Chip & Contactless */}
              <div className="flex justify-between items-center w-full mt-2 z-10 relative">
                {/* Realistic Gold Chip */}
                <div className="w-[42px] h-[30px] md:w-[48px] md:h-[34px] rounded-md border border-amber-600/50 bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#d97706] shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-evenly py-1 opacity-30">
                    <div className="w-full h-[1px] bg-black"></div>
                    <div className="w-full h-[1px] bg-black"></div>
                  </div>
                  <div className="absolute inset-0 flex justify-evenly px-2 opacity-30">
                    <div className="w-[1px] h-full bg-black"></div>
                  </div>
                </div>
                <Wifi size={22} className="text-slate-300 rotate-90" />
              </div>

              {/* Bottom: Numbers & Valid Thru */}
              <div className="flex flex-col w-full mt-auto gap-1 z-10 relative">
                <div className="font-mono text-[18px] md:text-[21px] font-medium tracking-[0.14em] text-slate-100">
                  1234 4567 8910 0101
                </div>
                <div className="flex items-center w-full pl-12 md:pl-16 mt-0.5">
                  <div className="flex flex-col items-start leading-[0.8] mr-1.5 opacity-60">
                    <span className="text-[5px] md:text-[6px] text-slate-300 font-bold uppercase">
                      Valid
                    </span>
                    <span className="text-[5px] md:text-[6px] text-slate-300 font-bold uppercase">
                      Thru
                    </span>
                  </div>
                  <span className="font-mono text-[12px] md:text-[14px] font-semibold text-slate-200">
                    08/22
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- MAIN CARD 1: CENTER (BLUE MINIMALIST) --- */}
          <div
            onClick={handleMainCardClick}
            className="absolute cursor-pointer"
            style={getCardStyle(1)}
          >
            <div
              className={`relative w-[290px] h-[180px] md:w-[340px] md:h-[215px] rounded-[1.25rem] border border-white/10 p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 bg-[#2C64FF] ${
                activeCard === 1
                  ? "animate-gentle-float shadow-[0_20px_60px_-10px_rgba(44,100,255,0.6)]"
                  : "shadow-[0_15px_40px_rgba(44,100,255,0.3)]"
              }`}
            >
              {/* Very subtle top light reflection to keep it premium but flat like the reference */}
              <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent opacity-40 pointer-events-none"></div>

              <div
                className={`w-full h-full flex flex-col justify-between z-10 relative ${
                  isSwipingMainToBase && activeCard === 1
                    ? "animate-swipe-main-to-base"
                    : ""
                }`}
              >
                {/* Top Left: Minimalist Logo */}
                <div className="flex items-start">
                  <span className="text-white text-[24px] md:text-[28px] font-bold tracking-tight leading-none">
                    NovaPay
                  </span>
                </div>

                {/* Bottom Right: Debit text + Mastercard-style Overlapping Circles */}
                <div className="flex items-center justify-end gap-3 w-full mt-auto">
                  <span className="text-white/95 text-[15px] md:text-[17px] font-medium tracking-wide">
                    debit
                  </span>

                  {/* Overlapping Circles (Mastercard aesthetic) */}
                  <div className="relative flex items-center h-8 w-[52px] md:h-10 md:w-[65px]">
                    <div className="absolute left-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#EB001B] z-10 shadow-sm"></div>
                    <div className="absolute right-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F79E1B] z-20 opacity-85 mix-blend-normal"></div>
                  </div>
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
