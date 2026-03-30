"use client";
import Link from "next/link";
import { HiChevronDown } from "react-icons/hi2";
import { motion, Variants } from "framer-motion";
import T from "@/components/T";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is NovaPay?",
      answer: "NovaPay is a smart digital wallet that allows you to easily store money, send/receive funds, automate your savings, split bills with friends, and track your expenses using AI.",
    },
    {
      question: "How does the Split-Bill Calculator work?",
      answer: "When dining out or sharing expenses, simply enter the total amount and select the contacts you're splitting it with. NovaPay calculates everyone's exact share and instantly sends them a payment request.",
    },
    {
      question: "How does Smart Fraud Checking keep me safe?",
      answer: "We use advanced AI to monitor your account 24/7. If our system detects an unusual login location or an uncharacteristic transaction pattern, it will temporarily pause the transaction and alert you immediately.",
    },
    {
      question: "What is KYC and why do I need it?",
      answer: "KYC (Know Your Customer) is a standard identity verification process. We require you to upload a valid ID to ensure the safety of our platform and to unlock higher daily transaction limits for your account.",
    },
    {
      question: "How does the AI-Powered Expense Analytics work?",
      answer: "NovaPay automatically categorizes your transactions (e.g., Groceries, Transport, Entertainment). Our AI then analyzes these patterns to give you insights into your spending habits and helps you stay within your budget.",
    },
    {
      question: "Are there any fees for sending money?",
      answer: "Sending money to other NovaPay users is completely free. Small standard fees may apply when transferring money back to your traditional bank account or during mobile recharges.",
    }
  ];

  // Animation variants - NOW TYPED AS VARIANTS
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // NOW TYPED AS VARIANTS
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0A0E17] py-16 px-4 transition-colors duration-300 overflow-hidden">
      
      {/* Background Grid & Glow (Matches Homepage) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            <T>Frequently Asked Questions</T>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            <T>Everything you need to know about the NovaPay digital wallet. Can't find the answer you're looking for?</T>{" "}
            <Link href="/support" className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              <T>Chat to our friendly team.</T>
            </Link>
          </p>
        </motion.div>

        {/* FAQ Accordion List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.details
              variants={itemVariants}
              key={index}
              className="group rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white/80 dark:bg-[#121928]/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 dark:text-white">
                <h2 className="text-lg font-semibold">
                  <T>{faq.question}</T>
                </h2>

                <span className="relative size-6 shrink-0 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition duration-300 group-open:-rotate-180">
                  <HiChevronDown className="size-4 text-blue-600 dark:text-blue-400 stroke-3" />
                </span>
              </summary>

              <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400 border-l-4 border-blue-500 dark:border-blue-400 pl-4">
                <T>{faq.answer}</T>
              </p>
            </motion.details>
          ))}
        </motion.div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center bg-gray-50/80 dark:bg-[#121928]/80 backdrop-blur-md border border-gray-200 dark:border-gray-800/60 rounded-2xl p-8 shadow-sm transition-colors"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><T>Still have questions?</T></h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6"><T>Our customer support is available 24/7 to assist you.</T></p>
          <Link
            href="/support"
            className="inline-block rounded-full bg-blue-600 dark:bg-blue-500 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-md hover:shadow-blue-500/25"
          >
            <T>Open Live Chat</T>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}