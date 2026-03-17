// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Link from "next/link";
// // import Image from "next/image";
// // import { usePathname, useRouter } from "next/navigation";
// // import { useSession } from "next-auth/react";
// // import {
// //   LayoutDashboard,
// //   Users,
// //   BarChart3,
// //   MessageSquare,
// //   FileCheck,
// //   Bell,
// //   ChevronLeft,
// //   ChevronRight,
// //   Menu,
// //   X,
// // } from "lucide-react";

// // const adminItems = [
// //   { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
// //   { icon: Users, label: "Users", path: "/adminDashboard/users" },
// //   { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
// //   { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
// //   // { icon: MessageSquare, label: "Support", path: "/adminDashboard/support" },
// // ];

// // export default function AdminLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const pathname = usePathname();
// //   const router = useRouter();
// //   const { data: session, status } = useSession();

// //   const [desktopCollapsed, setDesktopCollapsed] = useState(false);
// //   const [mobileOpen, setMobileOpen] = useState(false);

// //   /* -------------------- PROTECT ADMIN -------------------- */

// //   useEffect(() => {
// //     if (status === "loading") return;

// //     if (!session || session.user.role !== "admin") {
// //       router.push("/dashboard");
// //     }
// //   }, [session, status, router]);

// //   if (status === "loading") {
// //     return (
// //       <div className="h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
// //         Loading admin panel...
// //       </div>
// //     );
// //   }

// //   /* -------------------- PAGE TITLE -------------------- */

// //   const pageTitle = pathname
// //     .split("/")
// //     .pop()
// //     ?.replace("-", " ")
// //     .replace(/^\w/, (c) => c.toUpperCase());

// //   /* -------------------- SIDEBAR -------------------- */

// //   const Sidebar = (
// //     <aside
// //       className={`h-full w-full
// //       ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
// //       bg-white dark:bg-[#0c1a2b]
// //       border-r border-gray-200 dark:border-gray-700
// //       transition-all duration-300`}
// //     >
// //       {/* LOGO */}

// //       <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
// //         {!desktopCollapsed && (
// //           <h1 className="font-bold text-blue-600 dark:text-blue-400">
// //             LENDEN Admin
// //           </h1>
// //         )}

// //         {/* collapse desktop */}

// //         <button
// //           onClick={() => setDesktopCollapsed(!desktopCollapsed)}
// //           className="hidden lg:block text-gray-600 dark:text-gray-300"
// //         >
// //           {desktopCollapsed ? (
// //             <ChevronRight size={18} />
// //           ) : (
// //             <ChevronLeft size={18} />
// //           )}
// //         </button>

// //         {/* close mobile */}

// //         <button
// //           onClick={() => setMobileOpen(false)}
// //           className="lg:hidden text-gray-600 dark:text-gray-300"
// //         >
// //           <X size={20} />
// //         </button>
// //       </div>

// //       {/* NAVIGATION */}

// //       <nav className="p-3 space-y-1">
// //         {adminItems.map((item) => {
// //           const active =
// //             item.path === "/adminDashboard"
// //               ? pathname === "/adminDashboard"
// //               : pathname.startsWith(item.path);

// //           return (
// //             <Link
// //               key={item.path}
// //               href={item.path}
// //               onClick={() => setMobileOpen(false)}
// //               className={`flex items-center gap-3 px-3 py-2 rounded-lg transition

// //               ${
// //                 active
// //                   ? "bg-blue-600 text-white"
// //                   : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
// //               }`}
// //             >
// //               <item.icon size={20} />

// //               {!desktopCollapsed && (
// //                 <span className="text-sm font-medium">{item.label}</span>
// //               )}
// //             </Link>
// //           );
// //         })}
// //       </nav>
// //     </aside>
// //   );

// //   /* -------------------- LAYOUT -------------------- */

