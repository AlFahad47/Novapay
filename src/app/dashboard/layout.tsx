

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  MessageSquare,
  Menu,
  X,
  Crown,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: FileCheck, label: "KYC", path: "/dashboard/kyc" },
  { icon: MessageSquare, label: "Support", path: "/chat/support" },
  { icon: Crown, label: "Subscription", path: "/dashboard/subscription" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const[isSubscribed, setSubscribed]=useState(false)

  /* ---------------- PROTECT USER DASHBOARD ---------------- */

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    }

    if (session?.user?.role === "admin") {
      router.push("/adminDashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  /* ---------------- PAGE TITLE ---------------- */

  const pageTitle = pathname
    .split("/")
    .pop()
    ?.replace("-", " ")
    .replace(/^\w/, (c) => c.toUpperCase());

  /* ---------------- SIDEBAR ---------------- */

  const Sidebar = (
    <aside
      className={`h-full w-full
      ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
      bg-white dark:bg-[#0c1a2b]
      border-r border-gray-200 dark:border-gray-700
      transition-all duration-300`}
    >
      {/* LOGO */}

      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!desktopCollapsed && (
          <h1 className="font-bold text-blue-600 dark:text-blue-400">
            NovaPay
          </h1>
        )}

        <button
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="hidden lg:block text-gray-600 dark:text-gray-300"
        >
          {desktopCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="p-3 space-y-1">
        {sidebarItems.map((item) => {
          const active =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
              
              ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              }`}
            >
              <item.icon size={20} />

              {!desktopCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  /* ---------------- LAYOUT ---------------- */

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#04090f]">
      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <div
        className={`
        fixed lg:relative top-0 left-0 h-full z-40
        ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
        transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {Sidebar}
      </div>

      {/* MAIN */}

      <div className="flex-1 flex flex-col">
        {/* HEADER */}

        <header
          className="h-16 bg-white dark:bg-[#0c1a2b]
          border-b border-gray-200 dark:border-gray-700
          flex items-center justify-between px-4 lg:px-6"
        >
          {/* LEFT */}

          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
              {pageTitle}
            </h2>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">
            <Bell className="text-gray-500 dark:text-gray-300 cursor-pointer" />

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {session?.user?.name}
              </span>

              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {session?.user?.role}
              </span>
            </div>

            <div className="w-9 h-9 relative">
              <Image
                src={session?.user?.image || "/dashboard.jfif"}
                alt="profile"
                fill
                className="rounded-full object-cover"
              />
              {isSubscribed && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-0.5 shadow">
                  <Crown size={10} className="text-white" />
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Subscription expiry warning */}
        {isSubscribed && daysLeft !== null && daysLeft <= 3 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 px-6 py-2 flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
            <Crown size={14} className="text-yellow-500 shrink-0" />
            <span>
              Your Elite subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.{" "}
              <Link href="/dashboard/subscription" className="underline font-medium">Renew now</Link>
            </span>
          </div>
        )}

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}