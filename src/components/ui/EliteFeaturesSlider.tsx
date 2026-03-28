"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaGlobeAmericas, FaCalculator, FaPiggyBank, FaHeart, 
  FaLock, FaChevronLeft, FaChevronRight, FaRocket, FaInfoCircle, FaBolt
} from "react-icons/fa"
import { IoCloseCircleOutline } from "react-icons/io5"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import T from "@/components/T"

type EliteMenuItem = {
  name: string
  icon: any
  route: string
  minRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  pointsNeeded: number
  description: string
}

const eliteActions: EliteMenuItem[] = [
  { 
    name: "International Pay", 
    icon: FaGlobeAmericas, 
    route: "/international",
    minRank: 'Silver', 
    pointsNeeded: 500,
    description: "Send and receive money globally with real-time conversion."
  },
  { 
    name: "Split Bill", 
    icon: FaCalculator, 
    route: "/split-bill", 
    minRank: 'Gold', 
    pointsNeeded: 2000,
    description: "Easily split dinner or rent bills with your friends in one tap."
  },
  { 
    name: "Micro-Savings", 
    icon: FaPiggyBank, 
    route: "/micro-savings", 
    minRank: 'Gold', 
    pointsNeeded: 2000, 
    description: "Round up your transactions and save the spare change automatically."
  },
  { 
    name: "Donation", 
    icon: FaHeart, 
    route: "/donation", 
    minRank: 'Platinum', 
    pointsNeeded: 5000,
    description: "Contribute to verified charities directly from your Nova wallet."
  },
]

export default function EliteFeaturesSlider() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dbUser, setDbUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedLock, setSelectedLock] = useState<EliteMenuItem | null>(null)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession();

  // Variables safely extracted from dbUser.user object
  const userRank = dbUser?.rank || "Bronze";
  const userPoints = dbUser?.points || 0;
  // Tracking unlocked items (assumes your DB has an array of unlocked features)
  const unlockedFeatures = dbUser?.unlockedFeatures || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -350 : 350, behavior: "smooth" })
    }
  }

  const handleActionClick = (item: EliteMenuItem) => {
    if (!session) {
      router.push("/login")
      return;
    }

    // Subscribed users have all features unlocked
    const isAlreadyUnlocked = isSubscribed || unlockedFeatures.includes(item.name);

    if (isAlreadyUnlocked) {
      router.push(item.route)
    } else {
      setSelectedLock(item)
    }
  }

  // Handle the actual spending of coins
  const handlePurchase = async (item: EliteMenuItem) => {
    if (userPoints < item.pointsNeeded) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          featureName: item.name,
          cost: item.pointsNeeded
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setDbUser(updatedUser); // Update local state (points decrease, feature adds to list)
        setSelectedLock(null);
      }
    } catch (error) {
      console.error("Unlock error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      if (!session?.user?.email) return;
      try {
        const [userRes, subRes] = await Promise.all([
          fetch(`/api/user/update?email=${session.user.email}`),
          fetch(`/api/subscription/status?email=${session.user.email}`),
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          setDbUser(userData);
        }
        if (subRes.ok) {
          const subData = await subRes.json();
          setIsSubscribed(subData.subscribed === true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAllData();
  }, [session?.user?.email]);

  return (
    <div className="w-full bg-gray-50 dark:bg-[#0A0E17] border-y border-gray-200 dark:border-gray-800/60 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4">
        
        <div className="w-full text-center pt-14 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4DA1FF]/10 border border-[#4DA1FF]/20 text-[#1E50FF] dark:text-[#4DA1FF] text-xs font-semibold mb-3">
            <FaBolt size={10} /> Your Coins: {userPoints}
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
            <T>Elite</T> <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent"><T>Privileges</T></span>
          </h2>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => scroll("left")} className="p-3 rounded-full bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#1E50FF] transition shadow-sm">
              <FaChevronLeft size={14} />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic"><T>Explore premium features</T></p>
            <button onClick={() => scroll("right")} className="p-3 rounded-full bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#1E50FF] transition shadow-sm">
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar pb-10 px-2" style={{ scrollbarWidth: 'none' }}>
          {eliteActions.map((item, index) => {
            const Icon = item.icon
            const isUnlocked = isSubscribed || unlockedFeatures.includes(item.name);

            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                onClick={() => handleActionClick(item)}
                className="min-w-[300px] md:min-w-[350px] group relative p-8 rounded-[2rem] bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer transition-all duration-300"
              >
                <div className="absolute top-6 right-8">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${
                    isUnlocked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isUnlocked ? <T>Unlocked</T> : isSubscribed ? <T>Elite</T> : `${item.pointsNeeded} Coins`}
                  </span>
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  !isUnlocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-blue-50 dark:bg-blue-500/10 text-[#1E50FF]'
                }`}>
                  {!isUnlocked ? <FaLock size={20} /> : <Icon size={24} />}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${!isUnlocked ? 'text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                  <T>{item.name}</T>
                </h3>
                <p className={`text-sm mb-6 ${!isUnlocked ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  <T>{item.description}</T>
                </p>

                <div className={`flex items-center text-xs font-bold gap-2 transition-all uppercase tracking-wider ${!isUnlocked ? 'text-gray-300' : 'text-[#1E50FF]'}`}>
                  {!isUnlocked ? <T>Locked</T> : <T>Open</T>} <FaRocket />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md p-8 rounded-[2.5rem] bg-white dark:bg-[#121928] border dark:border-gray-800 shadow-2xl">
              <button onClick={() => setSelectedLock(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition">
                <IoCloseCircleOutline size={28} />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
                  <FaInfoCircle size={32} />
                </div>
                
                <div className="flex flex-col items-center">
  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
    <T>Unlock Feature?</T>
  </h3>
  
  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
    Unlock <span className="font-bold text-gray-800 dark:text-white">{selectedLock.name}</span> for 
    <span className="text-blue-600 font-bold ml-1">{selectedLock.pointsNeeded} coins</span>.
  </p>

  {/* Visual Separator */}
  <div className="flex items-center w-full mb-6">
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
    <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
  </div>

 <Link href={"/dashboard/subscription"}>
  <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transform transition-all active:scale-95 duration-200 cursor-pointer">
    <T>Get NovaPay Subscription</T>
  </button></Link>
  
  <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
    <T>Unlimited access to all elite features</T>
  </p>
</div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 mb-8 border dark:border-gray-800">
                  <div className="flex justify-between text-xs mb-2 font-bold text-gray-400 uppercase">
                    <span>Your Balance</span>
                    <span className={userPoints >= selectedLock.pointsNeeded ? "text-green-600" : "text-red-600"}>
                        {userPoints} / {selectedLock.pointsNeeded}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((userPoints / selectedLock.pointsNeeded) * 100, 100)}%` }} className={`h-full ${userPoints >= selectedLock.pointsNeeded ? 'bg-blue-600' : 'bg-red-500'}`} />
                  </div>
                </div>

                <button 
                  disabled={userPoints < selectedLock.pointsNeeded || loading}
                  onClick={() => handlePurchase(selectedLock)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase transition-all shadow-lg ${
                    userPoints >= selectedLock.pointsNeeded 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading ? <T>Processing...</T> : userPoints >= selectedLock.pointsNeeded ? <T>Unlock Now</T> : <T>Insufficient Coins</T>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}