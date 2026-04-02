"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { FaUser } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { Crown, ShieldCheck, Star, Trophy } from "lucide-react";
import RankDetailsModal from "../modals/RankDetailsModal";
import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "../LanguageSwitcher";
import { openAuthModal } from "@/components/auth/authModalEvents";

type FullUser = {
  rank?: string;
  points?: number;
  image?: string | null;
};

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [failedAvatarSrc, setFailedAvatarSrc] = useState<string | null>(null);

  const pathname = usePathname();
  const user = session?.user;
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch total unread messages
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      fetch("/api/chat/unread-count")
        .then((r) => r.json())
        .then((data) => setUnreadTotal(data.total ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Hash Updates
  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Scroll detection for dynamic expanding effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Outside Click for Profile Dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Smooth scroll handler
  const handleScrollLink =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(
            `/api/user/update?email=${session.user.email}`,
          );
          const data = await res.json();
          if (data && !data.message) {
            setFullUser(data as FullUser);
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

  const t = useTranslations("nav");

  const navLinks = user
    ? [
        { name: t("home"), path: "/" },
        { name: t("chat"), path: "/chat" },
        { name: t("review"), path: "/review" },
        { name: t("faq"), path: "/faq" },
        { name: t("contact"), path: "/contact" },
        { name: t("blog"), path: "/blog" },
      ]
    : [
        { name: t("home"), path: "/#home" },
        { name: "Quick Actions", path: "/#menus" },
        { name: t("features"), path: "/#features" },
        { name: t("reviews"), path: "/#reviews" },
      ];

  const normalizeAvatarUrl = (url?: string | null) => {
    const value = url?.trim();
    if (!value) return "";
    // Some providers may return http links; use https to avoid blocked mixed-content images.
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    return value;
  };

  const preferredAvatarSrc =
    normalizeAvatarUrl(fullUser?.image) ||
    normalizeAvatarUrl(user?.image) ||
    "/user.jfif";

  const avatarSrc =
    failedAvatarSrc === preferredAvatarSrc ? "/user.jfif" : preferredAvatarSrc;

  return (
    <>
      {/* FIXED POSITIONING & POINTER EVENTS:
        'pointer-events-none' on header ensures clicks pass through the empty spaces to the hero section.
        'pointer-events-auto' on nav brings back interactivity just for the navbar itself.
      */}
      <header
        className={`fixed left-0 w-full z-50 flex justify-center px-4 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "top-4" : "top-6"
        }`}
      >
        <nav
          className={`pointer-events-auto relative flex items-center justify-between rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "w-full max-w-5xl px-5 py-3 bg-white/30 dark:bg-[#0F172A]/30 backdrop-blur-lg border border-white/50 dark:border-white/5 shadow-lg"
              : "w-full max-w-6xl px-5 py-3 bg-white/70 dark:bg-[#090F1E]/80 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]"
          }`}
        >
          {/* Subtle Inner Highlight */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] pointer-events-none"></div>

          {/* Brand / Logo */}
          <div className="shrink-0 z-20">
            {mounted && (
              <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <div className="relative w-10 h-10">
                  <Image
                    src={theme === "dark" || (systemTheme === "dark" && theme === "system") ? "/logo-light.png" : "/logo-dark.png"}
                    alt="NovaPay Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
          </div>

          {/* Desktop Links (Center) */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 min-w-0 px-">
            {navLinks.map((link) => {
              const isActive = link.path.startsWith("/#")
                ? activeHash === link.path.replace("/","")
                : pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={
                    !user && link.path.startsWith("/#")
                      ? handleScrollLink(link.path)
                      : undefined
                  }
                  className={`relative text-[14px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white"
                  }`}
                >
                  {link.name}

                  {/* Unread badge on Chat link */}
                  {link.path === "/chat" && unreadTotal > 0 && (
                    <span className="absolute -top-2.5 -right-3.5 bg-red-500 shadow-md text-white text-[10px] font-extrabold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 border border-white dark:border-slate-900">
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>


          {/* Desktop Right - Theme + Auth/Get Started */}
          <div className="hidden lg:flex shrink-0 items-center gap-4 z-30">

            
          <div className="relative z-20">
            <LanguageSwitcher/>
          </div>
            {/* Theme Toggle */}
            <ThemeToggleButton
              variant="circle"
              blur
              className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 transition-all shadow-sm active:scale-95"
            />

            {user ? (
              <div className="relative inline-block" ref={profileDropdownRef}>
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRankModalOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md border cursor-pointer transition-all hover:scale-105 active:scale-95
                    ${
                      fullUser?.rank === "PLATINUM"
                        ? "bg-slate-900 border-slate-700 text-white"
                        : fullUser?.rank === "GOLD"
                          ? "bg-amber-400 border-amber-300 text-amber-950"
                          : fullUser?.rank === "SILVER"
                            ? "bg-slate-200 border-slate-300 text-slate-800"
                            : "bg-red-500 border-red-400 text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {fullUser?.rank === "PLATINUM" && (
                        <Trophy className="w-3 h-3" />
                      )}
                      {fullUser?.rank === "GOLD" && (
                        <Crown className="w-3 h-3" />
                      )}
                      {fullUser?.rank === "SILVER" && (
                        <ShieldCheck className="w-3 h-3" />
                      )}
                      {(!fullUser?.rank || fullUser?.rank === "BRONZE") && (
                        <Star className="w-3 h-3 fill-current" />
                      )}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">
                      {fullUser?.rank || "BRONZE"}
                    </span>
                  </div>

                  {/* User Avatar Container */}
                  <div
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 dark:border-slate-700 cursor-pointer transition-transform hover:scale-105 shadow-md"
                  >
                    <img
                      alt="User Avatar"
                      referrerPolicy="no-referrer"
                      src={avatarSrc}
                      onError={() => setFailedAvatarSrc(preferredAvatarSrc)}
                      className="w-full h-full object-cover"
                    />
                    {/* Online Dot */}
                    <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-green-500 border border-white dark:border-slate-800"></span>
                    </span>
                  </div>
                </div>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+16px)] w-56 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-100 dark:border-slate-800 transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[13px] font-bold"
                      >
                        <FaUser className="text-[15px]" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[13px] font-bold"
                      >
                        <FaGear className="text-[15px]" /> Settings
                      </Link>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-[13px] font-bold"
                      >
                        <IoLogOut className="text-[17px]" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full overflow-hidden border border-transparent shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-40 rounded-t-full"></div>
                <span className="relative text-white text-[13px] font-bold tracking-wide">
                  Get Started
                </span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={3}
                  className="relative text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                />
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex items-center justify-center text-slate-800 dark:text-white z-20 w-10 h-10 bg-white/50 dark:bg-white/10 rounded-full border border-slate-200 dark:border-white/10 shadow-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-[110%] left-4 right-4 z-40 pointer-events-auto bg-white/95 dark:bg-[#0a101f]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl rounded-[2rem] p-6 flex flex-col gap-2 lg:hidden origin-top animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-end mb-2">
              <ThemeToggleButton
                variant="circle"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 transition-all"
              />
            </div>

            {navLinks.map((link) => {
              const isActive =
                pathname === link.path ||
                (link.name === "Home" && pathname === "/");
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (!user && link.path.startsWith("/#")) {
                      const target = document.querySelector(
                        link.path.replace("/", ""),
                      );
                      if (target) target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`px-5 py-4 rounded-xl text-[15px] font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-white border border-blue-100 dark:border-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white px-5 py-4 rounded-xl text-[15px] font-bold transition-colors hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  <FaUser size={16} /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex justify-center items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-4 rounded-xl text-[15px] font-bold shadow-lg shadow-red-500/30"
                >
                  Logout <IoLogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-4 rounded-xl text-[15px] font-bold shadow-lg shadow-blue-500/30"
              >
                Get Started <ArrowUpRight size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        )}
      </header>

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
