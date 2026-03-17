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

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
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

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const result = await Swal.fire({
      title: `Confirm ${action.toUpperCase()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approved' ? '#10b981' : '#ef4444',
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
          Swal.fire("Success", `Request ${action}`, "success");
          fetchWithdrawals(); 
        }
      } catch (error) {
        Swal.fire("Error", "Update failed", "error");
      }
    }
  };

  // Filter logic using the 'user' object from your screenshot
  const filteredRequests = requests.filter(req => 
    req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#050B14] p-6 lg:p-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">
            Admin <span className="text-blue-600">Withdrawals</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Reviewing pending micro-saving claims.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search email or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D263C] dark:text-white outline-none w-full md:w-72 shadow-sm"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white/70 dark:bg-[#0D263C]/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching DB Records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">User Info</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Goal & Reason</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                  <tr key={req._id} className="group hover:bg-blue-600/[0.02] transition-colors">
                    
                    {/* User Info from your 'user' object */}
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

                    {/* Amount - matches 'amount' field in your image */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-500" />
                        <span className="font-black text-xl dark:text-white">
                          ৳{req.amount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </td>

                    {/* Goal & Reason */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] w-fit px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase tracking-tight">
                          {req.goalName}
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic truncate max-w-[150px]">
                          "{req.reason}"
                        </p>
                        <p className="text-[9px] text-slate-500 flex items-center gap-1 font-mono mt-1 uppercase">
                           <Clock size={10} /> {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                        ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}
                      `}>
                        {req.status}
                      </span>
                    </td>

                    {/* Decision Buttons */}
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction(req._id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20">
                            <CheckCircle2 size={18} />
                          </button>
                          <button onClick={() => handleAction(req._id, 'rejected')} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-500 italic">No data found in collection.</td>
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