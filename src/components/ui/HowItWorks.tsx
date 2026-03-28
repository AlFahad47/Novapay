// Designed by :- JARIF -:
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import T from "@/components/T";

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    className="group relative
    rounded-xl md:rounded-2xl lg:rounded-3xl
    p-[1px]
    bg-gradient-to-br from-[#0061ff] via-[#00b4ff] to-[#0061ff]
    hover:scale-[1.02] transition-all duration-500"
  >
    <div
      className="relative
      rounded-xl md:rounded-2xl lg:rounded-3xl
      bg-white/80 dark:bg-[#04090f]/85
      backdrop-blur-xl
      border border-blue-500/30 dark:border-blue-400/30
      shadow-md md:shadow-lg lg:shadow-2xl
      group-hover:shadow-blue-400/40
      transition-all duration-500"
    >
      <div
        className="absolute inset-0
        rounded-xl md:rounded-2xl lg:rounded-3xl
        opacity-0 group-hover:opacity-100
        bg-gradient-to-br from-[#0061ff]/20 to-[#00b4ff]/20
        blur-xl transition duration-500"
      />

      <div className="relative">{children}</div>
    </div>
  </div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-3 md:p-4 lg:p-6 space-y-1.5 md:space-y-2 lg:space-y-3">
    {children}
  </div>
);

const Button = ({ children }: { children: React.ReactNode }) => (
  <button className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#0061ff] to-[#00b4ff] hover:scale-105 hover:shadow-xl hover:shadow-[#0061ff]/30 text-white text-sm md:text-base font-semibold transition-all duration-300 inline-flex items-center gap-2">
    {children}
  </button>
);

const steps = [
  {
    title: "Create Your Account",
    desc: "Register securely with email verification and complete your KYC process in just a few steps.",
  },
  {
    title: "Add Funds Securely",
    desc: "Deposit money into your wallet and monitor your balance in real-time with encrypted protection.",
  },
  {
    title: "Send & Receive Instantly",
    desc: "Transfer funds instantly with smart transaction logging and secure authentication layers.",
  },
  {
    title: "Track & Grow",
    desc: "Analyze transactions, monitor activity insights, and manage your financial growth efficiently.",
  },
];

export default function HowItWorksPage() {
  return (
    <div
      className="relative overflow-hidden min-h-[80vh]
      bg-gradient-to-br
      from-[#f0f7ff] via-white to-[#e8f4ff]
      dark:from-[#040c1a] dark:via-[#04090f] dark:to-[#040c1a]
      transition-colors duration-500
      px-4 md:px-6 py-12 md:py-16"
    >
      {/* Background Blobs */}
      <div className="absolute -top-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-blue-500/20 dark:bg-blue-700/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-60 md:w-80 h-60 md:h-80 bg-blue-300/20 dark:bg-[#00b4ff]/20 rounded-full blur-3xl animate-pulse" />

      <div className="w-11/12 mx-auto">
      {/* Hero */}
      <section className="relative text-center space-y-4 md:space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="
            text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white
          "
        >
          <T>How NovaPay</T><span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent"> <T>Works</T></span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
        >
          <T>Experience a next-generation digital wallet built with security,
          performance, and modern architecture at its core.</T>
        </motion.p>
      </section>

      {/* Timeline */}
      <div className="hidden md:block absolute left-1/2 top-64 bottom-24 w-1 bg-gradient-to-b from-[#00b4ff] to-[#0061ff] opacity-30" />

      {/* Steps */}
      <section className="relative mt-8 md:mt-10 grid sm:grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-5">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.25, duration: 0.9 }}
            className={`${index % 2 !== 0 ? "md:mt-12 lg:mt-16" : ""}`}
          >
            <Card>
              <CardContent>
                <div
                  className="
                    text-xl md:text-2xl lg:text-4xl
                    font-extrabold
                    bg-gradient-to-r
                    from-[#0061ff] to-[#00d4ff]
                    dark:from-[#93C5FD] dark:to-[#0061ff]
                    bg-clip-text text-transparent"
                >
                  0{index + 1}
                </div>

                <h3 className="text-base md:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                  <T>{step.title}</T>
                </h3>

                <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  <T>{step.desc}</T>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="relative mt-14 md:mt-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="group relative rounded-2xl md:rounded-3xl p-[1px]
          bg-gradient-to-br from-[#0061ff] via-[#00b4ff] to-[#0061ff]
          shadow-xl md:shadow-2xl hover:scale-[1.02] transition-all duration-500"
        >
          <div
            className="relative rounded-2xl md:rounded-3xl
            p-6 md:p-10
            bg-white/80 dark:bg-[#04090f]/85
            backdrop-blur-2xl
            border border-blue-500/30 dark:border-blue-400/30
            overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-br from-[#0061ff]/20 to-[#00b4ff]/20
              blur-xl transition duration-500"
            />

            <h2 className="relative text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-5 md:mb-6">
              <T>Ready to Experience the Future of Digital Finance?</T>
            </h2>

            <Link href="/login" className="relative">
              <Button>
                <T>Get Started</T> <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
