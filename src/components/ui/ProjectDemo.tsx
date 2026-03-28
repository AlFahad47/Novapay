"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import T from "@/components/T";

export default function ProjectDemo() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="w-full py-16 bg-[#f0f7ff] dark:bg-[#04090f] border-t-2 border-[#0061ff] dark:border-[#0095ff] transition-colors duration-300">
      <div className="w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-[#0061ff] text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
            <T>Track Your Balance</T>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0061ff] via-[#0095ff] to-[#00d4ff] dark:from-white dark:via-[#93C5FD] dark:to-[#0061ff] bg-clip-text text-transparent leading-tight">
            <T>See exactly where your money goes</T>
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-md">
            <T>With NovaPay, you get a real-time view of your wallet balance,
            transaction history, and spending patterns — all in one place.</T>
          </p>

          <ul className="mt-6 space-y-3">
            {[
              "Real-time balance updates",
              "Full transaction history",
              "AI-powered spending insights",
              "Instant alerts for every transaction",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#0061ff] flex items-center justify-center text-white font-bold text-xs">✓</span>
                <T>{item}</T>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative w-full h-64 lg:h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer group"
        >
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/5" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ scale: hovered ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-full bg-[#0061ff] dark:bg-[#0095ff] flex items-center justify-center shadow-lg"
            >
              <svg
                className="w-6 h-6 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              <T>Demo video coming soon</T>
            </p>
          </div>

          <span className="absolute top-4 left-4 bg-[#0061ff] text-white text-xs font-semibold px-3 py-1 rounded-full">
            <T>NovaPay Demo</T>
          </span>
        </motion.div>

      </div>
    </section>
  );
}
