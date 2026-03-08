"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownLeft, Plus, X, 
  History, Target, Sparkles, 
  LayoutDashboard, Wallet, ChevronLeft, ChevronRight,
  TrendingUp, ArrowRight, BarChart3, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
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

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/user/update?email=${session.user.email}`);
      const data = await res.json();
      setDbUser(data);
    } catch (error) { console.error(error); }
  }, [session?.user?.email]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  const history = useMemo(() => dbUser?.wallethistory || [], [dbUser]);
  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return history.slice(startIndex, startIndex + itemsPerPage);
  }, [history, currentPage]);

  const todayExpense = useMemo(() => {
    const today = new Date().toDateString();
    return history
      ?.filter((tx: any) => tx.type === 'expense' && new Date(tx.date).toDateString() === today)
      .reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  }, [history]);

  const wealthStats = useMemo(() => {
    const totalIn = dbUser?.wallet?.totalPhysicalIncome || 0;
    const totalOut = dbUser?.wallet?.totalPhysicalExpense || 0;
    const retention = totalIn === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((totalIn - totalOut) / totalIn) * 100)));
    return { 
        retention,
        totalIn,
        totalOut,
        status: retention > 70 ? "Healthy" : retention > 40 ? "Stable" : "Critical" 
    };
  }, [dbUser]);

  const chartData = useMemo(() => [
    { name: 'Total Inflow', value: wealthStats.totalIn, color: '#4DA1FF' },
    { name: 'Total Outflow', value: wealthStats.totalOut, color: '#f43f5e' }
  ], [wealthStats]);

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
      setRecordType(null); setAmount(""); setNote(""); fetchUserData();
      Swal.fire({ title: "Synced", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const currency = dbUser?.currency === "BDT" ? "৳" : "$";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-10 font-sans transition-colors duration-500">
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#4DA1FF]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#1E50FF]/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4DA1FF] to-[#1E50FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Wallet<span className="text-[#4DA1FF]">.Pro</span></h1>
          </div>
          
          <div className="flex gap-2 bg-white/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <button onClick={() => setRecordType('income')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all shadow-sm border border-slate-100 dark:border-white/5">
              <Plus size={14} className="text-[#4DA1FF]" /> Income
            </button>
            <button onClick={() => setRecordType('expense')} className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl hover:bg-white/40 transition-all">
              <ArrowUpRight size={14} className="text-rose-500" /> Expense
            </button>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Balance Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Available Balance</span>
                        <h2 className="text-5xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white">
                            {currency}{dbUser?.bankBalance?.toLocaleString() || "0"}
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-5 py-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-[9px] font-bold text-blue-500 uppercase">Cash Health</p>
                            <p className="text-sm font-black">{wealthStats.retention}%</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bento Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* 1. Inflow Component (New) */}
               <div className="p-6 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA1FF]/5 blur-3xl rounded-full -mr-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#4DA1FF]/10 flex items-center justify-center">
                        <ArrowDownLeft size={20} className="text-[#4DA1FF]" />
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase">Revenue Stream</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Cash Inflow</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums mb-4">
                      {currency}{wealthStats.totalIn.toLocaleString()}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                        <span>Retention</span>
                        <span>{wealthStats.retention}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${wealthStats.retention}%` }} className="h-full bg-[#4DA1FF] rounded-full" />
                      </div>
                    </div>
                  </div>
               </div>

               {/* 2. Simplified Analysis Card */}
               <div className="p-6 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Activity size={14} className="text-[#4DA1FF]" /> Performance
                        </h3>
                    </div>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '10px'}} />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-2">
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Inflow</p>
                            <p className="text-xs font-black text-[#4DA1FF]">{currency}{wealthStats.totalIn > 1000 ? (wealthStats.totalIn/1000).toFixed(1)+'k' : wealthStats.totalIn}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Outflow</p>
                            <p className="text-xs font-black text-rose-500">{currency}{wealthStats.totalOut > 1000 ? (wealthStats.totalOut/1000).toFixed(1)+'k' : wealthStats.totalOut}</p>
                        </div>
                    </div>
               </div>

               {/* 3. Daily Expense Card */}
               <div className="md:col-span-2 p-6 rounded-[2.5rem] bg-slate-900 dark:bg-white/5 border border-white/10 text-white flex items-center justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Spent Today</p>
                        <h3 className="text-4xl font-black">{currency}{todayExpense.toLocaleString()}</h3>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                        <Target size={30} className="text-rose-400" />
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
               </div>

            </div>
          </div>

          {/* Right Column: History List */}
          <div className="lg:col-span-1">
            <div className="h-full flex flex-col p-6 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <History size={14} /> Activity
                    </h3>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronLeft size={16}/></button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronRight size={16}/></button>
                    </div>
                </div>

                <div className="space-y-3 flex-grow">
                    {paginatedHistory.length > 0 ? (
                        paginatedHistory.map((tx: any) => (
                            <div key={tx.id} className="group p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-[#4DA1FF]/30 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {tx.type === 'income' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold truncate max-w-[80px]">{tx.note}</p>
                                        <p className="text-[8px] font-medium text-slate-400 uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-30">
                            <Wallet size={32} className="mb-2" />
                            <p className="text-[10px] font-bold uppercase">Empty History</p>
                        </div>
                    )}
                </div>
                
                <button onClick={() => setRecordType('income')} className="mt-6 w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-[10px] font-black uppercase hover:border-[#4DA1FF] hover:text-[#4DA1FF] transition-all">
                    + Quick Record
                </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {recordType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 dark:bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter">Add {recordType}</h2>
                <button onClick={() => setRecordType(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">{currency}</span>
                  <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-5 pl-12 outline-none border border-slate-100 dark:border-white/5 focus:border-[#4DA1FF] text-2xl font-black" />
                </div>
                <input value={note} onChange={(e) => setNote(e.target.value)} type="text" placeholder="Description..." className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-5 outline-none border border-slate-100 dark:border-white/5 focus:border-[#4DA1FF] font-bold text-sm" />
                <button onClick={handleRecord} disabled={isSubmitting} className={`w-full py-5 rounded-2xl text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${recordType === 'income' ? 'bg-[#1E50FF]' : 'bg-rose-600'}`}>
                  {isSubmitting ? "Processing..." : `Confirm ${recordType}`} <ArrowRight size={16}/>
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