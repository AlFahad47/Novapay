"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CalendarDays, Wallet, X, Sparkles, TrendingUp, AlertCircle, Info, Plus, BellRing, ChevronRight, ArrowUpRight, HandCoins, MessageSquare } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function SmartSavingGoal() {
  const { data: session } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]); 
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // New states for withdrawal functionality
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Dynamic currency symbol mapping
  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'BDT': return '৳';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(dbUser?.currency);

  // Form States
  const [goalName, setGoalName] = useState("");
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [months, setMonths] = useState<number>(1);
  const [savingDay, setSavingDay] = useState<number>(10);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // Calculated States
  const [suggestedPercent, setSuggestedPercent] = useState<number>(0);
  const [monthlySavingNeeded, setMonthlySavingNeeded] = useState<number>(0);

  // Fetch user data and goals from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const userRes = await fetch(`/api/user/update?email=${session.user.email}`);
          if (!userRes.ok) throw new Error('Failed to fetch user data');
          
          const userData = await userRes.json();
          setDbUser(userData);
          
          if (userData?.microsaving && Array.isArray(userData.microsaving)) {
            setGoals(userData.microsaving);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchUserData();
  }, [session?.user?.email]);

  // Calculate monthly requirements based on AI logic
  useEffect(() => {
    if (targetAmount > 0 && months > 0 && income > 0) {
      const neededPerMonth = targetAmount / months;
      const percentOfIncome = (neededPerMonth / income) * 100;
      setMonthlySavingNeeded(Math.round(neededPerMonth));
      setSuggestedPercent(parseFloat(percentOfIncome.toFixed(1)));
    }
  }, [income, targetAmount, months]);

  const disposableIncome = income - expense;
  const isFeasible = disposableIncome >= monthlySavingNeeded;

  // Save the new saving goal to the database
  const handleConfirmGoal = async () => {
    if (!session?.user) return alert("Session not found. Please login.");
    if (!goalName || targetAmount <= 0) return alert("Please fill all details correctly.");

    setLoading(true);
    const newGoalObj = {
      id: Date.now().toString(),
      goalName: goalName.trim(),
      targetAmount,
      monthlySavingNeeded,
      savingDay,
      currentSaved: 0, 
      progress: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, newGoal: newGoalObj }),
      });

      if (res.ok) {
        setGoals(prev => [...prev, newGoalObj]);
        setIsOpen(false);
        setGoalName("");
        setTargetAmount(0);
      } else {
        alert("Failed to save goal.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // Submit withdrawal request
  const handleWithdrawSubmit = async () => {
    if (!withdrawReason) return alert("Please provide a reason for withdrawal.");
    setWithdrawLoading(true);
    
    // Simulating API call
    setTimeout(() => {
        alert(`Withdrawal request for ${selectedGoal.goalName} submitted successfully.`);
        setWithdrawLoading(false);
        setIsWithdrawOpen(false);
        setWithdrawReason("");
        setSelectedGoal(null); // Close detail modal too
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050a14] text-[#1E293B] dark:text-white p-6 md:p-12 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-white dark:to-blue-500 bg-clip-text text-transparent">
            NovaPay Savings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your micro-savings and goals.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> New Goal
        </button>
      </div>

      {/* Grid displaying active goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center p-20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[3rem]">
            <p className="text-gray-400">No active goals found. Start by creating one!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <motion.div 
              key={goal.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedGoal(goal)}
              className="bg-white dark:bg-[#0c1425] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={80} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                  <Target size={24} />
                </div>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 px-3 py-1 rounded-full uppercase">
                  Day {goal.savingDay || 1}th
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{goal.goalName}</h3>
              <p className="text-gray-500 text-sm mb-4">Target: {currencySymbol}{goal.targetAmount}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Progress</span>
                  <span>{goal.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress || 0}%` }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                View Details <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal for Creating a New Goal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 dark:bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0c1425] border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-blue-600 transition-colors"><X /></button>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600"><Sparkles /></div>
                  <h2 className="text-2xl font-bold">Setup Goal</h2>
                </div>

                <div className="space-y-4">
                  <InputField label="Goal Name" icon={<Target size={16}/>} placeholder="e.g. Europe Trip" value={goalName} onChange={(e:any) => setGoalName(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Monthly Income" icon={<TrendingUp size={16}/>} type="number" onChange={(e:any) => setIncome(Number(e.target.value))} />
                    <InputField label="Est. Expenses" icon={<AlertCircle size={16}/>} type="number" onChange={(e:any) => setExpense(Number(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={`Target Amount (${currencySymbol})`} icon={<Wallet size={16}/>} type="number" onChange={(e:any) => setTargetAmount(Number(e.target.value))} />
                    <InputField label="Time (Months)" icon={<CalendarDays size={16}/>} type="number" onChange={(e:any) => setMonths(Number(e.target.value))} />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    <div className="flex justify-between mb-3 items-center">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><CalendarDays size={14}/> Deposit Day</label>
                        <input type="checkbox" checked={isNotificationEnabled} onChange={(e) => setIsNotificationEnabled(e.target.checked)} className="accent-blue-600"/>
                    </div>
                    <input type="range" min="1" max="28" value={savingDay} onChange={(e) => setSavingDay(parseInt(e.target.value))} className="w-full accent-blue-600 cursor-pointer"/>
                    <div className="flex justify-between mt-2 text-[11px] font-bold text-blue-600"><span>Day: 01</span><span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">Selected: {savingDay}th</span><span>Day: 28</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2"><Info size={20} className="text-blue-500" /> AI Plan</h3>
                  <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10">
                    <p className="text-gray-500 text-sm">Monthly Deposit</p>
                    <p className="text-3xl font-bold text-blue-600">{currencySymbol}{monthlySavingNeeded}</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-xs flex gap-2 items-start ${isFeasible ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    <BellRing size={16} className="shrink-0"/>
                    <p>{isFeasible ? `Safe! You'll receive a reminder every ${savingDay}th of the month.` : `Warning: This goal exceeds your disposable income.`}</p>
                  </div>
                </div>
                <motion.button onClick={handleConfirmGoal} disabled={loading || !isFeasible || targetAmount <= 0} className={`w-full py-5 rounded-2xl font-bold text-lg mt-8 shadow-xl ${loading || !isFeasible ? "bg-gray-400" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                  {loading ? "Saving..." : `Set Goal for ${savingDay}th`}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details View Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGoal(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div 
              layoutId={selectedGoal.id}
              className="relative w-full max-w-lg bg-white dark:bg-[#0c1425] rounded-[3rem] p-8 md:p-10 shadow-2xl"
            >
              <button onClick={() => setSelectedGoal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500"><X /></button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Target size={32} />
                </div>
                <h2 className="text-2xl font-bold">{selectedGoal.goalName}</h2>
                <p className="text-gray-500">Savings Account Details</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <span className="text-gray-500">Total Saved</span>
                    <span className="font-bold text-green-500">{currencySymbol}{selectedGoal.currentSaved || 0} / {currencySymbol}{selectedGoal.targetAmount}</span>
                </div>
                <div className="flex justify-between px-4">
                    <span className="text-gray-500">Auto-Remind</span>
                    <span className="font-bold">Every {selectedGoal.savingDay}th</span>
                </div>
                <div className="flex justify-between px-4">
                    <span className="text-gray-500">Monthly Contribution</span>
                    <span className="font-bold text-blue-600">{currencySymbol}{selectedGoal.monthlySavingNeeded}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="w-full py-4 rounded-2xl font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowUpRight size={18}/> Request Early Withdrawal
                </button>
                <button 
                  disabled={(selectedGoal.progress || 0) < 100}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${(selectedGoal.progress || 0) >= 100 ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}
                >
                  <HandCoins size={18}/> Cashout Rewards
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal Reason Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWithdrawOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0c1425] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="text-amber-500" /> Withdrawal Request
                </h3>
                <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please state the reason for early withdrawal from <strong>{selectedGoal?.goalName}</strong>. This request will be reviewed by our finance team.
                </p>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} /> Reason for Note
                    </label>
                    <textarea 
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        placeholder="Why are you withdrawing early?"
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
                    />
                </div>

                <button 
                  onClick={handleWithdrawSubmit}
                  disabled={withdrawLoading || !withdrawReason}
                  className="w-full py-4 rounded-2xl font-bold bg-amber-600 text-white hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 disabled:bg-gray-500"
                >
                  {withdrawLoading ? "Submitting..." : "Submit Withdrawal Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Input Field Component
function InputField({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 px-1">
        {icon} {label}
      </label>
      <input {...props} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all" />
    </div>
  );
}