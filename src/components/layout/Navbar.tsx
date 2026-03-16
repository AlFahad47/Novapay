"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaUser } from 'react-icons/fa';
import { FaGear } from 'react-icons/fa6';
import { IoLogOut } from 'react-icons/io5';
import { Crown, ShieldCheck, Star, Trophy } from "lucide-react"
import RankDetailsModal from '../modals/RankDetailsModal';

type FullUser = {
  rank?: string;
  points?: number;
};

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // React Compiler-safe dark mode using useSyncExternalStore (avoids setState in effect)
  const darkMode = useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", callback);
      window.addEventListener("themechange", callback);
      return () => {
        mq.removeEventListener("change", callback);
        window.removeEventListener("themechange", callback);
      };
    },
    () => {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    () => false // server snapshot — always false, avoids hydration mismatch
  );

  const toggleDarkMode = () => {
    const next = !darkMode;
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  };
  const [activeHash, setActiveHash] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
 
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

  updateHash(); // Run on page load

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

  // Dark mode toggle on <html> — derives from useSyncExternalStore value
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setIsProfileOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Smooth scroll handler
 const handleScrollLink = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
 
  if (path.startsWith("/#")) {
    const hash = path.replace("/", ""); 
    
   
    if (pathname === "/") {
      const target = document.querySelector(hash);
      
      if (target) {
       
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });

        
        window.history.pushState(null, "", hash);
        setActiveHash(hash);
      }
    } 
   
  }
};

const [fullUser, setFullUser] = useState<FullUser | null>(null);
const normalizedRank = (fullUser?.rank || "BRONZE").toUpperCase();


useEffect(() => {
  const fetchUserData = async () => {
    if (session?.user?.email) {
      try {
        const res = await fetch(`/api/user/update?email=${session.user.email}`);
        const data = await res.json();
        if (data && !data.message) {
          setFullUser(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  fetchUserData();
  
  const interval = setInterval(fetchUserData, 10000); 
  return () => clearInterval(interval);
}, [session]);


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
    <>
    <div className="sticky top-2 z-50 mb-0.5 left-0 flex justify-center px-4 pointer-events-none" ref={mobileMenuRef}>
      <nav 
        className={`pointer-events-auto relative flex items-center justify-between p-2 rounded-4xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isScrolled 
            ? 'w-full max-w-7xl bg-white/3 backdrop-blur-xl border border-white/8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]' 
            : 'w-full max-w-5xl bg-[#0f172a]/20 backdrop-blur-xl border border-white/5 shadow-2xl '
        }`}
      >
        {/* Subtle inner glass shine */}
        <div className="absolute inset-0 rounded-4xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] pointer-events-none"></div>

        {/* Brand / Logo */}
        <div className="pl-4 md:pl-6 shrink-0 z-20 flex items-center gap-2">
          <Sparkles className="text-[#3b82f6] w-5 h-5" />
          <Link href="/" className="text-[#3b82f6] dark:text-white font-bold text-lg md:text-xl tracking-wide drop-shadow-md">
            NovaPay
          </Link>
        </div>

        {/* Desktop Links (Center) */}
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2 bg-white/2 p-1 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const isActive = link.path.startsWith("/#")
  ? activeHash === link.path.replace("/", "")
  : pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={!user && link.path.startsWith("/#") ? handleScrollLink(link.path) : undefined}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="relative z-10 text-[0.95rem] text-[#3b82f6] dark:text-white whitespace-nowrap">{link.name}</span>
                {/* Unread badge on Chat link */}
                {link.name === "Chat" && unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5 z-20">
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
        <div className="hidden md:flex shrink-0 pr-1 z-20">
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle (always visible) */}
            <button
              onClick={() => toggleDarkMode()}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
            </button>

{user ? (
  <div className="relative" ref={profileDropdownRef}>
    {/* 1. The Avatar Trigger */}
    <div
      onClick={() => setIsProfileOpen(!isProfileOpen)}
      className="relative w-12 h-12 rounded-full overflow-hidden border-2 z-20 cursor-pointer transition-all hover:scale-105 active:scale-95 border-gray-300 dark:border-gray-600"
    >
      <Image
        alt="User Avatar"
        src={user.image || '/user.jfif'}
        width={48}
        height={48}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>

    {/* 2. The Dropdown Menu */}
    {isProfileOpen && (
      <div 
        className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0D263C] text-gray-900 dark:text-gray-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-700 py-2 z-[999] pointer-events-auto"
        style={{ isolation: 'isolate' }} // Forces it to the top of the stack
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-1">
          <p className="text-sm font-bold truncate">{user.name}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>

        <nav className="flex flex-col px-2 gap-1">
          <Link
            href="/dashboard"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <FaUser className="text-gray-400" /> Dashboard
          </Link>
          
          <Link
            href="/dashboard/settings"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <FaGear className="text-gray-400" /> Settings
          </Link>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2" />

          <button
            type="button"
            onClick={async () => {
              setIsProfileOpen(false);
              await signOut({ callbackUrl: "/" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-bold cursor-pointer"
          >
            <IoLogOut size={18} /> Logout
          </button>
        </nav>
      </div>
    )}
  </div>
): (
              <Link
                href="/login"
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full overflow-hidden border border-white/10"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#3b82f6] to-[#2563eb] transition-all duration-500 group-hover:scale-110 group-hover:from-[#2563eb] group-hover:to-[#1d4ed8]"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-white/30 to-transparent opacity-50 rounded-t-full"></div>
                <span className="relative text-white text-sm font-semibold tracking-wide drop-shadow-sm">Get Started</span>
                <ArrowUpRight size={16} strokeWidth={2.5} className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            )}
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && user && (
  <div 
    className="absolute right-0 mt-14 w-52 bg-white dark:bg-[#0D263C] text-gray-900 dark:text-gray-200 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-200 z-[100] pointer-events-auto"
    onClick={(e) => e.stopPropagation()}
  >
    {/* User Header */}
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold truncate">{user.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
    </div>

    {/* Menu Items */}
    <ul className="flex flex-col px-2 py-1 gap-1">
      <li>
        <Link
          href="/dashboard"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full cursor-pointer"
        >
          <FaUser className="shrink-0" /> 
          <span className="text-sm">Dashboard</span>
        </Link>
      </li>
      <li>
        <Link
          href="/dashboard/settings"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full cursor-pointer"
        >
          <FaGear className="shrink-0" /> 
          <span className="text-sm">Settings</span>
        </Link>
      </li>

      <li><hr className="border-t border-gray-200 dark:border-gray-700 my-1" /></li>

      <li>
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(false);
            signOut({ callbackUrl: "/" });
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium cursor-pointer"
        >
          <IoLogOut className="shrink-0" /> 
          <span className="text-sm">Logout</span>
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
          <div className="absolute top-[120%] left-0 w-full bg-[#0a101f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-2 md:hidden">
            {/* Mobile Dark Mode Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => toggleDarkMode()}                className="pl-5 w-14 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
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
                    if (!user && link.path.startsWith('/#')) {
                      const targetSelector = link.path.replace('/', '');
                      const target = document.querySelector(targetSelector);
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
                className="mt-4 flex justify-center items-center gap-2 bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Logout <ArrowUpRight size={18} />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 flex justify-center items-center gap-2 bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Get Started <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
        )}

        

      </nav>
    </div>
    <RankDetailsModal
      isOpen={isRankModalOpen}
      onClose={() => setIsRankModalOpen(false)}
      points={fullUser?.points || 0}
      currentRank={fullUser?.rank || "BRONZE"}
    />
    </>
  );
};


export default Navbar;