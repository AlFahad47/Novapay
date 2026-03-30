"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Banknote,
  MessageSquare // Reason icon 
} from 'lucide-react';
import Swal from 'sweetalert2';
import T from "@/components/T";

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
       
        const sortedData = data.data.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.requestedAt) - new Date(a.requestedAt);
        });
        setRequests(sortedData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Full Note show 
  const showFullNote = (note: string) => {
    Swal.fire({
      title: 'Withdrawal Reason',
      text: note,
      icon: 'info',
      background: '#0D263C',
      color: '#fff',
      confirmButtonColor: '#3b82f6'
    });
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const targetRequest = requests.find(req => req._id === id);
    if (!targetRequest) return;

    const result = await Swal.fire({
      title: `Confirm ${action.toUpperCase()}?`,
      text: `Are you sure you want to ${action} this withdrawal request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approved' ? '#10b981' : '#ef4444',
      background: '#0D263C',
      color: '#fff',
      confirmButtonText: `Yes, ${action} it!`
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Processing...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false,
        background: '#0D263C',
        color: '#fff'
      });

      try {
        const res = await fetch(`/api/admin/withdrawals`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: action,
            goalId: targetRequest.goalId,
            email: targetRequest.email
          })
        });
        
        const data = await res.json();

        if (data.success) {
          await Swal.fire({
            title: "Success!",
            text: `Request has been ${action} successfully.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
          fetchWithdrawals(); 
        } else {
          throw new Error(data.message || "Update failed");
        }
      } catch (error: any) {
        Swal.fire("Error", error.message || "Something went wrong", "error");
      }
    }
  };

  
  

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#050B14] p-6 lg:p-10 font-sans">
      
      {/* Header - Search removed */}
      <div className="mb-10">
        <h1 className="text-3xl font-black dark:text-white tracking-tight">
          <T>Admin</T> <span className="text-blue-600"><T>Withdrawals</T></span>
        </h1>
        <p className="text-slate-500 text-sm mt-1"><T>Manage and review micro-saving withdrawal requests.</T></p>
      </div>

      {/* Table Card */}
      <div className="bg-white/70 dark:bg-[#0D263C]/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest"><T>Fetching Records</T></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400"><T>User Details</T></th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400"><T>Amount</T></th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400"><T>Goal & Reason (Click to view)</T></th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400"><T>Status</T></th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right"><T>Action</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {requests.length > 0 ? requests.map((req) => (
                  <tr key={req._id} className={`group transition-colors ${req.status === 'pending' ? 'bg-blue-600/[0.03]' : ''}`}>
                    
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                          {req.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold dark:text-white leading-none">{req.user?.name || "Unknown"}</p>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">{req.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-500" />
                        <span className="font-black text-xl dark:text-white">
                          ৳{req.amount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div 
                        onClick={() => showFullNote(req.reason)} 
                        className="flex flex-col gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                      >
                    
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic truncate max-w-[180px] flex items-center gap-2">
                          <MessageSquare size={12} /> "{req.reason}"
                        </p>
                        <p className="text-[9px] text-slate-500 flex items-center gap-1 font-mono mt-1 uppercase">
                           <Clock size={10} /> {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                        ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}
                      `}>
                        {req.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction(req._id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20">
                            <CheckCircle2 size={18} />
                          </button>
                          <button onClick={() => handleAction(req._id, 'rejected')} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter"><T>Processed</T></span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-500 italic"><T>No records found.</T></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}