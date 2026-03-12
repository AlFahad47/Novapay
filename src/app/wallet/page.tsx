"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownLeft, Plus, X, 
  History, Wallet, ChevronLeft, ChevronRight,
  Zap, CreditCard, List, PieChart as PieIcon,
  TrendingUp, ShieldCheck, Lightbulb, Activity, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Swal from "sweetalert2";

const WalletAccountPage = () => {
  const { data: session } = useSession();
  const [recordType, setRecordType] = useState<'income' | 'expense' | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // AI States
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/user/update?email=${session.user.email}`);
      const data = await res.json();
      setDbUser(data);
    } catch (error) { console.error(error); }
  }, [session?.user?.email]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // AI Integration Function
  const getAIInsight = useCallback(async (stats: any) => {
    if (!dbUser || isLoadingAI) return;
    setIsLoadingAI(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: dbUser?.bankBalance,
          history: dbUser?.wallethistory?.slice(0, 5),
          retention: stats.retention,
          currency: dbUser?.currency === "BDT" ? "৳" : "$"
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsLoadingAI(false);
    }
  }, [dbUser, isLoadingAI]);

  const history = useMemo(() => dbUser?.wallethistory || [], [dbUser]);
  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return history.slice(startIndex, startIndex + itemsPerPage);
  }, [history, currentPage]);

  const wealthStats = useMemo(() => {
    const totalIn = dbUser?.wallet?.totalPhysicalIncome || 0;
    const totalOut = dbUser?.wallet?.totalPhysicalExpense || 0;
    const retention = totalIn === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((totalIn - totalOut) / totalIn) * 100)));
    
    const chartData = [
      { name: 'Remaining', value: Math.max(0, totalIn - totalOut), color: '#3B82F6' },
      { name: 'Expenses', value: totalOut, color: '#F43F5E' }
    ];

    let suggestion = { 
      title: "Pocket Status: Empty", 
      text: "No data found. Log your first income or expense.", 
      icon: <Activity size={16}/> 
    };

    if (retention > 70) suggestion = { title: "Pocket Status: Healthy", text: "Great job! Your liquidity is strong.", icon: <ShieldCheck size={16} className="text-emerald-500"/> };
    else if (retention > 40) suggestion = { title: "Pocket Status: Balanced", text: "Your spending is steady and controlled.", icon: <TrendingUp size={16} className="text-blue-500"/> };
    else if (retention > 10) suggestion = { title: "Pocket Status: Thinning", text: "Watch your minor expenses carefully.", icon: <Zap size={16} className="text-amber-500"/> };
    else if (totalIn > 0) suggestion = { title: "Pocket Status: Critical", text: "Outgoings are matching income. High alert!", icon: <X size={16} className="text-rose-500"/> };

    return { retention, totalIn, totalOut, chartData, suggestion };
  }, [dbUser]);

  // Trigger AI advice when data loads
  useEffect(() => {
    if (dbUser && !aiAdvice) {
      getAIInsight(wealthStats);
    }
  }, [dbUser, aiAdvice, wealthStats, getAIInsight]);

  const handleRecord = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) return;
    setIsSubmitting(true);
    try {
      const currentBankBalance = dbUser?.bankBalance || 0;
      const newBankBalance = recordType === 'income' ? currentBankBalance + numAmount : currentBankBalance - numAmount;
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          bankBalance: newBankBalance,
          wallet: {
            ...dbUser?.wallet,
            totalPhysicalIncome: recordType === 'income' ? (dbUser?.wallet?.totalPhysicalIncome || 0) + numAmount : (dbUser?.wallet?.totalPhysicalIncome || 0),
            totalPhysicalExpense: recordType === 'expense' ? (dbUser?.wallet?.totalPhysicalExpense || 0) + numAmount : (dbUser?.wallet?.totalPhysicalExpense || 0),
          },
          wallethistory: [{ id: Math.random().toString(36).substr(2, 9), type: recordType, amount: numAmount, note: note || `Cash ${recordType}`, date: new Date().toISOString() }, ...history]
        }),
      });
      setRecordType(null); setAmount(""); setNote(""); setAiAdvice(null); fetchUserData();
      Swal.fire({ title: "Updated", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const currency = dbUser?.currency === "BDT" ? "৳" : "$";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-xl">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
             <h1 className="text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Wallet<span className="text-blue-500">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Liquid Assets & Real-Time Flow</p>
            </div>
          </div>

          <div className="flex gap-3">
             <button onClick={() => setRecordType('income')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-xs font-black rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 hover:border-blue-500/50 transition-all">
               <Plus size={14} className="text-blue-500" /> Income
             </button>
             <button onClick={() => setRecordType('expense')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black rounded-2xl shadow-lg transition-all active:scale-95">
               <ArrowUpRight size={14} /> Expense
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Analytics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Pie Chart Card */}
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 items-center">
              <div className="h-[280px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wealthStats.chartData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {wealthStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Retention</span>
                   <span className="text-4xl font-black">{wealthStats.retention}%</span>
                </div>
              </div>

              <div className="space-y-6 pl-0 md:pl-8 mt-6 md:mt-0">
                <div>
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Pocket Cash</h2>
                  <p className="text-5xl font-black tracking-tighter tabular-nums">
                    {currency}{dbUser?.bankBalance?.toLocaleString() || "0"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Total In</p>
                    <p className="text-lg font-bold">{currency}{wealthStats.totalIn.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-rose-500 uppercase mb-1">Total Out</p>
                    <p className="text-lg font-bold">{currency}{wealthStats.totalOut.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Smart Suggestions */}
            <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 flex items-center gap-5 relative overflow-hidden">
               <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {isLoadingAI ? <Loader2 size={24} className="animate-spin" /> : <Lightbulb size={24} />}
               </div>
               <div className="z-10">
                 <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    {wealthStats.suggestion.title}
                    {aiAdvice && <span className="bg-white/20 px-2 py-0.5 rounded text-[8px]">AI INSIGHT</span>}
                 </h4>
                 <p className="text-sm opacity-90 font-medium">
                    {isLoadingAI ? "WalletPro AI is analyzing your pockets..." : (aiAdvice || wealthStats.suggestion.text)}
                 </p>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10">
                  <PieIcon size={120} />
               </div>
            </div>

          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-4">
             <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 h-full shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-indigo-500" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest">History</h3>
                    </div>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronLeft size={16}/></button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronRight size={16}/></button>
                    </div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                        {paginatedHistory.map((tx: any) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={tx.id} 
                                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-indigo-500/20 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {tx.type === 'income' ? <Plus size={14}/> : <ArrowUpRight size={14}/>}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold truncate max-w-[120px]">{tx.note}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">
                                            {new Date(tx.date).toLocaleDateString(undefined, { day:'numeric', month:'short' })}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {paginatedHistory.length === 0 && (
                        <div className="py-20 text-center opacity-20">
                            <List size={40} className="mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase">No records found</p>
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {recordType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRecordType(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-[#0F172A] rounded-[3rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black capitalize">Record {recordType}</h2>
                <button onClick={() => setRecordType(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-white/5 rounded-3xl p-8 outline-none border-2 border-transparent focus:border-indigo-500 text-4xl font-black transition-all text-center" />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">{currency}</span>
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} type="text" placeholder="What was this for?" className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-5 outline-none font-bold text-sm text-center border-2 border-transparent focus:border-indigo-500 transition-all" />
                <button onClick={handleRecord} disabled={isSubmitting} className={`w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${recordType === 'income' ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-slate-900 dark:bg-white dark:text-black'}`}>
                  {isSubmitting ? "Processing..." : `Confirm ${recordType}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletAccountPage;