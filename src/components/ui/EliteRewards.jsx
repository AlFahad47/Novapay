"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Calculator, 
  PiggyBank, 
  HeartHandshake, 
  Lock, 
  CheckCircle2,
  Zap
} from 'lucide-react';

const tiers = [
  {
    name: 'Bronze',
    points: '0+',
    color: 'from-orange-400 to-orange-700',
    icon: <Zap className="w-6 h-6" />,
    unlockedFeatures: ['Standard Wallet', 'Local P2P Transfer'],
    lockedFeatures: ['International Pay', 'Split Bill', 'Micro-Savings'],
    isCurrent: true,
  },
  {
    name: 'Silver',
    points: '500+',
    color: 'from-slate-300 to-slate-500',
    icon: <Globe className="w-6 h-6 text-white" />,
    unlockedFeatures: ['International Transactions', '0.5% Cashback'],
    lockedFeatures: ['Split Bill', 'Micro-Savings', 'Donation'],
  },
  {
    name: 'Gold',
    points: '2000+',
    color: 'from-yellow-400 to-yellow-600',
    icon: <Calculator className="w-6 h-6 text-white" />,
    unlockedFeatures: ['Split Bill Calculator', 'Micro-Saving Pockets', '1% Cashback'],
    lockedFeatures: ['Charity Donation', 'Priority Agent'],
  },
  {
    name: 'Platinum',
    points: '5000+',
    color: 'from-indigo-400 to-purple-600',
    icon: <HeartHandshake className="w-6 h-6 text-white" />,
    unlockedFeatures: ['Direct Donation System', 'Unlimited Savings', 'No Transaction Fees'],
    lockedFeatures: [],
  },
];

export default function EliteRewards() {
  return (
    <section className="py-20 px-6 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 font-extrabold">Privileges</span>
          </motion.h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your points determine your power. Reach new tiers to unlock advanced financial tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col p-6 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-500 overflow-hidden"
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg shadow-black/40`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{tier.points} Points</p>
                </div>
              </div>

              {/* Feature List */}
              <div className="flex-grow">
                <p className="text-xs font-semibold text-gray-500 mb-4 uppercase">Unlocked Benefits</p>
                <ul className="space-y-3 mb-6">
                  {tier.unlockedFeatures.map((f) => (
                    <li key={f} className="flex items-center text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {tier.lockedFeatures.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-600 mb-4 uppercase border-t border-white/5 pt-4">Locked Features</p>
                    <ul className="space-y-3 opacity-40">
                      {tier.lockedFeatures.map((f) => (
                        <li key={f} className="flex items-center text-sm grayscale italic">
                          <Lock className="w-3.5 h-3.5 mr-2 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Status Button */}
              <button className={`mt-8 w-full py-3 rounded-2xl text-sm font-bold tracking-wide transition-all ${
                tier.isCurrent 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}>
                {tier.isCurrent ? 'Current Status' : 'Unlock Now'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}