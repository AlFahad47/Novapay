"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Smartphone, ArrowDownLeft, ArrowUpRight, Loader2, Zap, Users } from 'lucide-react';
import Swal from "sweetalert2";
import T from "@/components/T";

const CardsAndBanks = () => {
  const { data: session } = useSession();
  const [dbUser, setDbUser] = useState<any>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // FIXED: Added missing state

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/user/update?email=${encodeURIComponent(session.user.email)}`);
      const data = await res.json();
      setDbUser(data);
      if (data.linkedBanks?.length > 0 && !selectedBankId) setSelectedBankId(data.linkedBanks[0].id);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  }, [session?.user?.email, selectedBankId]);

  useEffect(() => { loadData(); }, [loadData]);
  const currencySymbol = dbUser?.currency === "BDT" ? "৳" : "$";


  const handleLinkBank = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Payment Details',
      html: `
        <div class="flex flex-col gap-4 text-left p-2">
          <input id="s-no" class="swal2-input !m-0 !w-full" placeholder="CARD NUMBER" maxlength="16">
          <input id="s-holder" class="swal2-input !m-0 !w-full" placeholder="CARDHOLDER NAME">
          <div class="flex gap-3">
            <input id="s-exp-m" class="swal2-input !m-0 !w-full" placeholder="MM" maxlength="2">
            <input id="s-exp-y" class="swal2-input !m-0 !w-full" placeholder="YYYY" maxlength="4">
            <input id="s-cvv" class="swal2-input !m-0 !w-full" placeholder="CVV" maxlength="3">
          </div>
        </div>
      `,
      confirmButtonText: 'CONFIRM AND LINK',
      preConfirm: () => {
        const accNo = (document.getElementById('s-no') as HTMLInputElement).value;
        const name = (document.getElementById('s-holder') as HTMLInputElement).value;
        const expM = (document.getElementById('s-exp-m') as HTMLInputElement).value;
        const expY = (document.getElementById('s-exp-y') as HTMLInputElement).value;
        const cvv = (document.getElementById('s-cvv') as HTMLInputElement).value;

        if (accNo.length < 16 || !name || !expM || !expY || cvv.length < 3) {
          return Swal.showValidationMessage("Please fill all fields");
        }
        return { brand: accNo.startsWith('4') ? 'visa' : 'mastercard', name, accNo, expiry: `${expM}/${expY.slice(-2)}` };
      }
    });

    if (formValues) {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email, newBank: formValues })
      });
      if (res.ok) await loadData();
    }
  };

  const handleTransfer = async (type: 'add_money' | 'deposit_money') => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return Swal.fire({ title: "Enter valid amount", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
    if (!selectedBankId) {
      return Swal.fire({ title: "Select a card first", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }

    setIsProcessing(true);
    Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          bankId: selectedBankId,   
          amount: numAmount,        
          actionType: type,         
        })
      });

      const data = await res.json();

      if (res.ok) {
        await loadData();
        setAmount("");
        Swal.fire({ 
          icon: 'success', 
          title: type === 'add_money' ? 'Topped Up!' : 'Deposited!', 
          text: `$${numAmount.toLocaleString()} processed.`,
        });
      } else {
        Swal.fire("Error", data.error || "Transaction failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050B14] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  const banks = dbUser?.linkedBanks || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] text-slate-900 dark:text-white p-4 md:p-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black">NovaPay <span className="text-blue-500">{currencySymbol}{(dbUser?.balance || 0).toLocaleString()}</span></h1>
          <button onClick={handleLinkBank} className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Plus size={20} /></button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-6 space-y-8 md:space-y-12">
            <div className={`relative ${isMobile ? 'h-[400px]' : 'h-[520px]'} w-full`} onMouseLeave={() => setHoveredIndex(null)}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 md:mb-2"><T>My Cards</T></h3>
              {banks.map((card: any, index: number) => {
                const isSelected = selectedBankId === card.id;
                let visualIndex = index;
                if (selectedBankId) {
                  const selectedIdx = banks.findIndex((b: any) => b.id === selectedBankId);
                  if (index === selectedIdx) visualIndex = banks.length - 1;
                  else if (index > selectedIdx) visualIndex = index - 1;
                }
                const baseGap = isMobile ? 45 : 60;
                const expandGap = isMobile ? 140 : 180;
                let topOffset = visualIndex * baseGap;
                if (hoveredIndex !== null && visualIndex > hoveredIndex) topOffset += expandGap;

                return (
                  <motion.div
                    key={card.id}
                    onMouseEnter={() => !isMobile && setHoveredIndex(visualIndex)}
                    onClick={() => {
                      setSelectedBankId(card.id);
                      if(isMobile) setHoveredIndex(hoveredIndex === visualIndex ? null : visualIndex);
                    }}
                    layout
                    animate={{ top: topOffset, scale: isSelected ? 1.04 : 1, zIndex: isSelected ? 50 : visualIndex }}
                    transition={{ type: "spring", stiffness: 1750, damping: 65 }}
                    className={`absolute w-full h-[220px] md:h-[280px] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 cursor-pointer shadow-2xl border transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-white/5'}`}
                    style={{ background: card.brand === 'visa' ? 'linear-gradient(135deg, #111827, #374151)' : 'linear-gradient(135deg, #2563eb, #60a5fa)' }}
                  >
                    <div className="flex justify-between items-center mb-6 md:mb-10">
                      <p className="text-[9px] font-black uppercase text-white/70">{card.brand} Platinum</p>
                      <p className="text-white/60 font-mono text-[10px]">**** {card.accNo.slice(-4)}</p>
                    </div>
                    <div className="mt-4 md:mt-8">
                       <p className="text-[9px] text-white/40 uppercase font-bold">Bank Balance</p>
                       <p className="text-2xl md:text-4xl font-black text-white italic">{currencySymbol}{(card.balance || 0).toLocaleString()}</p>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end italic">
                       <p className="text-xs font-bold text-white uppercase">{card.name}</p>
                       <p className="text-[10px] text-white/50">{card.expiry || "06/28"}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 sticky top-12">
              <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3 italic"><Zap className="text-blue-500" /> <T>Transfer</T></h3>
              <div className="space-y-6">
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl text-3xl md:text-4xl font-black outline-none border-2 border-transparent focus:border-blue-500 transition-all dark:text-white" placeholder="0" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">BDT</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleTransfer('add_money')} disabled={isProcessing} className="p-6 bg-blue-600 text-white rounded-2xl font-black flex flex-col items-center gap-1 shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                    <ArrowDownLeft /> <span className="text-[10px]"><T>ADD MONEY</T></span>
                  </button>
                  <button onClick={() => handleTransfer('deposit_money')} disabled={isProcessing} className="p-6 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black flex flex-col items-center gap-1 active:scale-95 transition-all">
                    <ArrowUpRight /> <span className="text-[10px]"><T>DEPOSIT</T></span>
                  </button>
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