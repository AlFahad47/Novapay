"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // ✅ ADDED signOut
import type { SubscriptionStatusResponse } from "@/types/subscription";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Home,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  MessageSquare,
  X,
  Menu,
  Heart,
  Crown,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const accountStatus =
    (session?.user as { accountStatus?: string } | undefined)?.accountStatus ||
    "active";
  const t = useTranslations("sidebar");
  const td = useTranslations("dashboard");

  const sidebarItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/dashboard" },
    { icon: CreditCard, label: t("transactions"), path: "/dashboard/transactions" },
    { icon: BarChart3, label: t("analytics"), path: "/dashboard/analytics" },
    { icon: FileCheck, label: t("kyc"), path: "/dashboard/kyc" },
    { icon: Crown, label: t("subscription"), path: "/dashboard/subscription" },
    { icon: MessageSquare, label: t("support"), path: "/chat" },
    { icon: Settings, label: t("settings"), path: "/dashboard/settings" },
  ];

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatusResponse>({
      subscribed: false,
      subscription: null,
      daysLeft: null,
    });

  const isSubscribed = subscriptionStatus.subscribed;
  const daysLeft = subscriptionStatus.daysLeft;

  useEffect(() => {
    if (status === "loading") return;

    if (!session) { 
      router.push("/login");
      return;
    }

    // 🚨 FRAUD AUTO LOGOUT (ADDED)
    if (accountStatus === "fraud") {
      signOut({
        callbackUrl: "/login?error=fraud_blocked",
      });
      return;
    }

    if (session?.user?.role?.toLowerCase() === "admin") {
      router.push("/adminDashboard");
    }
  }, [session, status, router, accountStatus]);

  /* ---------------- SUBSCRIPTION FETCH ---------------- */

  useEffect(() => {
    const email = session?.user?.email;

    if (!email) {
      setSubscriptionStatus({
        subscribed: false,
        subscription: null,
        daysLeft: null,
      });
      return;
    }

    let isMounted = true;

    const fetchSubscriptionStatus = async () => {
      try {
        const res = await fetch(
          `/api/subscription/status?email=${encodeURIComponent(email)}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch subscription status");
        }

        const data: SubscriptionStatusResponse = await res.json();

        if (isMounted) {
          setSubscriptionStatus(data);
        }
      } catch {
        if (isMounted) {
          setSubscriptionStatus({
            subscribed: false,
            subscription: null,
            daysLeft: null,
          });
        }
      }
    };

    fetchSubscriptionStatus();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        {td("loading")}
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
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          className="font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
        >
          {desktopCollapsed ? "N" : "NOVAPAY"}
        </Link>

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

        {/* Donate - Elite subscribers only */}
        {isSubscribed && (
          <Link
            href="/donation"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
            ${
              pathname === "/donation"
                ? "bg-[#e63b60] text-white"
                : "text-[#e63b60] hover:bg-pink-50 dark:hover:bg-pink-900/20"
            }`}
          >
            <Heart size={20} />
            {!desktopCollapsed && (
              <span className="text-sm font-medium">{t("donate")}</span>
            )}
          </Link>
        )}
      </nav>
    </aside>
  );

  /* ---------------- LAYOUT ---------------- */

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#04090f]">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed lg:relative top-0 left-0 h-full z-40
        ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
        transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {Sidebar}
      </div>

      <div className="flex-1 flex flex-col">
        <header
          className="h-16 bg-white dark:bg-[#0c1a2b]
          border-b border-gray-200 dark:border-gray-700
          flex items-center justify-between px-4 lg:px-6"
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/35 transition-colors"
            >
              <Home size={12} />
              Home
            </Link>

            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
              {pageTitle}
            </h2>
          </div>

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

        {isSubscribed && daysLeft !== null && daysLeft <= 3 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 px-6 py-2 flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
            <Crown size={14} className="text-yellow-500 shrink-0" />
            <span>
              {td("subscription_expiry")}{" "}
              <strong>
                {daysLeft} {daysLeft !== 1 ? td("days") : td("day")}
              </strong>
              .{" "}
              <Link
                href="/dashboard/subscription"
                className="underline font-medium"
              >
                {td("renew_now")}
              </Link>
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

