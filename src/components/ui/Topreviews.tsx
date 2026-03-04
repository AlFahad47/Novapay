"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaQuoteRight, FaArrowRight, FaLock } from 'react-icons/fa'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

type ReviewType = {
  _id: string
  name: string
  rating: number
  comment: string
  avatar: string
  email: string
}

export default function TopReviews() {
  const { data: session } = useSession()
  const [topReviews, setTopReviews] = useState<ReviewType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        const res = await fetch("/api/reviews")
        const data: ReviewType[] = await res.json()
        // শুধুমাত্র ৫ স্টার রেটিং এবং সর্বোচ্চ ৬টি রিভিউ ফিল্টার করা হচ্ছে
        const filtered = data.filter(r => r.rating === 5).slice(0, 6)
        setTopReviews(filtered)
      } catch (err) {
        console.error("Failed to fetch reviews", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopReviews()
  }, [])

  return (
    <section className="py-20 bg-[#F0F7FF] dark:bg-[#040911] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 text-center">
          <div className=''>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[#1E50FF] font-bold tracking-widest uppercase text-sm"
            >
              Testimonials
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white "
            >
              What Our Users  <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent">Say</span>
            </motion.h2>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {session ? (
              <Link 
                href="/review" 
                className="group flex items-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-6 py-3 rounded-2xl font-bold text-gray-800 dark:text-white hover:bg-[#1E50FF] hover:text-white transition-all shadow-xl"
              >
                Share Your Experience <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={() => signIn("google")}
                className="group flex items-center gap-3 bg-[#1E50FF] px-6 py-3 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"
              >
                <FaLock size={14} /> Login to Review
              </button>
            )}
          </motion.div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-white/5 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative group p-8 rounded-[2.5rem] bg-white dark:bg-[#0A1221] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden"
              >
                {/* Bank Card Style Gradient Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1E50FF]/10 rounded-full blur-3xl group-hover:bg-[#1E50FF]/20 transition-colors" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" size={16} />
                      ))}
                    </div>
                    <FaQuoteRight className="text-gray-200 dark:text-white/10" size={30} />
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 font-medium italic mb-8 line-clamp-4 leading-relaxed">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={review.avatar} 
                        alt={review.name} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-white/10 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-[#0A1221] rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{review.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Verified User</p>
                    </div>
                  </div>
                </div>

                {/* Glassy Overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link href="/review" className="text-gray-500 hover:text-[#1E50FF] font-semibold flex items-center justify-center gap-2 transition-colors">
            See all community feedback <FaArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  )
}