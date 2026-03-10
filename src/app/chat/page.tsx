"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface DMConversation {
  _id: string;          // channelId e.g. "dm-abc-xyz"
  otherUserId: string;
  lastMessage: string;
  lastTimestamp: string;
  lastSenderId: string;
  unreadCount: number;
}

interface UserResult {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
}

export default function ChatHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [otherUsers, setOtherUsers] = useState<Record<string, UserResult>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load DM conversations on mount
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/chat/dm-conversations")
      .then((r) => r.json())
      .then(async (data) => {
        const convs: DMConversation[] = data.conversations ?? [];
        setConversations(convs);

        // Fetch the other user's info for each conversation
        const userMap: Record<string, UserResult> = {};
        await Promise.all(
          convs.map(async (conv) => {
            const res = await fetch(`/api/chat/user-info?userId=${conv.otherUserId}`);
            const info = await res.json();
            if (info.user) {
              userMap[conv.otherUserId] = { _id: conv.otherUserId, ...info.user };
            }
          })
        );
        setOtherUsers(userMap);
      });
  }, [status]);

  // Search users as the user types (debounced via useEffect)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/chat/search-users?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.users ?? []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (status === "loading" || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentUserId = session.user.id;

  // Build the consistent DM channelId for two users
  const dmChannelId = (otherUserId: string) => {
    const ids = [currentUserId, otherUserId].sort();
    return `dm-${ids[0]}-${ids[1]}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] dark:bg-[#040911] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Chat with support or message other users
          </p>
        </div>

        {/* Support card */}
        <Link
          href="/chat/support"
          className="flex items-center gap-4 p-4 bg-white dark:bg-[#0d1b2e] rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 dark:text-white">Support Team</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              Get help with your account
            </p>
          </div>
          <span className="text-blue-500 text-sm font-medium">Chat →</span>
        </Link>

        {/* Search bar */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Start a new conversation
          </p>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-white dark:bg-[#0d1b2e] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 dark:text-white placeholder-gray-400"
          />

          {/* Search results */}
          {searchQuery.trim() && (
            <div className="mt-2 bg-white dark:bg-[#0d1b2e] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
              {searching && (
                <p className="text-center text-gray-400 text-sm py-4">Searching...</p>
              )}
              {!searching && searchResults.filter((u) => u._id !== currentUserId).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No users found</p>
              )}
              {searchResults
                .filter((u) => u._id !== currentUserId)
                .map((user) => (
                  <Link
                    key={user._id}
                    href={`/chat/dm/${dmChannelId(user._id)}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                    onClick={() => setSearchQuery("")}
                  >
                    {user.image ? (
                      <Image src={user.image} alt={user.name} width={36} height={36} className="rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.name?.[0] ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* DM conversation list */}
        {conversations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent conversations
            </p>
            <div className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {conversations.map((conv, i) => {
                const other = otherUsers[conv.otherUserId];
                const isLast = i === conversations.length - 1;
                return (
                  <Link
                    key={conv._id}
                    href={`/chat/dm/${conv._id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${!isLast ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
                  >
                    {/* Avatar */}
                    {other?.image ? (
                      <Image src={other.image} alt={other.name} width={40} height={40} className="rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {other?.name?.[0] ?? "?"}
                      </div>
                    )}

                    {/* Message preview */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {other?.name ?? "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {conv.lastSenderId === currentUserId ? "You: " : ""}
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge + time */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {conversations.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No direct messages yet. Search for a user above to start chatting.
          </p>
        )}

      </div>
    </div>
  );
}
