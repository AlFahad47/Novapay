"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  FileCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
  { icon: Users, label: "Users", path: "/adminDashboard/users" },
  { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
  { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
  // { icon: MessageSquare, label: "Support", path: "/adminDashboard/support" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* -------------------- PROTECT ADMIN -------------------- */

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Loading admin panel...
      </div>
    );
  }

  /* -------------------- PAGE TITLE -------------------- */

  const pageTitle = pathname
    .split("/")
    .pop()
    ?.replace("-", " ")
    .replace(/^\w/, (c) => c.toUpperCase());

  /* -------------------- SIDEBAR -------------------- */

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
            NovaPay Admin
          </h1>
        )}

        {/* collapse desktop */}

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

        {/* close mobile */}

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="p-3 space-y-1">
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

  /* -------------------- LAYOUT -------------------- */

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

      {/* MAIN AREA */}

      <div className="flex-1 flex flex-col">
        {/* HEADER */}

        <header
          className="h-16 bg-white dark:bg-[#0c1a2b]
          border-b border-gray-200 dark:border-gray-700
          flex items-center justify-between px-4 lg:px-6"
        >
          {/* LEFT */}

          <div className="flex items-center gap-3">
            {/* mobile menu */}

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
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
