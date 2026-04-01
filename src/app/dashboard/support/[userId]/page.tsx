"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/ui/ChatWindow";
import clientPromise from "@/lib/mongodb";
import Link from "next/link";

// Shape of the user we're replying to
interface SupportUser {
  name: string;
  image?: string | null;
  email: string;
}

export default function AdminReplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  // userId comes from the URL: /dashboard/support/abc123 → params.userId = "abc123"
  const userId = params.userId as string;

  const [supportUser, setSupportUser] = useState<SupportUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role && session.user.role.toLowerCase() !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Fetch the user's basic info (name, image) from our API so we can show it in the header
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      const res = await fetch(`/api/chat/user-info?userId=${userId}`);
      const data = await res.json();
      setSupportUser(data.user ?? null);
      setLoadingUser(false);
    };

    fetchUser();
  }, [userId]);

  if (status === "loading" || loadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const admin = session.user;

  // Same channelId as the user's support page - both sides subscribe to the same channel
  const channelId = `support-${userId}`;

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#040911] flex flex-col">

      {/* Back button + header */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-8 pb-4">
        <Link
          href="/dashboard/support"
          className="text-sm text-blue-500 hover:underline mb-3 inline-block"
        >
          ← Back to inbox
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {supportUser?.name ?? "User"}'s Support Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {supportUser?.email}
        </p>
      </div>

      {/* Chat window - admin and user share the same channelId */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-8 flex-1 flex flex-col" style={{ minHeight: "60vh" }}>
        <ChatWindow
          channelId={channelId}
          type="support"
          currentUser={{
            id: admin.id,
            name: admin.name ?? "Support",
            image: admin.image,
          }}
          otherUser={{
            name: supportUser?.name ?? "User",
            image: supportUser?.image,
          }}
        />
      </div>

    </div>
  );
}

