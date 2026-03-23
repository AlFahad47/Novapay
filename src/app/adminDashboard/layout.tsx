"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
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
} from "lucide-react";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
  { icon: Users, label: "Users", path: "/adminDashboard/users" },
  { icon: ShieldAlert, label: "Fraud", path: "/adminDashboard/fraud" },
  { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
  { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
   { icon: Crown, label: "Subscription", path:"/adminDashboard/subscription" },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // ১. অ্যাডমিন প্রোটেকশন
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
    }

    // ২. ফ্রড প্রোটেকশন (লগআউট করে দেবে)
    if (session?.user?.accountStatus === "fraud") {
      signOut({ callbackUrl: "/login?error=fraud_blocked" });
    }
  }, [session, status, router]);

  if (status === "loading")
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#04090f]">
      <aside
        className={`fixed lg:relative z-40 h-full w-64 bg-white dark:bg-[#0c1a2b] border-r border-gray-200 dark:border-gray-700 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 font-bold text-blue-600 border-b dark:border-gray-700 text-xl">
          NovaPay ADMIN
        </div>
        <nav className="p-4 space-y-2">
          {adminItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl ${pathname === item.path ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <item.icon size={20} />{" "}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 p-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl mt-10"
          >
            <LogOut size={20} />{" "}
            <span className="text-sm font-bold">Logout</span>
          </button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#0c1a2b] border-b dark:border-gray-700">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu />
          </button>
          <div className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
            {pathname.split("/").pop()?.replace("-", " ") || "Overview"}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
