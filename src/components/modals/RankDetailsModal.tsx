"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ShieldCheck, Star, X, Zap, Target, ArrowUpRight, CheckCircle2 } from 'lucide-react';

// Rank configuration based on your system logic
const RANK_LEVELS = {
  PLATINUM: 5000,
  GOLD: 2000,
  SILVER: 500,
  BRONZE: 0,
};

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  currentRank: string;
}

const RankDetailsModal = ({ isOpen, onClose, points, currentRank }: RankModalProps) => {
  // Logic to calculate progress and next rank
  const getNextRankInfo = (pts: number) => {
    if (pts >= RANK_LEVELS.PLATINUM) return { next: "Max Level", needed: 0, progress: 100 };
    if (pts >= RANK_LEVELS.GOLD) return { next: "Platinum", needed: RANK_LEVELS.PLATINUM - pts, progress: (pts / RANK_LEVELS.PLATINUM) * 100 };
    if (pts >= RANK_LEVELS.SILVER) return { next: "Gold", needed: RANK_LEVELS.GOLD - pts, progress: (pts / RANK_LEVELS.GOLD) * 100 };
    return { next: "Silver", needed: RANK_LEVELS.SILVER - pts, progress: (pts / RANK_LEVELS.SILVER) * 100 };
  };

  const rankInfo = getNextRankInfo(points);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 ">
          {/* 1. Backdrop with heavy blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          {/* 2. Main Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-white dark:bg-[#0A121E] w-full max-w-[420px] rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] border border-white/20 dark:border-white/5 overflow-hidden z-10 max-h-[90vh]  overflow-y-auto "
          >
            {/* Header Section */}
            <div className="relative h-44 bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] p-8 overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />

              {/* Premium Close Button */}
             
              <div className="flex items-center gap-5 text-white relative z-10">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-4 bg-white/15 rounded-[2rem] backdrop-blur-lg border border-white/20 shadow-2xl"
                >
                  <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">NovaPay<br/>Elite Rewards</h2>
                  <div className="flex items-center gap-1.5 mt-2 bg-black/20 px-3 py-1 rounded-full w-fit border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">KYC Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-8 bg-slate-50/30 dark:bg-transparent">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/50 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Points</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{points}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Level</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase truncate">{currentRank || 'BRONZE'}</p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Milestone</p>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-md uppercase">{rankInfo.next}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{rankInfo.needed}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Points LEFT</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rankInfo.progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full relative"
                  >
                    <div className="absolute top-0 right-0 w-3 h-full bg-white/20 rounded-full" />
                  </motion.div>
                </div>
              </div>

              {/* Rank Ladder Milestones */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Rank Ladder</p>
                <div className="grid gap-2.5">
                  {Object.entries(RANK_LEVELS).map(([name, value]) => {
                    const isUnlocked = points >= value;
                    const isCurrent = (currentRank || 'BRONZE').toUpperCase() === name;
                    
                    return (
                      <div 
                        key={name} 
                        className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-500 ${
                          isCurrent 
                            ? 'bg-blue-600 text-white border-transparent shadow-xl shadow-blue-500/30 scale-[1.02] z-10' 
                            : 'bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isUnlocked ? (isCurrent ? 'bg-white/20' : 'bg-green-500/10 text-green-500') : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {name === 'PLATINUM' && <Trophy size={16} />}
                            {name === 'GOLD' && <Crown size={16} />}
                            {name === 'SILVER' && <ShieldCheck size={16} />}
                            {name === 'BRONZE' && <Star size={16} />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">{name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-bold font-mono ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>{value} Points</span>
                          {isUnlocked ? (
                            <CheckCircle2 size={16} className={isCurrent ? "text-white" : "text-green-500"} />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mr-1.5" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action */}
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-lg"
              >
                Close Insights <ArrowUpRight size={14} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RankDetailsModal;