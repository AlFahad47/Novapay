"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ShieldCheck, Star, ArrowRight, Zap, Target, CheckCircle2 } from 'lucide-react';

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
  const getNextRankInfo = (pts: number) => {
    const levels = Object.entries(RANK_LEVELS).reverse();
    for (let i = 0; i < levels.length; i++) {
      const [name, value] = levels[i];
      if (pts < value) {
        return { next: name, needed: value - pts, progress: (pts / value) * 100 };
      }
    }
    return { next: "Max Level", needed: 0, progress: 100 };
  };

  const rankInfo = getNextRankInfo(points);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-50 dark:bg-[#0F172A] w-full max-w-[380px] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden z-10"
          >
            {/* Minimalist Header */}
            <div className="pt-8 px-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Status</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">NovaPay Elite</p>
              </div>
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40"
              >
                <Trophy size={24} className="text-white" />
              </motion.div>
            </div>

            <div className="px-6 pb-8 space-y-5">
              {/* Stats Card */}
              <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap size={12} className="text-amber-500 fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Current Balance</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{points.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[9px] font-bold mb-2">
                    <CheckCircle2 size={10} /> KYC OK
                  </div>
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase">{currentRank || 'Bronze'}</p>
                </div>
              </div>

              {/* Progress Bar (Compact) */}
              <div className="px-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To {rankInfo.next}</span>
                  <span className="text-[10px] font-black text-blue-500">{rankInfo.needed} more pts</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rankInfo.progress}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              {/* Rank List (Slimmed Down) */}
              <div className="space-y-2">
                {Object.entries(RANK_LEVELS).reverse().map(([name, value]) => {
                  const isCurrent = (currentRank || 'BRONZE').toUpperCase() === name;
                  const isUnlocked = points >= value;
                  
                  return (
                    <div 
                      key={name}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isCurrent 
                        ? 'bg-blue-600 border-transparent shadow-lg shadow-blue-500/20' 
                        : 'bg-transparent border-slate-200 dark:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                          {name === 'PLATINUM' && <Crown size={14} />}
                          {name === 'GOLD' && <Trophy size={14} />}
                          {name === 'SILVER' && <ShieldCheck size={14} />}
                          {name === 'BRONZE' && <Star size={14} />}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                          {name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {value}+
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                Dismiss <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RankDetailsModal;