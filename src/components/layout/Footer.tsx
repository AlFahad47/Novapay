"use client";
import React from "react";
import Link from "next/link";
import { Sparkles, Linkedin, Github, Mail, Phone } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import T from "@/components/T";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050B14] text-slate-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-blue-500" />
              <span className="text-white font-black text-xl tracking-wide">NovaPay</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              <T>Secure. Fast. Simple. Your all-in-one digital wallet for modern finance.</T>
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all">
                <FaXTwitter size={14} className="text-slate-400 hover:text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all">
                <Linkedin size={14} className="text-slate-400 hover:text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all">
                <Github size={14} className="text-slate-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest"><T>Product</T></h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/send-money" className="hover:text-white transition-colors"><T>Send Money</T></Link></li>
              <li><Link href="/donation" className="hover:text-white transition-colors"><T>Donate</T></Link></li>
              <li><Link href="/dashboard/international" className="hover:text-white transition-colors"><T>International Pay</T></Link></li>
              <li><Link href="/micro-savings" className="hover:text-white transition-colors"><T>Micro Saving</T></Link></li>
              <li><Link href="/split-bill" className="hover:text-white transition-colors"><T>Split Bill</T></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest"><T>Company</T></h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors"><T>About</T></Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors"><T>Blog</T></Link></li>
              <li><Link href="/review" className="hover:text-white transition-colors"><T>Reviews</T></Link></li>
              <li><Link href="/chat" className="hover:text-white transition-colors"><T>Chat</T></Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest"><T>Support</T></h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/faq" className="hover:text-white transition-colors"><T>FAQ</T></Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors"><T>Contact</T></Link></li>
              <li><Link href="/chat/support" className="hover:text-white transition-colors"><T>Live Chat</T></Link></li>
            </ul>
            <div className="mt-6 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={12} /> support@novapay.com
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} /> +880 1700-000000
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} NovaPay. <T>All rights reserved.</T></p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-slate-400 transition-colors"><T>Privacy Policy</T></Link>
            <Link href="#" className="hover:text-slate-400 transition-colors"><T>Terms of Service</T></Link>
            <Link href="/faq" className="hover:text-slate-400 transition-colors"><T>FAQ</T></Link>
            <LanguageSwitcher />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
