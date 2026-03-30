"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/ui/ChatWindow";
import T from "@/components/T";

export default function DMChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  // The channelId from the URL, e.g. "dm-abc123-xyz456"
  const channelId = params.channelId as string;

  const [otherUser, setOtherUser] = useState<{ name: string; image?: string | null } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Extract the other user's ID from the channelId and fetch their info
  useEffect(() => {
    if (!session?.user || !channelId) return;

    // channelId format: "dm-{id1}-{id2}"
    const withoutPrefix = channelId.replace(/^dm-/, "");
    // MongoDB ObjectIds are 24-char hex — split at the hyphen between them
    const otherId = withoutPrefix
      .split("-")
      .filter((part) => part !== session.user.id)
      .join("-"); // rejoin in case ID itself had hyphens (ObjectIds don't, but just safe)

    // Find the other user's ID: the part of channelId that isn't the current user
    // Format is dm-{smallerId}-{largerId}
    const parts = withoutPrefix.match(/^([a-f0-9]{24})-([a-f0-9]{24})$/);
    if (!parts) return;

    const otherUserId = parts[1] === session.user.id ? parts[2] : parts[1];

    fetch(`/api/chat/user-info?userId=${otherUserId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setOtherUser(data.user);
      });
  }, [session, channelId]);

  if (status === "loading" || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#f0f7ff] dark:bg-[#040911] flex flex-col">

      {/* Back button + header */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          <T>← Back</T>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            <T>{otherUser?.name ?? "Direct Message"}</T>
          </h1>
        </div>
      </div>

      {/* Chat window */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-8 flex-1 flex flex-col" style={{ minHeight: "60vh" }}>
        <ChatWindow
          channelId={channelId}
          type="dm"
          currentUser={{
            id: user.id,
            name: user.name ?? "User",
            image: user.image,
          }}
          otherUser={otherUser ?? { name: "User" }}
        />
      </div>

    </div>
  );
}
