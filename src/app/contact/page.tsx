"use client";
import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Package, Clock, Headphones, Send, MapPin, Phone, Mail, Building, CalendarDays } from 'lucide-react';
import T from "@/components/T";

const ContactUs: React.FC = () => {
  return (
    // Main Wrapper (Adapts automatically based on global .dark class)
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050B14] text-slate-900 dark:text-slate-100 transition-colors duration-700 font-sans relative overflow-hidden selection:bg-[#4DA1FF]/30 selection:text-[#2C64FF]">
      
      {/* Background Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#4DA1FF] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[180px] opacity-20 dark:opacity-[0.1] animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2C64FF] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[180px] opacity-15 dark:opacity-[0.15] animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>

      {/* Header Banner */}
      <div className="bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-2xl py-24 text-center border-b border-slate-200 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative z-10 transition-colors duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white mb-4 tracking-tight drop-shadow-sm"><T>Contact Us</T></h1>
        <p className="text-sm text-slate-500 dark:text-[#4DA1FF] font-medium tracking-widest uppercase">
          <T>Home</T> <span className="mx-3 opacity-40">/</span> <T>Contact</T>
        </p>
      </div>

      <div className="w-11/12 max-w-7xl mx-auto py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* --- LEFT FORM SECTION --- */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0F172A]/80 backdrop-blur-3xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500">
            <div className="mb-12">
              <h2 className="text-xs font-bold text-[#2C64FF] dark:text-[#4DA1FF] tracking-[0.25em] uppercase mb-4 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-gradient-to-r from-[#2C64FF] dark:from-[#4DA1FF] to-transparent rounded-full"></span> 
                <T>Let's Connect</T>
              </h2>
              <h3 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-tight">
                <T>Get Your</T> <span className="text-[#2C64FF] dark:text-[#4DA1FF] italic font-serif font-medium relative whitespace-nowrap px-2">
                  <T>Free Quote</T>
                  {/* Decorative underline */}
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#4DA1FF]/30 dark:text-[#2C64FF]/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="5" fill="transparent" strokeLinecap="round"/></svg>
                </span>
                <T>Today</T>
              </h3>
            </div>

            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-widest transition-colors group-focus-within:text-[#2C64FF] dark:group-focus-within:text-[#4DA1FF]"><T>Full Name *</T></label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 font-medium
                      bg-[#F8FAFC] dark:bg-[#050B14]/50 
                      border border-slate-200 dark:border-slate-800 
                      focus:bg-white dark:focus:bg-[#050B14] 
                      focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] 
                      focus:ring-4 focus:ring-[#2C64FF]/10 dark:focus:ring-[#4DA1FF]/10 
                      text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm" 
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-widest transition-colors group-focus-within:text-[#2C64FF] dark:group-focus-within:text-[#4DA1FF]"><T>Email Address *</T></label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 font-medium
                      bg-[#F8FAFC] dark:bg-[#050B14]/50 
                      border border-slate-200 dark:border-slate-800 
                      focus:bg-white dark:focus:bg-[#050B14] 
                      focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] 
                      focus:ring-4 focus:ring-[#2C64FF]/10 dark:focus:ring-[#4DA1FF]/10 
                      text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm" 
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-widest transition-colors group-focus-within:text-[#2C64FF] dark:group-focus-within:text-[#4DA1FF]"><T>Subject *</T></label>
                <input 
                  type="text" 
                  placeholder="How can we help you?" 
                  className="w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 font-medium
                    bg-[#F8FAFC] dark:bg-[#050B14]/50 
                    border border-slate-200 dark:border-slate-800 
                    focus:bg-white dark:focus:bg-[#050B14] 
                    focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] 
                    focus:ring-4 focus:ring-[#2C64FF]/10 dark:focus:ring-[#4DA1FF]/10 
                    text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm" 
                />
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-widest transition-colors group-focus-within:text-[#2C64FF] dark:group-focus-within:text-[#4DA1FF]"><T>Your Message *</T></label>
                <textarea 
                  rows={5} 
                  placeholder="Write your message here..." 
                  className="w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 resize-none font-medium leading-relaxed
                    bg-[#F8FAFC] dark:bg-[#050B14]/50 
                    border border-slate-200 dark:border-slate-800 
                    focus:bg-white dark:focus:bg-[#050B14] 
                    focus:border-[#2C64FF] dark:focus:border-[#4DA1FF] 
                    focus:ring-4 focus:ring-[#2C64FF]/10 dark:focus:ring-[#4DA1FF]/10 
                    text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                ></textarea>
              </div>
              
              <button 
                type="button" 
                className="group flex items-center bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] rounded-full p-2 pr-8 hover:shadow-[0_12px_30px_-5px_rgba(44,100,255,0.5)] transition-all duration-500 active:scale-[0.98] w-full sm:w-auto mt-2"
              >
                <span className="bg-white/20 text-white p-3.5 rounded-full shadow-inner transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-105 flex items-center justify-center">
                  <Send size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </span>
                <span className="ml-5 font-bold text-white text-sm tracking-widest uppercase">
                  <T>Send Message</T>
                </span>
              </button>
            </form>
          </div>

          {/* --- RIGHT INFO SECTION (Stays dark/premium in both modes for contrast) --- */}
          <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-[2.5rem] rounded-tr-[7rem] p-10 lg:p-14 text-white shadow-2xl h-full relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-[#4DA1FF] rounded-full mix-blend-screen filter blur-[90px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-52 h-52 bg-[#2C64FF] rounded-full mix-blend-screen filter blur-[70px] opacity-30 pointer-events-none"></div>

            <div className="space-y-10 relative z-10">
              
              <div className="flex items-start gap-5 group cursor-default">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#4DA1FF] group-hover:text-white transition-all duration-500 text-[#4DA1FF]">
                  <Building size={22} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold mb-1.5 text-white/50 uppercase tracking-widest"><T>Headquarters</T></h4>
                  <p className="text-white text-[15px] font-medium leading-relaxed">
                    NovaPay Fintech Tower<br />
                    Tech Valley, Dhaka 1200
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 group cursor-default">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#4DA1FF] group-hover:text-white transition-all duration-500 text-[#4DA1FF]">
                  <Phone size={22} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold mb-1.5 text-white/50 uppercase tracking-widest"><T>Contact details</T></h4>
                  <div className="space-y-2.5 mt-2">
                    <a href="tel:+880123456789" className="flex items-center gap-3 text-white text-[15px] font-medium hover:text-[#4DA1FF] transition-colors w-fit">
                      +880 123-456-789
                    </a>
                    <a href="mailto:support@novapay.com" className="flex items-center gap-3 text-white text-[15px] font-medium hover:text-[#4DA1FF] transition-colors w-fit">
                      support@novapay.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-5 group cursor-default">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#4DA1FF] group-hover:text-white transition-all duration-500 text-[#4DA1FF]">
                  <CalendarDays size={22} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold mb-1.5 text-white/50 uppercase tracking-widest"><T>Business Hours</T></h4>
                  <p className="text-white text-[15px] font-medium mb-1"><T>Sun - Thu : 09:00 AM - 06:00 PM</T></p>
                  <p className="text-white/50 text-[14px] font-medium"><T>Fri - Sat : Closed</T></p>
                </div>
              </div>
            </div>

            <div className="pt-10 mt-12 border-t border-white/10 relative z-10">
              <h4 className="text-[11px] font-bold mb-5 text-white/50 tracking-widest uppercase"><T>Connect With Us</T></h4>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                  <a key={idx} href="#" className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl text-white/80 hover:bg-[#4DA1FF] hover:text-white hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(77,161,255,0.2)] transition-all duration-300 border border-white/10">
                    <Icon size={18} strokeWidth={2} className={idx < 2 ? "fill-current border-none" : ""} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAP SECTION --- */}
      <div className="w-11/12 max-w-7xl mx-auto pb-16 relative z-10">
        <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 group bg-slate-200 dark:bg-slate-900">
          
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl p-4 md:pr-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-transform duration-700 group-hover:translate-x-1 group-hover:translate-y-1">
            <div className="bg-[#2C64FF] p-3 rounded-xl shadow-inner">
              <MapPin className="text-white" size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-extrabold text-[#0F172A] dark:text-white text-lg tracking-tight">NovaPay HQ</h4>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold mt-0.5 tracking-wide">Dhaka, Bangladesh</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-[#2C64FF]/5 dark:bg-[#050B14]/40 pointer-events-none group-hover:opacity-0 transition-opacity duration-700 z-10 backdrop-blur-[1px]"></div>
          
          <iframe 
            src="https://maps.google.com/maps?q=Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full filter dark:invert dark:contrast-[85%] dark:hue-rotate-[190deg] dark:saturate-[50%] dark:opacity-80 transition-all duration-1000 group-hover:filter-none object-cover"
          ></iframe>
        </div>
      </div>

      {/* --- FEATURES FOOTER --- */}
      <div className="w-11/12 max-w-7xl mx-auto pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { icon: Package, title: "Secure Wallet", desc: "Bank-grade encryption & security." },
            { icon: Clock, title: "Fast Support", desc: "24/7 dedicated assistance team." },
            { icon: Headphones, title: "Expert Advice", desc: "Ready to solve your financial issues." }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-6 p-8 rounded-[2rem] transition-all duration-500 group cursor-pointer
              bg-white dark:bg-[#0F172A]/60 
              border border-slate-100 dark:border-slate-800 
              hover:-translate-y-1.5 
              shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(44,100,255,0.08)] 
              dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              
              <div className="p-4 rounded-2xl shadow-sm border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
                bg-[#F8FAFC] dark:bg-[#1E293B] 
                text-[#2C64FF] dark:text-[#4DA1FF] 
                border-slate-200 dark:border-slate-700">
                <feature.icon size={28} strokeWidth={2} />
              </div>
              <div className="pt-1">
                <h4 className="font-extrabold text-[17px] tracking-tight mb-1.5 transition-colors
                  text-[#0F172A] dark:text-white
                  group-hover:text-[#2C64FF] dark:group-hover:text-[#4DA1FF]"><T>{feature.title}</T></h4>
                <p className="text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400"><T>{feature.desc}</T></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ContactUs;