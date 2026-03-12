"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-background pt-12 mt-20 rounded-t-[2.5rem] md:rounded-t-[4rem] overflow-hidden border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">

      <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-64 bg-gradient-to-tl from-[#2C64FF]/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full md:w-1/2 h-64 bg-gradient-to-tr from-[#4DA1FF]/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* --- TOP ROW: Logo & Social Icons --- */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-8 border-b border-border gap-6">

          {/* Left Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#2C64FF] flex items-center justify-center bg-[#2C64FF]/5 dark:bg-[#2C64FF]/10">
              <span className="font-bold text-[#2C64FF] text-lg">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-slate-800 dark:text-white">NovaPay</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Digital Wallet</span>
            </div>
          </div>

          {/* Center Social Icons */}
          <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"><Youtube size={20} /></a>
            <a href="#" className="hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors"><Twitter size={20} /></a>
          </div>

          {/* Right Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#2C64FF] w-6 h-6" />
            <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tight">NovaPay</span>
          </div>
        </div>

        {/* --- MIDDLE ROW: Links & App Download --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">

          <div className="flex flex-col gap-4">
            <Link href="/terms" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors">Terms of Use</Link>
            <Link href="/media" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors">Media Center</Link>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/contact" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors">Contact Us</Link>
            <Link href="/faq" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors">FAQ</Link>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/privacy" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2C64FF] dark:hover:text-[#4DA1FF] transition-colors">Privacy Policy</Link>
          </div>

          <div className="col-span-2 flex flex-col items-start md:pl-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Download NovaPay App</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              To make your life easier Download NovaPay app and access all our services from a single touchpoint.
            </p>
            <button className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] hover:from-[#2C64FF] hover:to-[#1d4ed8] text-white px-8 py-3 rounded-full text-sm font-bold shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(44,100,255,0.6)] transition-all duration-300 hover:-translate-y-0.5">
              Download App
            </button>
          </div>
        </div>

        {/* --- BOTTOM ROW: Copyright --- */}
        <div className="pb-8 pt-4">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            © 2026 NovaPay All rights reserved
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
