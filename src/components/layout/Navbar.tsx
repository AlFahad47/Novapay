"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaUser } from 'react-icons/fa';
import { FaGear } from 'react-icons/fa6';
import { IoLogOut } from 'react-icons/io5';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);
  const pathname = usePathname();

  const user = session?.user;

  // Fetch total unread messages for badge on Chat link and Bell
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      fetch("/api/chat/unread-count")
        .then((r) => r.json())
        .then((data) => setUnreadTotal(data.total ?? 0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

useEffect(() => {
  const updateHash = () => {
    setActiveHash(window.location.hash);
  };

  updateHash(); // page load এ run হবে

  window.addEventListener("hashchange", updateHash);

  return () => window.removeEventListener("hashchange", updateHash);
}, []);
  // Scroll detection for dynamic width and blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode toggle on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Smooth scroll handler
 const handleScrollLink = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  // যদি পাথটি hash (#) দিয়ে শুরু হয়
  if (path.startsWith("/#")) {
    const hash = path.replace("/", ""); // উদাহরণ: "#home"
    
    // ১. চেক করুন আপনি বর্তমানে হোম পেজে (root path "/") আছেন কি না
    if (pathname === "/") {
      const target = document.querySelector(hash);
      
      if (target) {
        // যদি টার্গেট এলিমেন্ট পাওয়া যায়, তবে ডিফল্ট নেভিগেশন বন্ধ করে স্মুথ স্ক্রল করুন
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });

        // URL এবং Active state আপডেট
        window.history.pushState(null, "", hash);
        setActiveHash(hash);
      }
    } 
    // ২. যদি আপনি হোম পেজে না থাকেন (যেমন: /login এ আছেন), 
    // তবে e.preventDefault() কল হবে না। 
    // ফলে ব্রাউজার স্বাভাবিকভাবে "/" এ যাবে এবং সাথে হ্যাশ (#) নিয়ে যাবে।
  }
};

  const navLinks = user
    ? [
        { name: "Home", path: "/" },
        { name: "Chat", path: "/chat" },
        { name: "Review", path: "/review" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact", path: "/contact" },
        { name: "Blog", path: "/blog" },
      ]
    : [
        { name: "Home", path: "/#home" },
        { name: "Quick Action", path: "/#menus" },
        { name: "Offer", path: "/#offers" },
        { name: "Features", path: "/#features" },
        { name: "How It Works", path: "/#how" },
        { name: "Reviews", path: "/#reviews" },
        
      ];





  return (
    <div className=" sticky top-0 z-50 mb-0.5 left-0 flex justify-center px-4 pointer-events-none bg-[#F0F7FF] dark:bg-[#040911]">
      <nav 
        className={`pointer-events-auto relative flex items-center justify-between p-2  rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isScrolled 
            ? 'w-full max-w-7xl bg-white/[0.03] backdrop-blur-[24px] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]' 
            : 'w-full max-w-5xl bg-[#0f172a]/20 backdrop-blur-xl border border-white/5 shadow-2xl'
        }`}
      >
        {/* Subtle inner glass shine */}
        <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] pointer-events-none"></div>

        {/* Brand / Logo */}
        <div className="pl-4 md:pl-6 flex-shrink-0 z-20 flex items-center gap-2">
          <Sparkles className="text-[#3b82f6] w-5 h-5" />
          <Link href="/" className="text-[#3b82f6] dark:text-white font-bold text-lg md:text-xl tracking-wide drop-shadow-md">
            NovaPay
          </Link>
        </div>

        {/* Desktop Links (Center) */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-white/[0.02] p-1 rounded-full border border-white/[0.05]">
          {navLinks.map((link) => {
            const isActive = link.path.startsWith("/#")
  ? activeHash === link.path.replace("/", "")
  : pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={!user && link.path.startsWith("/#") ? handleScrollLink(link.path) : undefined}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group  ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className="relative text-[1rem] z-10 text-[#3b82f6] dark:text-white">{link.name}</span>
                {/* Unread badge on Chat link */}
                {link.name === "Chat" && unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 z-20">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#3b82f6] rounded-full shadow-[0_0_10px_3px_rgba(59,130,246,0.8)]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right - Dark Mode + Avatar / Get Started */}
        <div className="hidden md:flex flex-shrink-0 pr-1 z-20">
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle (always visible) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="pl-5 h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
            </button>

            {user ? (
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <img
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                  src={user.photoURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8oghbsuzggpkknQSSU-Ch_xep_9v3m6EeBQ&s'}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
            ) : (
              <Link
                href="/login"
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] transition-all duration-500 group-hover:scale-110 group-hover:from-[#2563eb] group-hover:to-[#1d4ed8]"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-50 rounded-t-full"></div>
                <span className="relative text-white text-sm font-semibold tracking-wide drop-shadow-sm">Get Started</span>
                <ArrowUpRight size={16} strokeWidth={2.5} className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            )}
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && user && (
            <div className="absolute right-0 mt-14 w-52 bg-white dark:bg-[#0D263C] text-gray-900 dark:text-gray-200 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold">{user.displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <ul className="flex flex-col px-2 py-1 gap-1">
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaUser /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FaGear /> Settings
                  </Link>
                </li>
                <li><hr className="border-t border-gray-200 dark:border-gray-700 my-1" /></li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600 transition-colors font-medium"
                  >
                    <IoLogOut /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white z-20 pr-4"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[120%] left-0 w-full bg-[#0a101f]/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 flex flex-col gap-2 md:hidden">
            {/* Mobile Dark Mode Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="pl-5 w-14 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-200" />}
              </button>
            </div>

            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.name === 'Home' && pathname === '/');
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (!user && link.path.startsWith('#')) {
                      const target = document.querySelector(link.path);
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-[#3b82f6]/20 text-white border border-[#3b82f6]/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <Link
                href="/"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Logout <ArrowUpRight size={18} />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Get Started <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
        )}

      </nav>
    </div>
  );
};

export default Navbar;