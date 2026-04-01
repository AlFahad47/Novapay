"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatWindow from "@/components/ui/ChatWindow";
import T from "@/components/T";

export default function SupportChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If not logged in, redirect to login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show nothing while session is loading
  if (status === "loading" || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session.user;

  // Channel name is unique per user - only this user and any admin can see this channel
  // Example: "support-abc123"
  const channelId = `support-${user.id}`;

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#040911] flex flex-col">

      {/* Page header */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white"><T>Support Chat</T></h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <T>Chat with our support team. We typically reply within a few minutes.</T>
        </p>
      </div>

      {/* Chat window - takes up remaining screen height */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-8 flex-1 flex flex-col" style={{ minHeight: "60vh" }}>
        <ChatWindow
          channelId={channelId}
          type="support"
          currentUser={{
            id: user.id,
            name: user.name ?? "User",
            image: user.image,
          }}
          otherUser={{
            name: "Support Team",
            image: null,
          }}
        />
      </div>

    </div>
  );
}

