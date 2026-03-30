"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import T from "@/components/T";

// ===== Animation Counter =====
function Counter({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const increment = value / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <h3
        className="text-4xl font-bold 
               bg-gradient-to-r 
               from-[#1D4E48] via-[#2f7c72] to-[#BDDD7E] 
               dark:from-[#BDDD7E] dark:via-[#9FE870] dark:to-white 
               bg-clip-text text-transparent"
      >
        {count}+
      </h3>

      <p className="text-gray-600 dark:text-white/70 mt-2"><T>{label}</T></p>
    </div>
  );
}

// ===== Animation Variants =====
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8fffd] via-white to-[#eefaf5] dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ===== Animated Gradient Background ===== */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-[#BDDD7E]/40 to-[#1D4E48]/20 rounded-full blur-3xl -z-10"
      />

      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-[#1D4E48]/30 to-[#BDDD7E]/20 rounded-full blur-3xl -z-10"
      />

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.span
            variants={fadeUp}
            className="
inline-block
bg-gradient-to-r from-[#BDDD7E]/40 to-[#1D4E48]/20 
dark:from-[#BDDD7E]/20 dark:to-[#1D4E48]/40
text-[#1D4E48] dark:text-[#BDDD7E]
px-4 py-2 rounded-full text-sm font-medium"
          >
            <T>Next-Gen Digital Wallet</T>
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#1D4E48] via-[#2f7c72] to-[#BDDD7E] dark:from-[#BDDD7E] dark:via-[#9FE870] bg-clip-text text-transparent"
          >
            <T>Professional Digital Finance Made Simple</T>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
          >
            <span className="font-bold text-[#1D4E48] dark:text-[#94ec82]">
              NovaPay
            </span>{" "}
            <T>delivers a secure and intelligent digital wallet platform built for
            modern financial management. Experience fast transactions,
            AI-powered analytics, and enterprise-grade security in one seamless
            ecosystem.</T>
          </motion.p>

          <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-gradient-to-r bg-[#BDDD7E] text-[#1D4E48]   dark:hover:bg-amber-400 dark:hover:text-black  hover:scale-105 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <T>Get Started</T>
            </Link>

            <Link
              href="/login"
              className="border border-[#1D4E48] text-[#1D4E48] hover:bg-[#BDDD7E] hover:text-[#1D4E48] hover:border-0 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-amber-400 dark:hover:text-black px-8 py-4 font-bold rounded-2xl transition-all duration-300"
            >
              <T>Login</T>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Glass Card */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-white/40 dark:border-gray-700"
        >
          {[
            "End-to-End Encrypted Payments",
            "Real-Time Transaction Monitoring",
            "AI Expense Intelligence",
            "Advanced Fraud Protection",
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.25 }}
              className="flex items-center gap-4 mb-6"
            >
              {" "}
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#1D4E48] to-[#BDDD7E]" />{" "}
              <p className="text-gray-700 dark:text-gray-200 font-medium">
                <T>{item}</T>{" "}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Gradient Divider */}
      <div className="h-24 bg-gradient-to-b from-transparent via-[#BDDD7E]/10 to-transparent" />

      {/* ================= STATS ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {/* <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative grid md:grid-cols-3 gap-12 bg-white dark:bg-gray-950  rounded-3xl shadow-xl p-12 border border-transparent dark:border-gray-700"
        >
          <Counter value={50} label="Secure Transactions / sec" />
          <Counter value={99} label="System Reliability %" />
          <Counter value={24} label="Customer Support Hours" />
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative grid md:grid-cols-3 gap-12
bg-gradient-to-br
from-white via-[#f8fffd] to-[#eefaf5]
dark:from-[#00070662] dark:via-[#052c0181] dark:to-[#2e30157c]
rounded-3xl shadow-xl p-12
border border-[#1D4E48]/10 dark:border-gray-700"
        >
          <Counter value={50} label="Secure Transactions / sec" />
          <Counter value={99} label="System Reliability %" />
          <Counter value={24} label="Customer Support Hours" />
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#1D4E48] via-[#2f7c72] to-[#BDDD7E] dark:from-[#BDDD7E] dark:via-[#9FE870] dark:to-white bg-clip-text text-transparent"
        >
          <T>Why Professionals Choose NovaPay</T>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: "Enterprise Security",
              desc: "Multi-layer authentication and fraud detection protect every transaction.",
            },
            {
              title: "High Performance",
              desc: "Optimized architecture ensures fast, scalable experiences.",
            },
            {
              title: "AI Financial Tools",
              desc: "Smart analytics help users make informed financial decisions.",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-[#1D4E48] to-[#BDDD7E] transition duration-500" />

              <h3 className="text-xl font-semibold text-[#1D4E48] dark:text-[#BDDD7E] mb-4 relative">
                <T>{feature.title}</T>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative">
                <T>{feature.desc}</T>
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TECHNOLOGY ================= */}
      <section className="relative bg-gradient-to-br bg-[#1D4E48] dark:bg-gray-950  text-white py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl dark:text-[#BDDD7E] font-bold">
              <T>Built with Modern Technology</T>
            </h2>
            <p className="text-white/90 leading-relaxed max-w-xl">
              <T>NovaPay is engineered with TypeScript and Next.js to deliver
              reliability, performance, and scalability for future-ready digital
              finance platforms.</T>
            </p>
          </div>

          
          <div className="grid grid-cols-2 gap-8">
            {["TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"].map(
              (tech) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={tech}
                  className="bg-white/10 hover:bg-[#bddd7e65]
                   dark:text-[#b0bb9a] dark:hover:bg-gray-800
                   transition-all duration-300 
                   border border-white/20 
                   p-8 rounded-2xl text-center font-semibold backdrop-blur-xl"
                >
                  {tech}
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
