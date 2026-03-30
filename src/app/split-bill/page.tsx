"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { UserPlus, Search, X, Sun, Moon, Loader2, Send } from 'lucide-react';
import { useSession } from "next-auth/react";
import Swal from 'sweetalert2';
import T from "@/components/T";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

const SplitBill = () => {
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Search Logic: Finds verified users via your split-cal API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/split-cal/search?q=${searchQuery}`);
        const data = await response.json();
        // Filter out the logged-in user from search results
        const others = (data.users || []).filter((u: User) => u.email !== session?.user?.email);
        setSearchResults(others);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, session?.user?.email]);

  const toggleFriend = (friend: User) => {
    setSelectedFriends(prev => 
      prev.some(f => f._id === friend._id) 
        ? prev.filter(f => f._id !== friend._id) 
        : [...prev, friend]
    );
    setSearchQuery('');
  };

  const sharePerPerson = amount 
    ? (Number(amount) / (selectedFriends.length + 1)).toFixed(2) 
    : "0.00";

  // 2. The Core Request Logic: Loops through friends to send individual notifications
  const handleSplitRequest = async () => {
    if (!amount || selectedFriends.length === 0) {
      return Swal.fire("Oops", "Please enter an amount and select friends.", "warning");
    }

    setIsSubmitting(true);
    try {
      // Create an array of individual notification requests
      const requestPromises = selectedFriends.map(friend => 
        fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: session?.user?.email,
            receiverEmail: friend.email,
            amount: Number(sharePerPerson),
            note: `Split bill: ${currency} ${amount} (Your share)`,
          }),
        })
      );

      const responses = await Promise.all(requestPromises);
      const allSuccessful = responses.every(res => res.ok);

      if (allSuccessful) {
        // --- LOYALTY POINTS INTEGRATION ---
        try {
          await fetch("/api/points", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session?.user?.email,
              activityType: "REQUEST_MONEY",
            }),
          });
        } catch (pointErr) {
          console.error("Points failed but request was sent:", pointErr);
        }

        Swal.fire({
          title: "Requests Sent!",
          text: `Individual shares of ${currency} ${sharePerPerson} requested from ${selectedFriends.length} friends.`,
          icon: "success",
          confirmButtonColor: "#3B82F6",
          background: isDarkMode ? "#1C1C1E" : "#FFFFFF",
          color: isDarkMode ? "#F5F5F7" : "#1D1D1F"
        });

        setSelectedFriends([]);
        setAmount('');
      } else {
        Swal.fire("Error", "One or more requests could not be sent. Ensure friends are KYC verified.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong on our end.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black py-12 px-4 transition-colors duration-500 font-sans text-[#1D1D1F] dark:text-[#F5F5F7]">
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm border border-gray-100 dark:border-white/10 z-50">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-white/5">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight"><T>Split Bill</T></h1>
            <p className="text-gray-400 dark:text-gray-500 mt-1 text-sm font-medium"><T>Verified NovaPay Peer-to-Peer</T></p>
          </header>

          <div className="space-y-8">
            {/* Amount & Currency Section */}
            <div className="relative border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400"><T>Total Bill</T></label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-[11px] font-bold outline-none border border-gray-200 dark:border-white/10 rounded-md px-2 py-0.5"
                >
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-4xl font-semibold mr-2 opacity-30">{currency === 'USD' ? '$' : '৳'}</span>
                <input 
                  type="number" 
                  value={amount}
                  placeholder="0.00" 
                  className="text-5xl font-semibold w-full outline-none bg-transparent placeholder:text-gray-200 dark:placeholder:text-white/5" 
                  onChange={(e) => setAmount(e.target.value)} 
                />
              </div>
            </div>

            {/* User Search Input */}
            <div className="relative">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-3">
                <Search size={12} /> <T>Find Verified Friends</T>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name or email..."
                  className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl outline-none text-sm transition-all focus:ring-2 focus:ring-blue-500/20"
                />
                {isLoading && <Loader2 className="absolute right-4 top-4 animate-spin text-blue-500" size={18} />}
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {searchQuery.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-20 w-full mt-2 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    {searchResults.length > 0 ? searchResults.map(user => (
                      <button key={user._id} onClick={() => toggleFriend(user)} className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between border-b border-gray-50 dark:border-white/5 last:border-none">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold uppercase">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-[10px] text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <UserPlus size={16} className="text-blue-500" />
                      </button>
                    )) : (
                      <div className="p-4 text-sm text-gray-400 text-center"><T>No verified users found</T></div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection Chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                <AnimatePresence>
                  {selectedFriends.map(f => (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                      key={f._id} 
                      className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-[11px] font-bold"
                    >
                      {f.name} <X size={14} className="cursor-pointer opacity-60" onClick={() => toggleFriend(f)} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Real-time Calculation Card */}
            <AnimatePresence>
              {Number(amount) > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-500/20">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1"><T>Per Person</T></p>
                      <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-50">
                        {currency === 'USD' ? '$' : '৳'}{sharePerPerson}
                      </h3>
                    </div>
                    <p className="text-[10px] text-blue-400 italic mb-1">
                      Split {selectedFriends.length + 1} ways
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleSplitRequest}
              disabled={!amount || selectedFriends.length === 0 || isSubmitting}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[20px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-20 shadow-xl shadow-black/10"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><T>Send Request</T> <Send size={18} /></>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplitBill;