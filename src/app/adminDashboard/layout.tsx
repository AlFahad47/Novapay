"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import T from "@/components/T";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileCheck,
  BarChart3,
  LogOut,
  Menu,
  Landmark,
  Crown,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Home,
} from "lucide-react";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
  { icon: Users, label: "Users", path: "/adminDashboard/users" },
  { icon: ShieldAlert, label: "Fraud", path: "/adminDashboard/fraud" },
  { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
  { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
  { icon: Crown, label: "Subscription", path: "/adminDashboard/subscription" },
  { icon: Heart, label: "Campaigns", path: "/adminDashboard/campaigns" },
  {
    icon: Landmark,
    label: "Savings Withdrawals",
    path: "/adminDashboard/savings-withdraw",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------------- ADMIN PROTECTION ---------------- */
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role?.toLowerCase() !== "admin") {
      router.push("/dashboard");
    }

    if (session?.user?.accountStatus === "fraud") {
      signOut({ callbackUrl: "/login?error=fraud_blocked" });
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        <T>Loading admin panel...</T>
      </div>
    );
  }

  /* ---------------- PAGE TITLE ---------------- */
  const pageTitle =
    pathname
      .split("/")
      .pop()
      ?.replace("-", " ")
      .replace(/^\w/, (c) => c.toUpperCase()) || "Overview";

  /* ---------------- SIDEBAR COMPONENT ---------------- */
  const Sidebar = (
    <aside className="h-full w-full bg-white dark:bg-[#0c1a2b] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col">
      {/* SIDEBAR HEADER */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="font-bold text-blue-600 dark:text-blue-400 text-lg hover:opacity-80 transition-opacity"
        >
          {desktopCollapsed ? "N" : <><span>NOVAPAY</span> <span className="text-xs opacity-70">ADMIN</span></>}
        </Link>

        <button
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="hidden lg:block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
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

      {/* NAV ITEMS */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminItems.map((item) => {
          const active =
            item.path === "/adminDashboard"
              ? pathname === "/adminDashboard"
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition
              ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!desktopCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  <T>{item.label}</T>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT AT BOTTOM */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition"
        >
          <LogOut size={20} className="shrink-0" />
          {!desktopCollapsed && (
            <span className="text-sm font-bold"><T>Logout</T></span>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#04090f] overflow-hidden">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR WRAPPER */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full z-40 transition-all duration-300
        ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
        transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {Sidebar}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-[#0c1a2b] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/35 transition-colors"
            >
              <Home size={12} />
              Home
            </Link>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
              <T>{pageTitle}</T>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Bell className="text-gray-500 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition" />

            {/* ADMIN INFO */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {session?.user?.name || "Admin User"}
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full uppercase font-bold self-end">
                {session?.user?.role}
              </span>
            </div>

            <div className="w-9 h-9 relative ring-2 ring-gray-100 dark:ring-gray-800 rounded-full">
              <Image
                src={session?.user?.image || "/dashboard.jfif"}
                alt="admin profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 text-gray-800 dark:text-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
}