// //   return (
// //     <div className="flex h-screen bg-gray-50 dark:bg-[#04090f]">
// //       {/* MOBILE OVERLAY */}

// //       {mobileOpen && (
// //         <div
// //           className="fixed inset-0 bg-black/40 z-30 lg:hidden"
// //           onClick={() => setMobileOpen(false)}
// //         />
// //       )}

// //       {/* SIDEBAR */}

// //       <div
// //         className={`
// //   fixed lg:relative top-0 left-0 h-full z-40
// //   ${desktopCollapsed ? "lg:w-20" : "lg:w-64"} w-64
// //   transform transition-transform duration-300
// //   ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
// //   lg:translate-x-0
// // `}
// //       >
// //         {Sidebar}
// //       </div>

// //       {/* MAIN AREA */}

// //       <div className="flex-1 flex flex-col">
// //         {/* HEADER */}

// //         <header
// //           className="h-16 bg-white dark:bg-[#0c1a2b]
// //           border-b border-gray-200 dark:border-gray-700
// //           flex items-center justify-between px-4 lg:px-6"
// //         >
// //           {/* LEFT */}

// //           <div className="flex items-center gap-3">
// //             {/* mobile menu */}

// //             <button
// //               className="lg:hidden text-gray-700 dark:text-gray-300"
// //               onClick={() => setMobileOpen(true)}
// //             >
// //               <Menu size={22} />
// //             </button>

// //             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
// //               {pageTitle}
// //             </h2>
// //           </div>

// //           {/* RIGHT */}

// //           <div className="flex items-center gap-4">
// //             <Bell className="text-gray-500 dark:text-gray-300 cursor-pointer" />

// //             <div className="hidden sm:flex flex-col text-right">
// //               <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
// //                 {session?.user?.name}
// //               </span>

// //               <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
// //                 {session?.user?.role}
// //               </span>
// //             </div>

// //             <div className="w-9 h-9 relative">
// //               <Image
// //                 src={session?.user?.image || "/dashboard.jfif"}
// //                 alt="profile"
// //                 fill
// //                 className="rounded-full object-cover"
// //               />
// //             </div>
// //           </div>
// //         </header>

// //         {/* PAGE CONTENT */}

// //         <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import {
//   LayoutDashboard,
//   Users,
//   BarChart3,
//   FileCheck,
//   Bell,
//   ChevronLeft,
//   ChevronRight,
//   Menu,
//   X,
//   LogOut,
//   ShieldAlert,
// } from "lucide-react";

// const adminItems = [
//   { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
//   { icon: Users, label: "Users", path: "/adminDashboard/users" },
//   { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
//   { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   const [desktopCollapsed, setDesktopCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   /* -------------------- PROTECT ADMIN & FRAUD CHECK -------------------- */
//   useEffect(() => {
//     if (status === "loading") return;

//     // যদি সেশন না থাকে বা রোল এডমিন না হয়, তবে রিডাইরেক্ট হবে
//     if (!session || session.user.role !== "admin") {
//       router.push("/dashboard");
//     }

//     // 🔴 Fraud account হলে এডমিন প্যানেল এক্সেস ব্লক হবে
//     if (session?.user?.accountStatus === "fraud") {
//       signOut({ callbackUrl: "/login?error=blocked" });
//     }
//   }, [session, status, router]);

//   if (status === "loading") {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#04090f]">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
//         <p className="text-gray-600 dark:text-gray-300 font-medium">
//           Verifying Admin Access...
//         </p>
//       </div>
//     );
//   }

//   const pageTitle =
//     pathname === "/adminDashboard"
//       ? "Dashboard Overview"
//       : pathname.split("/").pop()?.replace(/-/g, " ");

//   /* -------------------- SIDEBAR COMPONENT -------------------- */
//   const Sidebar = (
//     <aside className="h-full flex flex-col">
//       <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
//         {!desktopCollapsed && (
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-blue-600 rounded-lg">
//               <ShieldAlert className="text-white" size={18} />
//             </div>
//             <h1 className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
//               LENDEN <span className="text-blue-600">PRO</span>
//             </h1>
//           </div>
//         )}

