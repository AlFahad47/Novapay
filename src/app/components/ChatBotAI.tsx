"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function ChatBotAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch("/api/ai-chatbot").then(res => res.json()).then(data => {
        setMessages(data.length > 0 ? data : [{ role: "assistant", content: "I'm Nova AI. Ask me anything about your credit limit!" }]);
      });
    }
  }, [isOpen]);


useEffect(() => {
  const loadHistory = async () => {
    // Only fetch if we are NOT in the middle of loading the session
    if (status === "loading") return;

    try {
      const res = await fetch("/api/ai-chatbot");
      
      if (res.status === 401 || !res.ok) {
        // GUEST MODE: No DB history available
        setMessages([{ role: "assistant", content: "Hi Guest! I'm Nova AI. Ask me anything!" }]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // USER MODE: Found your real history in MongoDB
        setMessages(data);
      } else {
        // NEW USER: Logged in but no messages yet
        setMessages([{ role: "assistant", content: `Hi ${session?.user?.name || 'User'}! How can I help with your wallet?` }]);
      }
    } catch (err) {
      setMessages([{ role: "assistant", content: "Hi! I'm Nova AI. Ask me anything!" }]);
    }
  };

  loadHistory();
}, [status, isOpen]);



useEffect(() => {
  // Scrolls to the bottom whenever messages change
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [messages]);


  // useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/ai-chatbot", { method: "POST", body: JSON.stringify({ message: userMsg.content }) });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-24 z-50">
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/90 dark:bg-[#121928]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800/60 w-80 h-[450px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden"
      >
        {/* Header - Matching FAQ Blue Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-tight">Nova AI Assistant</span>
              <span className="text-[10px] opacity-80 flex items-center gap-1">
                <span className="size-1.5 bg-green-400 rounded-full animate-pulse" /> Always Online
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Area - Matching FAQ Background Grid feel */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] shadow-sm ${
                m.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/20" 
                  : "bg-white dark:bg-[#0A0E17] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 rounded-tl-none"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-[10px] font-medium">Nova is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Area - Matching FAQ Input feel */}
        <div className="p-3 bg-gray-50/50 dark:bg-[#0A0E17]/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-800/60 flex gap-2">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..." 
            className="flex-1 bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all" 
          />
          <button 
            onClick={handleSend} 
            className="p-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-500/20"
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Toggle Button - Matching FAQ CTA Button */}
  <button 
    onClick={() => setIsOpen(!isOpen)} 
    className="group relative w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-[#0A0E17]"
  >
    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 group-hover:hidden" />
    {isOpen ? <X size={24} /> : <Bot size={28} className="group-hover:rotate-12 transition-transform" />}
  </button>
</div>
  );
}