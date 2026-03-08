"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { motion } from 'framer-motion';
import { 
  Landmark, Plus, ShieldCheck, Smartphone, 
  CheckCircle2, ChevronRight, Info, 
  ArrowDownLeft, ArrowUpRight, Loader2 
} from 'lucide-react';
import Swal from "sweetalert2";

const CardsAndBanks = () => {
  const { data: session } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. Fetch Data ---
  const loadData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/user/update?email=${encodeURIComponent(session.user.email)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDbUser(data);
      
      if (data.linkedBanks?.length > 0 && !selectedBankId) {
        setSelectedBankId(data.linkedBanks[0].id);
      }
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, selectedBankId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- 2. Link New Bank Logic ---
  const handleLinkBank = async () => {
    const isDark = document.documentElement.classList.contains('dark');

    const { value: formValues } = await Swal.fire({
      title: 'Link Bank Account',
      html: `
        <div class="flex flex-col gap-3">
          <input id="swal-name" class="swal2-input !m-0 !w-full" placeholder="Bank Name">
          <input id="swal-acc" class="swal2-input !m-0 !w-full" placeholder="Account Number">
         
        </div>
      `,
      background: isDark ? '#0F172A' : '#FFFFFF',
      color: isDark ? '#F8FAFC' : '#1E293B',
      showCancelButton: true,
      confirmButtonText: 'Link Now',
      confirmButtonColor: '#1E50FF',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const accNo = (document.getElementById('swal-acc') as HTMLInputElement).value;
        const balance = (document.getElementById('swal-bal') as HTMLInputElement).value;
        if (!name || !accNo) return Swal.showValidationMessage('Fill required fields');
        return { name, accNo, balance: parseFloat(balance) || 0 };
      }
    });

    if (formValues) {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session?.user?.email,
            newBank: formValues, // Backend pushes this to linkedBanks
            wallethistory: dbUser?.wallethistory || [],
            wallet: dbUser?.wallet || {},
            bankBalance: dbUser?.bankBalance || 0
          })
        });

        if (res.ok) {
          await loadData();
          Swal.fire({ icon: 'success', title: 'Bank Linked', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        }
      } catch (err) {
        Swal.fire("Error", "Action failed", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- 3. Handle Money Transfer ---
  // --- 3. Updated Handle Money Transfer ---
  const handleTransfer = async (type: 'add_money' | 'deposit_money') => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return Swal.fire({ title: "Enter valid amount", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
    if (!selectedBankId) {
      return Swal.fire({ title: "Select a bank account", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }

    // Balance Checks (Frontend side for UX)
    const selectedBank = dbUser?.linkedBanks?.find((b: any) => b.id === selectedBankId);
    if (type === 'add_money' && (selectedBank?.balance || 0) < numAmount) {
      return Swal.fire({ title: "Insufficient Bank Balance", icon: "error" });
    }
    if (type === 'deposit_money' && (dbUser?.balance || 0) < numAmount) {
      return Swal.fire({ title: "Insufficient Vault Balance", icon: "error" });
    }

    setIsProcessing(true);
    Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      // THIS PAYLOAD MATCHES YOUR BACKEND REQUIREMENTS
      const payload = {
        email: session?.user?.email,
        bankId: selectedBankId,   // Matches backend 'bankId'
        amount: numAmount,        // Matches backend 'amount'
        actionType: type,         // "add_money" or "deposit_money"
      };

      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        await loadData(); // Refresh balances from DB
        setAmount("");
        Swal.fire({ 
          icon: 'success', 
          title: type === 'add_money' ? 'Vault Topped Up!' : 'Deposited to Bank!', 
          text: `৳${numAmount.toLocaleString()} processed successfully.`,
          confirmButtonColor: '#1E50FF' 
        });
      } else {
        Swal.fire("Transaction Failed", data.error || "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  const banks = dbUser?.linkedBanks || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] text-slate-900 dark:text-white p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black">
              Vault <span className="text-blue-500">৳{(dbUser?.balance || 0).toLocaleString()}</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 text-[10px] uppercase tracking-widest">
              Live Core Banking Active
            </p>
          </motion.div>
          <button 
            onClick={handleLinkBank}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-blue-500/20"
          >
            <Plus size={20} /> Link New Account
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Verified Banks List */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> Verified Sources ({banks.length})
            </h3>
            
            {banks.length > 0 ? banks.map((bank: any) => (
              <motion.div 
                key={bank.id}
                whileHover={{ x: 5 }}
                onClick={() => setSelectedBankId(bank.id)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer flex justify-between items-center transition-all ${
                  selectedBankId === bank.id 
                  ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10' 
                  : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedBankId === bank.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{bank.name}</h4>
                    <p className="text-xs font-medium text-slate-500 uppercase">Acc: {bank.accNo} • ৳{bank.balance?.toLocaleString()}</p>
                  </div>
                </div>
                {selectedBankId === bank.id && <CheckCircle2 className="text-blue-500" size={24} />}
              </motion.div>
            )) : (
              <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400 font-bold">
                NO ACCOUNTS LINKED
              </div>
            )}
          </div>

          {/* Quick Transfer UI */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[3rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-xl font-black">Quick Transfer</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Amount</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full mt-2 bg-slate-50 dark:bg-white/5 rounded-2xl p-6 outline-none border-2 border-transparent focus:border-blue-500 text-3xl font-black transition-all" 
                    placeholder="0.00" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTransfer('add_money')}
                    className="p-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black flex flex-col items-center gap-2 transition-all active:scale-95"
                  >
                    <ArrowDownLeft size={20} /> <span className="text-[10px] uppercase">Add Money</span>
                  </button>
                  <button 
                    onClick={() => handleTransfer('deposit_money')}
                    className="p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex flex-col items-center gap-2 transition-all active:scale-95"
                  >
                    <ArrowUpRight size={20} /> <span className="text-[10px] uppercase">Deposit</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                  <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                    Transferring to/from: <span className="text-blue-500">{banks.find((b: any) => b.id === selectedBankId)?.name || 'None'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsAndBanks;