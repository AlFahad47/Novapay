"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import pusherClient from "@/lib/pusherClient";

// Shape of a single chat message
interface Message {
  senderId: string;
  senderName: string;
  senderImage?: string | null;
  text: string;
  timestamp: string | Date;
  read: boolean;
}

// Props this component accepts
interface ChatWindowProps {
  channelId: string;   // e.g. "support-abc123" or "dm-abc-xyz"
  type: "support" | "dm";
  currentUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  otherUser?: {
    name: string;
    image?: string | null;
  };
}

export default function ChatWindow({ channelId, type, currentUser, otherUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // This ref points to the bottom of the message list — used for auto-scroll
  const bottomRef = useRef<HTMLDivElement>(null);

  // ─── Step 1: Load past messages when the component first mounts ───────────
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`/api/chat/history?channelId=${channelId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setLoading(false);
    };
    fetchHistory();
  }, [channelId]);

  // ─── Step 2: Subscribe to Pusher channel for real-time new messages ────────
  useEffect(() => {
    // Subscribe to the channel (e.g. "support-abc123")
    console.log("🔌 Subscribing to Pusher channel:", channelId);
    const channel = pusherClient.subscribe(channelId);

    // Listen for the "new-message" event — triggered by /api/chat/send
    channel.bind("new-message", (data: Message) => {
      // Add the new message to the end of the list
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup: unsubscribe when component unmounts (page changes)
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelId);
    };
  }, [channelId]);

  // ─── Step 3: Auto-scroll to bottom whenever messages change ───────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Step 4: Send a message ────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setSending(true);
    setInputText("");

    // Optimistic update — show the message instantly for the sender
    // without waiting for Pusher to deliver it back
    const optimisticMessage: Message = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderImage: currentUser.image,
      text,
      timestamp: new Date(),
      read: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, type, text }),
    });

    setSending(false);
  };

  // Allow sending with Enter key (Shift+Enter = new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">

      {/* Header — shows who you are chatting with */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {otherUser?.image ? (
          <Image src={otherUser.image} alt={otherUser.name} width={36} height={36} className="rounded-full" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {otherUser?.name?.[0] ?? "S"}
          </div>
        )}
        <span className="font-semibold text-gray-800 dark:text-white">
          {otherUser?.name ?? "Support"}
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <p className="text-center text-gray-400 text-sm">Loading messages...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUser.id;

          return (
            <div key={i} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              {msg.senderImage ? (
                <Image src={msg.senderImage} alt={msg.senderName} width={28} height={28} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs flex-shrink-0">
                  {msg.senderName?.[0] ?? "?"}
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                isOwn
                  ? "bg-blue-500 text-white rounded-br-sm"       // own message = blue, right side
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm" // other = gray, left side
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-400"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Invisible div at the bottom — scrolled into view on new message */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || sending}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
