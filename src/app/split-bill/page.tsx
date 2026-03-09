"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { UserPlus, Users, Search, X, Sun, Moon, Check } from 'lucide-react';

const SplitBill = () => {
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock data - in NovaPay, fetch this from your MongoDB/Lenden backend
  const allFriends = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jarif', 'Fahad'];

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery) return [];
    return allFriends.filter(f => 
      f.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedFriends.includes(f)
    );
  }, [searchQuery, selectedFriends]);

  const toggleFriend = (friend: string) => {
    setSelectedFriends(prev => 
      prev.includes(friend) ? prev.filter(f => f !== friend) : [...prev, friend]
    );
    setSearchQuery(''); // Clear search after adding
  };

  const sharePerPerson = amount 
    ? (Number(amount) / (selectedFriends.length + 1)).toFixed(2) 
    : "0.00";

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] py-12 px-4 font-sans text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-500">
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm border border-gray-100 dark:border-white/10"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-white/5"
        >
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Split Bill</h1>
            <p className="text-gray-400 dark:text-gray-500 mt-1 text-sm">NovaPay Peer-to-Peer calculation</p>
          </header>

          <div className="space-y-8">
            {/* Amount Input */}
            <div className="relative border-b border-gray-100 dark:border-white/10 pb-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Total Amount</label>
              <div className="flex items-center">
                <span className="text-4xl font-semibold mr-2 opacity-50">$</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="text-5xl font-semibold w-full outline-none placeholder:text-gray-200 dark:placeholder:text-white/5 bg-transparent"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Search & Selection */}
            <div className="relative">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-3">
                <Search size={12} /> Find Friends
              </label>
              
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full bg-gray-50 dark:bg-white/5 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full mt-2 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
                    >
                      {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                          <button
                            key={friend}
                            onClick={() => toggleFriend(friend)}
                            className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between"
                          >
                            <span className="font-medium">{friend}</span>
                            <UserPlus size={16} className="text-blue-500" />
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-gray-400">No friends found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Friends Chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedFriends.map(friend => (
                  <motion.span
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={friend}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-medium"
                  >
                    {friend}
                    <X size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => toggleFriend(friend)} />
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Result Card */}
            <AnimatePresence>
              {Number(amount) > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-500/20"
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Per Person</p>
                      <h3 className="text-4xl font-bold text-blue-900 dark:text-blue-100">${sharePerPerson}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-blue-400 italic">Total: {selectedFriends.length + 1} ways</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={!amount || selectedFriends.length === 0}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-20 shadow-lg shadow-black/5"
            >
              Confirm & Split
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplitBill;