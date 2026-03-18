"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Crown, Loader2, Users, TrendingUp } from "lucide-react";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<{ subscribers: number; revenue: number } | null>(null);

  const isAdmin = session?.user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!session?.user?.email || !isAdmin) {
      setLoading(false);
      return;
    }

    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        const stats = data.stats || [];
        const subscribers = stats.find((s: any) => s.title === "Subscribers")?.value ?? 0;
        const revenue = stats.find((s: any) => s.title === "Subscription Revenue")?.value ?? 0;
        setAdminStats({ subscribers, revenue });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Access Denied: Admins Only</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="text-yellow-400" size={24} />
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Subscription Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Subscribers Card */}
        <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
            <Users size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-blue-400">Total Subscribers</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {adminStats?.subscribers ?? 0}
            </p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white dark:bg-[#0c1a2b] rounded-2xl border border-blue-100 dark:border-blue-900 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <TrendingUp size={22} className="text-green-500" />
          </div>
          <div>
            <p className="text-sm text-blue-400">Subscription Revenue</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              ৳{(adminStats?.revenue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}