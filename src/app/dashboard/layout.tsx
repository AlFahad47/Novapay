


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ShieldCheckIcon,
  FileCheck,
  MessageSquare,
  Crown,
} from "lucide-react";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
  userOnly?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },

  // ✅ ADMIN ONLY PAGES
  {
    icon: UserCog,
    label: "Admin",
    path: "/dashboard/admin",
    adminOnly: true,
  },
  // {
  //   icon: ShieldCheckIcon,
  //   label: "User Request",
  //   path: "/dashboard/userRequest",
  //   adminOnly: true,
  // },

  { icon: Users, label: "Users", path: "/dashboard/users" },
  { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: FileCheck, label: "KYC", path: "/dashboard/kyc" },

  // Support (Dynamic)
  {
    icon: MessageSquare,
    label: "Support",
    path: "/dashboard/support",
    adminOnly: true,
  },
  {
    icon: MessageSquare,
    label: "Support",
    path: "/chat/support",
    userOnly: true,
  },

  { icon: Crown, label: "Subscription", path: "/dashboard/subscription", userOnly: true },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadSupport, setUnreadSupport] = useState(0);

  const isAdmin =
    session?.user?.role?.toLowerCase() === "admin";

  // ✅ ROLE FILTER
  const visibleItems = sidebarItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.userOnly) return !isAdmin;
    return true;
  });

  // ✅ FETCH UNREAD SUPPORT COUNT
  useEffect(() => {
    if (!session?.user) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/chat/unread-count");
        const data = await res.json();
        setUnreadSupport(data.support ?? 0);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    return () => clearInterval(interval);
  }, [session]);

  // ✅ DYNAMIC PAGE TITLE
  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    const segment = parts.pop();

    if (!segment || segment === "dashboard") return "Dashboard";

    if (/^[a-f0-9]{24}$/i.test(segment)) {
      const parent = parts.pop();
      return parent ? parent.replace(/-/g, " ") : "Details";
    }

    return segment.replace(/-/g, " ");
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden relative bg-blue-50 dark:bg-[#04090f]">
      
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full
          ${collapsed ? "w-20" : "w-64"}
          bg-white dark:bg-[#0c1a2b]
          border-r border-blue-200 dark:border-blue-900
          transition-all duration-300 flex flex-col z-40
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-200 dark:border-blue-900">
          {!collapsed && (
            <h1 className="text-lg font-bold text-[#0070ff] dark:text-[#00b4ff] tracking-wide">
              NovaPay
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-blue-400" />
            ) : (
              <ChevronLeft size={18} className="text-blue-400" />
            )}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              item.path === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0070ff] text-white shadow-md"
                    : "text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                }`}
              >
                <item.icon size={18} className="text-blue-400" />

                {!collapsed && (
                  <span className="flex-1">{item.label}</span>
                )}

                {/* 🔴 Unread badge */}
                {item.label === "Support" && unreadSupport > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadSupport > 99 ? "99+" : unreadSupport}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-[#0c1a2b] border-b border-blue-200 dark:border-blue-900 flex items-center justify-between px-6">
          
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-blue-500 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            ☰
          </button>

          <h2 className="text-lg font-semibold capitalize text-blue-800 dark:text-blue-200">
            {getPageTitle()}
          </h2>

          <div className="flex items-center gap-5">
            {/* 🔔 Bell */}
            <button
              className="relative"
              onClick={() =>
                (window.location.href = isAdmin
                  ? "/dashboard/support"
                  : "/chat/support")
              }
            >
              <Bell className="w-5 h-5 text-blue-400" />

              {unreadSupport > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {unreadSupport > 99 ? "99+" : unreadSupport}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="w-9 h-9 relative">
              <Image
                src="/dashboard.jfif"
                alt="Profile"
                fill
                className="rounded-full object-cover border border-blue-300 dark:border-blue-700/50"
              />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 text-blue-900 dark:text-blue-100/80">
          {children}
        </main>
      </div>
    </div>
  );
}