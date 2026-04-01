"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import T from "@/components/T";

// Shape of each conversation returned from the API
interface Conversation {
  _id: string;         // channelId e.g. "support-abc123"
  lastMessage: string;
  lastTimestamp: string;
  senderName: string;
  senderImage?: string | null;
  senderId: string;
  unreadCount: number;
}

export default function AdminSupportInbox() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in or not admin
  // Note: we check that role is defined before redirecting - avoids false redirect while session is hydrating
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

  // Fetch all support conversations from the API
  useEffect(() => {
    if (session?.user?.role?.toLowerCase() !== "admin") return;

    const fetchConversations = async () => {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setLoading(false);
    };

    fetchConversations();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#040911] px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1"><T>Support Inbox</T></h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <T>All user support conversations - click to reply.</T>
        </p>

        {/* Conversation list */}
        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 mt-20"><T>No support messages yet.</T></p>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => {
              // Extract userId from channelId: "support-abc123" → "abc123"
              const userId = conv._id.replace("support-", "");

              return (
                <Link
                  key={conv._id}
                  href={`/dashboard/support/${userId}`}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  {conv.senderImage ? (
                    <Image src={conv.senderImage} alt={conv.senderName} width={44} height={44} className="rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {conv.senderName?.[0] ?? "U"}
                    </div>
                  )}

                  {/* Message preview */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{conv.senderName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{conv.lastMessage}</p>
                  </div>

                  {/* Right side: time + unread badge */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

