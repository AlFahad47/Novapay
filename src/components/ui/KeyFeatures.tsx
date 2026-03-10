"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Wallet, BarChart3, Globe, Lock } from "lucide-react";

const features = [
  {
    title: "Secure Transactions",
    desc: "Advanced encryption and multi-layer authentication keep every transaction safe and protected.",
    icon: ShieldCheck,
  },
  {
    title: "Instant Transfers",
    desc: "Send and receive money in real time with lightning-fast performance.",
    icon: Zap,
  },
  {
    title: "Smart Wallet",
    desc: "Manage balances, track spending, and organize finances in one place.",
    icon: Wallet,
  },
  {
    title: "Analytics Dashboard",
    desc: "Visual insights help you understand and optimize your financial activity.",
    icon: BarChart3,
  },
  {
    title: "Global Access",
    desc: "Access your wallet anywhere in the world with seamless connectivity.",
    icon: Globe,
  },
  {
    title: "Privacy First",
    desc: "Your data stays private with industry-standard protection protocols.",
    icon: Lock,
  },
];

export default function KeyFeatures() {
  return (
    <div
      className="relative overflow-hidden min-h-screen
      bg-gradient-to-br
      from-[#f0f7ff] via-white to-[#e8f4ff]
      dark:from-[#040c1a] dark:via-[#04090f] dark:to-[#040c1a]
      transition-colors duration-500 px-6 py-18"
    >
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 dark:bg-blue-700/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 dark:bg-[#00b4ff]/20 rounded-full blur-3xl animate-pulse" />

      <div className="w-11/12 mx-auto">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative text-center mb-16"
      >
        <h1
          className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white"
        >
          Key <span className="bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] bg-clip-text text-transparent">Features</span> 
        </h1>

        <p className="mt-6 text-sm  text-gray-600 dark:text-gray-300">
          Explore powerful features designed to deliver speed, security, and a
          modern financial experience.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div
        className="relative
        grid gap-3 md:gap-4 lg:gap-6
        sm:grid-cols-2 lg:grid-cols-3
        items-stretch"
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group h-full"
            >
              {/* Gradient Border */}
              <div
                className="
                h-full
                rounded-lg md:rounded-xl lg:rounded-2xl
                p-[1px]
                bg-gradient-to-br
                from-[#0061ff]
                via-[#00b4ff]
                to-[#0061ff]
                transition-all duration-500
                hover:scale-[1.02]
              "
              >
                {/* Card Body */}
                <div
                  className="
                  h-full
                  flex flex-col justify-between
                  rounded-lg md:rounded-xl lg:rounded-2xl
                  bg-white/95 dark:bg-[#04090f]/85
                  backdrop-blur-xl
                  border border-blue-500/20 dark:border-blue-400/25
                  shadow-sm md:shadow-md lg:shadow-lg
                  transition-all duration-500
                  overflow-hidden
                "
                >
                  <div className="p-3 md:p-4 lg:p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="
                      w-7 h-7 md:w-8 md:h-8 lg:w-12 lg:h-12
                      flex items-center justify-center
                      rounded-md md:rounded-lg lg:rounded-xl
                      bg-gradient-to-r
                      from-[#0061ff]
                      to-[#00b4ff]
                      text-white
                      mb-2 md:mb-3 lg:mb-4
                      shadow-sm
                      group-hover:scale-105
                      transition-transform duration-300
                    "
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-6 lg:h-6" />
                    </div>

                    {/* Title */}
                    <h3
                      className="
                      text-xs md:text-sm lg:text-lg
                      font-semibold
                      text-gray-900 dark:text-white
                      mb-1 md:mb-2
                    "
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="
                      text-[11px] md:text-xs lg:text-sm
                      text-gray-600 dark:text-gray-400
                      leading-relaxed
                      flex-grow
                    "
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