//         <button
//           onClick={() => setDesktopCollapsed(!desktopCollapsed)}
//           className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
//         >
//           {desktopCollapsed ? (
//             <ChevronRight size={20} />
//           ) : (
//             <ChevronLeft size={20} />
//           )}
//         </button>

//         <button
//           onClick={() => setMobileOpen(false)}
//           className="lg:hidden text-gray-500"
//         >
//           <X size={22} />
//         </button>
//       </div>

//       <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
//         {adminItems.map((item) => {
//           const active =
//             item.path === "/adminDashboard"
//               ? pathname === "/adminDashboard"
//               : pathname.startsWith(item.path);

//           return (
//             <Link
//               key={item.path}
//               href={item.path}
//               onClick={() => setMobileOpen(false)}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
//               ${
//                 active
//                   ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                   : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
//               }`}
//             >
//               <item.icon
//                 size={20}
//                 className={
//                   active
//                     ? "text-white"
//                     : "group-hover:scale-110 transition-transform"
//                 }
//               />
//               {!desktopCollapsed && (
//                 <span className="text-sm font-semibold">{item.label}</span>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout at Bottom */}
//       <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//         <button
//           onClick={() => signOut()}
//           className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-xl transition-colors"
//         >
//           <LogOut size={20} />
//           {!desktopCollapsed && (
//             <span className="text-sm font-bold">Sign Out</span>
//           )}
//         </button>
//       </div>
//     </aside>
//   );

//   return (
//     <div className="flex h-screen bg-gray-50 dark:bg-[#04090f] overflow-hidden">
//       {/* MOBILE OVERLAY */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* SIDEBAR CONTAINER */}
//       <div
//         className={`
//         fixed lg:relative top-0 left-0 h-full z-40
//         ${desktopCollapsed ? "lg:w-20" : "lg:w-66"} bg-white dark:bg-[#0c1a2b]
//         border-r border-gray-200 dark:border-gray-700
//         transform transition-all duration-300 ease-in-out
//         ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//       `}
//       >
//         {Sidebar}
//       </div>

//       {/* MAIN CONTENT AREA */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="h-16 bg-white/80 dark:bg-[#0c1a2b]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
//           <div className="flex items-center gap-4">
//             <button
//               className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
//               onClick={() => setMobileOpen(true)}
//             >
//               <Menu size={24} />
//             </button>
//             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
//               {pageTitle}
//             </h2>
//           </div>

//           <div className="flex items-center gap-2 sm:gap-4">
//             <div className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors">
//               <Bell size={20} />
//               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0c1a2b]"></span>
//             </div>

//             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

//             <div className="flex items-center gap-3">
//               <div className="hidden sm:flex flex-col text-right">
//                 <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none mb-1">
//                   {session?.user?.name}
//                 </span>
//                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
//                   System Admin
//                 </span>
//               </div>
//               <div className="w-9 h-9 relative ring-2 ring-gray-100 dark:ring-gray-800 rounded-full">
//                 <Image
//                   src={session?.user?.image || "/dashboard.jfif"}
//                   alt="profile"
//                   fill
//                   className="rounded-full object-cover p-0.5"
//                 />
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
//           <div className="max-w-7xl mx-auto">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  LogOut,
  Menu,
  Landmark,
} from "lucide-react";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/adminDashboard" },
  { icon: Users, label: "Users", path: "/adminDashboard/users" },
  { icon: FileCheck, label: "Requests", path: "/adminDashboard/requests" },
  { icon: BarChart3, label: "Analytics", path: "/adminDashboard/analytics" },
  { 
  icon: Landmark, 
  label: "Savings Withdrawals", 
  path: "/adminDashboard/savings-withdraw" 
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
