"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { useSession, signIn } from "next-auth/react"
import {
  FaStar, FaQuoteLeft, FaUser, FaPen, 
  FaWallet, FaCoins, FaChartLine, FaShieldAlt, 
  FaChevronLeft, FaChevronRight
} from "react-icons/fa"
import "sweetalert2/dist/sweetalert2.min.css"
import T from "@/components/T"

// ... (Type definitions and FLOATING constants remain same)
type ReviewType = {
  _id?: string
  name: string
  email: string
  rating: number
  comment: string
  avatar?: string
}

const STAR_LABELS = ["Terrible", "Bad", "Okay", "Good", "Excellent"]

const FLOATING = [
  { icon: <FaWallet />,    top: "8%",  left: "2%",  size: 26, dur: 7,  delay: 0   },
  { icon: <FaCoins />,     top: "20%", right: "2%", size: 30, dur: 9,  delay: 1.5 },
  { icon: <FaChartLine />, top: "55%", left: "1%",  size: 22, dur: 8,  delay: 0.8 },
  { icon: <FaShieldAlt />, top: "70%", right: "2%", size: 24, dur: 6,  delay: 2   },
]

export default function Page() {
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email

  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const formRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 6

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews")
      const data = await res.json()
      setReviews(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReviews() }, [])

  // --- PAGINATION LOGIC ---
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll back toward the reviews section (optional)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  // ... (submitReview, deleteReview, editReview functions remain same)
  const submitReview = async () => {
    if (!session) {
      Swal.fire({ icon: "info", title: "Login Required", text: "Please sign in to submit a review." })
      signIn("google")
      return
    }
    const finalName = session.user?.name || name
    if (!finalName.trim() || !comment.trim() || rating === 0) {
      Swal.fire({ icon: "warning", title: "Incomplete Form", text: "Please fill all fields." })
      return
    }

    const payload = {
      name: finalName,
      email: session.user?.email || "",
      rating,
      comment,
      avatar: session.user?.image || "/avatars/default.png",
    }

    try {
      if (editingId) {
        await fetch("/api/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
        setEditingId(null)
      } else {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()
        if (result.error) return Swal.fire({ icon: "error", title: "Oops!", text: result.error })
      }

      setName(""); setComment(""); setRating(0);
      Swal.fire({ icon: "success", title: "Success!" })
      fetchReviews()
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong" })
    }
  }

  const deleteReview = (id: string) => {
    Swal.fire({
      title: "Delete this review?", icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E50FF", confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`/api/reviews?id=${id}`, { method: "DELETE" })
        fetchReviews()
        Swal.fire("Deleted!", "Your review has been removed.", "success")
      }
    })
  }

  const editReview = (review: ReviewType) => {
    setName(review.name); setComment(review.comment); setRating(review.rating)
    setEditingId(review._id || null)
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const total = reviews.length
  const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0.0"
  const distrib = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0,
  }))

  const activeRating = hoverRating || rating

  return (
    <div className="relative min-h-screen bg-[#F0F7FF] dark:bg-[#040911] transition-colors overflow-hidden pb-20">
      {/* ... (Styles and Background remains same) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-20px,20px) scale(0.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,40px) scale(1.05)} 66%{transform:translate(20px,-20px) scale(0.97)} }
        .blob1 { animation: blob1 12s ease-in-out infinite; }
        .blob2 { animation: blob2 15s ease-in-out infinite; }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .card-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.08) 50%,transparent 60%); transform:translateX(-100%); border-radius:inherit; }
        .card-shimmer:hover::after { animation: shimmer 0.7s ease forwards; }
      `}} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob1 absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#4DA1FF]/10 dark:bg-[#4DA1FF]/5 blur-3xl" />
        <div className="blob2 absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#1E50FF]/10 dark:bg-[#1E50FF]/5 blur-3xl" />
      </div>

      {/* HEADER */}
      <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-8 text-center z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4DA1FF]/30 bg-[#4DA1FF]/10 text-[#4DA1FF] text-sm font-medium mb-3">
          <FaStar size={11} /> <T>NovaPay Reviews</T>
        </motion.div>
        <motion.h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#4DA1FF] via-[#1E50FF] to-[#4DA1FF] bg-clip-text text-transparent leading-tight">
          <T>What Our Users Are Saying</T>
        </motion.h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          
          {/* LEFT: STATS & FORM */}
          <div className="flex flex-col gap-6">
             {/* Stats Card (Same) */}
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center min-w-[90px]">
                  <span className="text-5xl font-black bg-gradient-to-b from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent leading-none">{avg}</span>
                  <div className="flex gap-0.5 mt-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} size={13} className={i < Math.round(parseFloat(avg)) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{total} <T>reviews</T></p>
                </div>
                <div className="w-px h-16 bg-gray-200 dark:bg-white/10 shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  {distrib.map(({ star, count: cnt, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-3 text-right">{star}</span>
                      <FaStar size={9} className="text-yellow-400 shrink-0" />
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF]" />
                      </div>
                      <span className="text-[10px] text-gray-400 w-4 text-right">{cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form (Same) */}
            <motion.div ref={formRef} className="rounded-2xl bg-white/85 dark:bg-[#070F1E]/90 backdrop-blur-2xl p-6 border border-[#4DA1FF]/20">
                {session ? (
                  <div className="flex items-center gap-4 mb-5 p-3 rounded-2xl bg-[#4DA1FF]/5 border border-[#4DA1FF]/15">
                    <img src={session.user?.image || ""} className="w-12 h-12 rounded-full border-2 border-[#1E50FF]" alt="User" />
                    <div>
                      <p className="text-xs text-[#4DA1FF] font-semibold"><T>Writing as</T></p>
                      <p className="font-bold text-gray-800 dark:text-white">{session.user?.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-[#4DA1FF]/5 border border-[#4DA1FF]/15">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center"><FaUser className="text-gray-400" /></div>
                    <button onClick={() => signIn("google")} className="text-xs text-[#4DA1FF] font-semibold hover:underline"><T>Sign in to leave a review</T></button>
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FaPen size={14} className="text-[#4DA1FF]" /> {editingId ? <T>Update Review</T> : <T>Leave a Review</T>}</h2>
                <input type="text" placeholder="Your Name" value={session?.user?.name || name} onChange={e => setName(e.target.value)} readOnly={!!session} className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm focus:ring-2 focus:ring-[#4DA1FF]/40 outline-none" />
                <textarea placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm focus:ring-2 focus:ring-[#4DA1FF]/40 outline-none resize-none" />
                <div className="flex flex-col items-center gap-2 mb-5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} onClick={() => setRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                        <FaStar size={28} className={i <= activeRating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-[#4DA1FF]">{activeRating > 0 ? <T>{STAR_LABELS[activeRating - 1]}</T> : ""}</p>
                </div>
                <button onClick={submitReview} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] text-white font-bold text-sm shadow-lg">
                  {editingId ? <T>Update Review</T> : <T>Submit Review</T>}
                </button>
            </motion.div>
          </div>

          {/* RIGHT: REVIEW CARDS WITH PAGINATION */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap"><T>Community Reviews</T></span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-400"><T>Loading reviews...</T></div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="wait">
                    {currentReviews.map((review, i) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="card-shimmer relative overflow-hidden rounded-2xl p-5 bg-white/50 dark:bg-white/5 border border-[#4DA1FF]/20 backdrop-blur-xl flex flex-col gap-3"
                      >
                        {review.email === currentUserEmail && <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#4DA1FF]/20 text-[#4DA1FF]"><T>YOUR REVIEW</T></span>}
                        <FaQuoteLeft size={18} className="text-[#4DA1FF]/30" />
                        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed flex-1">{review.comment}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => <FaStar key={s} size={12} className={s < review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />)}
                        </div>
                        <div className="h-px bg-[#4DA1FF]/10 my-1" />
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} className="w-9 h-9 rounded-full border border-[#4DA1FF]/30" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{review.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{review.email}</p>
                          </div>
                        </div>
                        {review.email === currentUserEmail && (
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => editReview(review)} className="flex-1 py-1 text-[10px] rounded-md bg-[#4DA1FF]/10 text-[#4DA1FF] font-bold uppercase tracking-tighter"><T>Edit</T></button>
                            <button onClick={() => deleteReview(review._id!)} className="flex-1 py-1 text-[10px] rounded-md bg-red-500/10 text-red-400 font-bold uppercase tracking-tighter"><T>Delete</T></button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 disabled:opacity-30 text-[#4DA1FF]"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => paginate(idx + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          currentPage === idx + 1 
                          ? "bg-[#1E50FF] text-white shadow-lg shadow-[#1E50FF]/30" 
                          : "bg-white dark:bg-white/5 text-gray-500 hover:border-[#4DA1FF]/50 border border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 disabled:opacity-30 text-[#4DA1FF]"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}