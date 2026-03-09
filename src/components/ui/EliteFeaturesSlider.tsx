"use client"

import React, { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaGlobeAmericas, FaCalculator, FaPiggyBank, FaHeart, 
  FaLock, FaChevronLeft, FaChevronRight, FaRocket, FaInfoCircle, FaBolt
} from "react-icons/fa"
import { IoCloseCircleOutline } from "react-icons/io5"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

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
    route: "/international-pay", 
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
  const [selectedLock, setSelectedLock] = useState<EliteMenuItem | null>(null)
  const { data: session } = useSession()

  const userRank = (session?.user as any)?.rank || "Bronze"
  const userPoints = (session?.user as any)?.points || 0

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -350 : 350, behavior: "smooth" })
    }
  }

  const handleActionClick = (item: EliteMenuItem) => {
    const rankOrder = ["Bronze", "Silver", "Gold", "Platinum"]
    const hasAccess = rankOrder.indexOf(userRank) >= rankOrder.indexOf(item.minRank)

    if (!session) {
      router.push("/login")
    } else if (!hasAccess) {
      setSelectedLock(item)
    } else {
      router.push(item.route)
    }
  }

  return (
    // Simple Background like Quick Actions section
    <div className="w-full  bg-gray-50 dark:bg-[#0A0E17] border-y border-gray-200 dark:border-gray-800/60 transition-colors duration-300">
      
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Centered Heading Section */}
        <div className="w-full text-center pt-14 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4DA1FF]/10 border border-[#4DA1FF]/20 text-[#1E50FF] dark:text-[#4DA1FF] text-xs font-semibold mb-3">
            <FaBolt size={10} /> Exclusive Access
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
            Elite <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent">Privileges</span>
          </h2>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => scroll("left")} 
              className="p-3 rounded-full bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#1E50FF] transition shadow-sm"
            >
              <FaChevronLeft size={14} />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              Explore premium features
            </p>
            <button 
              onClick={() => scroll("right")} 
              className="p-3 rounded-full bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#1E50FF] transition shadow-sm"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div 
          ref={scrollRef} 
          className="flex gap-8 overflow-x-auto no-scrollbar pb-10 px-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {eliteActions.map((item, index) => {
            const Icon = item.icon
            const isLocked = ["Bronze", "Silver", "Gold", "Platinum"].indexOf(userRank) < ["Bronze", "Silver", "Gold", "Platinum"].indexOf(item.minRank)

            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                onClick={() => handleActionClick(item)}
                className="min-w-[300px] md:min-w-[350px] group relative p-8 rounded-[2rem] bg-white dark:bg-[#121928] border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer transition-all duration-300"
              >
                {/* Visual Rank Tag */}
                <div className="absolute top-6 right-8">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${
                    item.minRank === 'Silver' ? 'bg-slate-100 text-slate-600' :
                    item.minRank === 'Gold' ? 'bg-yellow-400/20 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {item.minRank}
                  </span>
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  isLocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-blue-50 dark:bg-blue-500/10 text-[#1E50FF]'
                }`}>
                  {isLocked ? <FaLock size={20} /> : <Icon size={24} />}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                  {item.name}
                </h3>
                <p className={`text-sm mb-6 ${isLocked ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.description}
                </p>

                <div className={`flex items-center text-xs font-bold gap-2 transition-all uppercase tracking-wider ${isLocked ? 'text-gray-300' : 'text-[#1E50FF]'}`}>
                  {isLocked ? 'Locked' : 'Open'} <FaRocket />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modal - Sweet Alert Style */}
      <AnimatePresence>
        {selectedLock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-8 rounded-[2.5rem] bg-white dark:bg-[#121928] border dark:border-gray-800 shadow-2xl"
            >
              <button onClick={() => setSelectedLock(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition">
                <IoCloseCircleOutline size={28} />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
                  <FaInfoCircle size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Insufficient Rank!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                  The <span className="font-bold text-gray-800 dark:text-white">{selectedLock.name}</span> feature requires 
                  <span className="text-blue-600 font-bold ml-1">{selectedLock.minRank}</span> status.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 mb-8 border dark:border-gray-800">
                  <div className="flex justify-between text-xs mb-2 font-bold text-gray-400 uppercase">
                    <span>Your Progress</span>
                    <span className="text-blue-600">{userPoints} / {selectedLock.pointsNeeded}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${Math.min((userPoints / selectedLock.pointsNeeded) * 100, 100)}%` }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedLock(null)}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}