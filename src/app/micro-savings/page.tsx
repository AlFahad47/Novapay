"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CalendarDays, Wallet, X, Sparkles, TrendingUp, AlertCircle, Info, Plus, BellRing, ChevronRight, ArrowUpRight, HandCoins, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import Swal from "@/lib/brandAlert";
import T from "@/components/T";
import { formatAmount } from "@/lib/utils";

export default function SmartSavingGoal() {
  const { data: session } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]); 
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Form States
  const [goalName, setGoalName] = useState("");
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [months, setMonths] = useState<number>(1);
  const [savingDay, setSavingDay] = useState<number>(10);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const [suggestedPercent, setSuggestedPercent] = useState<number>(0);
  const [monthlySavingNeeded, setMonthlySavingNeeded] = useState<number>(0);

  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'BDT': return '৳';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(dbUser?.currency);

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

  const handleConfirmGoal = async () => {
    if (!session?.user) return Swal.fire("Error", "Please login first", "error");
    if (!goalName || targetAmount <= 0) return Swal.fire("Incomplete", "Please fill all goal details", "warning");

    setLoading(true);
    const newId = Math.random().toString(36).substring(2, 11);

    const newGoalObj = {
      id: newId,
      goalName: goalName.trim(),
      targetAmount,
      monthlySavingNeeded,
      savingDay: savingDay,
      currentSaved: 0,
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
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            goalId: newId,
            goalName: newGoalObj.goalName,
            savingDay: newGoalObj.savingDay,
            amount: monthlySavingNeeded
          }),
        });

        setGoals(prev => [...prev, newGoalObj]);
        setIsOpen(false);
        Swal.fire({
          title: "Goal Created!",
          text: `We will remind you on the ${savingDay}th of every month.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
      }
    } catch (error) {
      Swal.fire("Server Error", "Connection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawReason) return Swal.fire("Required", "Please provide a reason.", "warning");
    setWithdrawLoading(true);
    try {
      const res = await fetch("/api/withdraw-microsaving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          goalId: selectedGoal.id,
          goalName: selectedGoal.goalName,
          amountToWithdraw: selectedGoal.currentSaved,
          reason: withdrawReason,
        }),
      });

      if (res.ok) {
        Swal.fire("Request Sent", "Admin will review your request.", "success");
        setGoals(prev => prev.map(g => 
          g.id === selectedGoal.id ? { ...g, status: "pending-withdrawal" } : g
        ));
        setIsWithdrawOpen(false);
        setWithdrawReason("");
        setSelectedGoal(null);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleTransferToWallet = async (goal: any) => {
    const result = await Swal.fire({
      title: "Transfer to Wallet?",
      text: `Move ${currencySymbol}${formatAmount(goal.currentSaved)} to your NovaPay balance?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Transfer",
      confirmButtonColor: "#16a34a"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/transactions/transfer-savings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session?.user?.email, amount: goal.currentSaved, goalId: goal.id }),
        });

        if (res.ok) {
          Swal.fire("Success", "Money transferred to NovaPay wallet!", "success");
          setGoals(prev => prev.filter(g => g.id !== goal.id));
          setSelectedGoal(null);
        }
      } catch (error) {
        Swal.fire("Error", "Transfer failed.", "error");
      }
    }
  };

  const handleCashoutRewards = async (goal: any) => {
  // User confirmation check
  const result = await Swal.fire({
    title: "Cashout Rewards?",
    text: `Your target is reached! Move ${currencySymbol}${formatAmount(goal.currentSaved)} to your NovaPay balance.`,
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Yes, Cashout!",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#d33",
    background: document.documentElement.classList.contains('dark') ? '#0c1425' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
  });

  if (result.isConfirmed) {
    // Loading state start (Optional: tumi chaile ekta local loading state use korte paro)
    Swal.fire({
      title: "Processing...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
    });

    try {
      const res = await fetch("/api/transactions", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          type: "cashout_rewards",
          amount: goal.currentSaved,     
        txAmount: goal.currentSaved,
          goalId: goal.id
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success Message
        await Swal.fire({
          title: "Successfully Cashed Out!",
          text: `${currencySymbol}${formatAmount(goal.currentSaved)} has been added to your main wallet.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        // Update local state: Goal-ti list theke remove kora ebong modal close kora
        setGoals(prev => prev.filter(g => g.id !== goal.id));
        setSelectedGoal(null);
        
      } else {
        throw new Error(data.message || "Failed to process rewards.");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  }
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#1E293B] dark:text-slate-100 p-6 md:p-12 transition-colors duration-300">
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
            <T>NovaPay Savings</T>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium"><T>Smart micro-savings for your future goals.</T></p>
        </div>
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-white hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-600/25 active:scale-95">
          <Plus size={20} /> <T>New Goal</T>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <p className="text-slate-400 font-medium"><T>No active goals found. Start by creating one!</T></p>
          </motion.div>
        ) : (
          goals.map((goal, index) => {
            const current = goal.currentSaved || 0;
            const target = goal.targetAmount || 1;
            const progress = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = progress >= 100;

            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                onClick={() => setSelectedGoal(goal)}
                className="bg-white dark:bg-[#0f172a] p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer group relative overflow-hidden transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity dark:text-white">
                  <Target size={100} />
                </div>
                
                <div className="flex justify-between items-start mb-5">
                  <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <Target size={24} />}
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                    goal.status === 'pending-withdrawal' ? 'bg-amber-100 text-amber-700' : 
                    goal.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {goal.status === 'pending-withdrawal' ? 'Pending' : 
                     goal.status === 'approved' ? 'Approved' : isCompleted ? 'Target Reached' : `Day ${goal.savingDay}th`}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 truncate">{goal.goalName}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 font-medium"><T>Target:</T> {currencySymbol}{formatAmount(goal.targetAmount)}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold dark:text-slate-300">
                    <span><T>Progress</T></span>
                    <span className={isCompleted ? "text-green-500" : ""}>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      className={`${isCompleted ? 'bg-green-500' : 'bg-blue-600'} h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]`} 
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <T>Manage Goal</T> <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto max-h-[90vh]">
              <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-blue-600 transition-colors"><X /></button>
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600"><Sparkles /></div>
                  <h2 className="text-2xl font-bold dark:text-white"><T>Setup Goal</T></h2>
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
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex justify-between mb-4 items-center">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2"><CalendarDays size={14}/> Deposit Day</label>
                        <input type="checkbox" checked={isNotificationEnabled} onChange={(e) => setIsNotificationEnabled(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
                    </div>
                    <input type="range" min="1" max="28" value={savingDay} onChange={(e) => setSavingDay(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                    <div className="flex justify-between mt-3 text-[11px] font-bold text-blue-600 dark:text-blue-400"><span>Day: 01</span><span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px]">Selected: {savingDay}th</span><span>Day: 28</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 dark:bg-slate-800/30 border border-blue-100 dark:border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Info size={20} className="text-blue-500" /> <T>AI Plan</T></h3>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-blue-600/10">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium"><T>Monthly Deposit</T></p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{currencySymbol}{formatAmount(monthlySavingNeeded)}</p>
                  </div>
                  <div className={`p-5 rounded-2xl text-xs font-semibold flex gap-3 items-start ${isFeasible ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    <BellRing size={18} className="shrink-0 mt-0.5"/>
                    <p className="leading-relaxed">{isFeasible ? `Safe! You'll receive a reminder every ${savingDay}th of the month.` : `Warning: This goal exceeds your disposable income. Consider increasing the timeframe.`}</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleConfirmGoal} disabled={loading || !isFeasible || targetAmount <= 0} className={`w-full py-5 rounded-2xl font-bold text-lg mt-8 shadow-xl transition-all ${loading || !isFeasible ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500 active:shadow-inner"}`}>
                  {loading ? <T>Saving Plan...</T> : <><T>Confirm Goal for</T> {savingDay}th</>}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGoal(null)} className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl" />
            <motion.div layoutId={selectedGoal.id} className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[3rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedGoal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors"><X /></button>
              
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${Math.round(((selectedGoal.currentSaved || 0) / (selectedGoal.targetAmount || 1)) * 100) >= 100 ? 'bg-green-500/10 text-green-600' : 'bg-blue-600/10 text-blue-600'}`}>
                  {Math.round(((selectedGoal.currentSaved || 0) / (selectedGoal.targetAmount || 1)) * 100) >= 100 ? <CheckCircle2 size={32}/> : <Target size={32} />}
                </div>
                <h2 className="text-2xl font-bold dark:text-white">{selectedGoal.goalName}</h2>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mt-3 ${
                  selectedGoal.status === 'pending-withdrawal' ? 'bg-amber-100 text-amber-700' : 
                  selectedGoal.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                   Status: {selectedGoal.status}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400 font-medium"><T>Total Saved</T></span>
                  <span className="font-bold text-green-600 dark:text-green-500">{currencySymbol}{formatAmount(selectedGoal.currentSaved || 0)} / {currencySymbol}{formatAmount(selectedGoal.targetAmount)}</span>
                </div>
                
                <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5"/> 
                    <span>
                      {selectedGoal.status === "active" && "Your automated saving is active. Requests are reviewed within 24 hours."}
                      {selectedGoal.status === "pending-withdrawal" && "Withdrawal request is being reviewed by our finance team. Please wait."}
                      {selectedGoal.status === "approved" && "Review complete! You can now move your savings to your main balance."}
                      {Math.round(((selectedGoal.currentSaved || 0) / (selectedGoal.targetAmount || 1)) * 100) >= 100 && " Congratulations! You've hit your target amount."}
                    </span>
                  </p>
                </div>

                <div className="flex justify-between px-5 py-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium"><T>Auto-Remind</T></span>
                    <span className="font-bold dark:text-white">Every {selectedGoal.savingDay}th</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Condition: If 100% full, only show Cashout Reward */}
                {Math.round(((selectedGoal.currentSaved || 0) / (selectedGoal.targetAmount || 1)) * 100) >= 100 ? (
                  <button 
                  onClick={() => handleCashoutRewards(selectedGoal)}
                    className="w-full py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/20 py-4"
                  >
                    <HandCoins size={18}/> <T>Cashout Rewards</T>
                  </button>
                ) : (
                  <>
                    {/* Show Transfer button only if approved */}
                    {selectedGoal.status === "approved" ? (
                      <button 
                        onClick={() => handleTransferToWallet(selectedGoal)}
                        className="w-full py-4 rounded-2xl font-bold bg-green-600 text-white hover:bg-green-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                      >
                        <HandCoins size={18}/> <T>Transfer to NovaPay Wallet</T>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsWithdrawOpen(true)}
                        disabled={selectedGoal.status === "pending-withdrawal"}
                        className={`w-full py-4 rounded-2xl font-bold border flex items-center justify-center gap-2 transition-all ${selectedGoal.status === "pending-withdrawal" ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent" : "bg-amber-500/5 text-amber-600 border-amber-500/20 hover:bg-amber-500/10"}`}
                      >
                        <ArrowUpRight size={18}/> {selectedGoal.status === "pending-withdrawal" ? <T>Withdrawal Pending</T> : <T>Request Early Withdrawal</T>}
                      </button>
                    )}
                    
                    {/* Disabled Cashout button (since not 100%) */}
                    <button 
                      disabled={true}
                      className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      <HandCoins size={18}/> <T>Cashout Rewards</T>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWithdrawOpen(false)} className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white"><AlertCircle className="text-amber-500" /> <T>Withdrawal Request</T></h3>
                <button onClick={() => setIsWithdrawOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Please provide a reason for withdrawal from <strong>{selectedGoal?.goalName}</strong>.</p>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><MessageSquare size={14} /> Reason for Note</label>
                    <textarea value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} placeholder="Why are you withdrawing early?" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none transition-all" />
                </div>
                <button onClick={handleWithdrawSubmit} disabled={withdrawLoading || !withdrawReason} className="w-full py-4 rounded-2xl font-bold bg-amber-600 text-white hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 disabled:bg-slate-400 dark:disabled:bg-slate-700">
                  {withdrawLoading ? <T>Submitting Request...</T> : <T>Submit Request</T>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">{icon} <T>{label}</T></label>
      <input {...props} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400/70" />
    </div>
  );
}

