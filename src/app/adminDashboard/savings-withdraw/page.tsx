"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Loader2,
  AlertCircle,
  Banknote,
  Hash
} from 'lucide-react';
import Swal from 'sweetalert2';

// Interface matching your MongoDB document exactly
interface WithdrawalRequest {
  _id: string;
  email: string;
  goalId: string;
  goalName: string;
  amountToWithdraw: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch data from your backend
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
        console.log(data.data)
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

  // 2. Handle Approval/Rejection Action
  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const result = await Swal.fire({
      title: `Confirm ${action.toUpperCase()}?`,
      text: `Are you sure you want to ${action} this request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approved' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      background: '#0D263C',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/withdrawals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action })
        });
        
        if (res.ok) {
          Swal.fire("Success!", `Request has been ${action}.`, "success");
          fetchWithdrawals(); 
        }
      } catch (error) {
        Swal.fire("Error", "Update failed", "error");
      }
    }
  };

  const filteredRequests = requests.filter(req => 
    req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.goalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#050B14] p-6 lg:p-10 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">
            Early <span className="text-blue-600">Withdrawals</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 text-sm">
            <AlertCircle size={14} /> Reviewing micro-saving withdrawal claims.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search email or goal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D263C] dark:text-white outline-none w-full md:w-72 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/70 dark:bg-[#0D263C]/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={42} />
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">User & Goal Info</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Amount (BDT)</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Reason / Date</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                  <tr key={req._id} className="group hover:bg-blue-600/[0.02] transition-colors">
                    
                    {/* User & Goal */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                          {req.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{req.email}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[10px] w-fit px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-600 font-bold uppercase tracking-tighter">
                              {req.goalName}
                            </span>
                           
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-xl text-slate-900 dark:text-white">
                          ৳{req.amountToWithdraw?.toLocaleString() || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Banknote size={10} /> Full Balance
                        </span>
                      </div>
                    </td>

                    {/* Reason & Date */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic max-w-[200px] truncate" title={req.reason}>
                          "{req.reason || "No reason given"}"
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock size={10} /> 
                          {new Date(req.requestedAt).toLocaleDateString()} at {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                        ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}
                      `}>
                        <span className={`w-1 h-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-500' : req.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleAction(req._id, 'approved')}
                            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-md"
                            title="Approve"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                             onClick={() => handleAction(req._id, 'rejected')}
                             className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-md"
                             title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Banknote size={48} className="mb-2 text-slate-400" />
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No withdrawal requests found</p>
                      </div>
                    </td>
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