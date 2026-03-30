import { motion, type Variants } from "framer-motion";
import type { StepItem } from "./types";
import { truncate } from "./utils";
import T from "@/components/T";

interface StepCardProps {
  step: StepItem;
  index: number;
  itemVariants: Variants;
  accentGradient: string;
  shouldReduceMotion: boolean;
}

export function StepCard({
  step,
  index,
  itemVariants,
  accentGradient,
  shouldReduceMotion,
}: StepCardProps) {
  const isOffset = index % 2 !== 0;
  const displayIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.li
      variants={itemVariants}
      tabIndex={0}
      role="article"
      aria-label={`Step ${index + 1}: ${step.title}`}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      className={`group relative z-10 flex w-full flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E50FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC] dark:focus-visible:ring-offset-[#050B14] sm:rounded-3xl ${
        isOffset ? "md:mt-24 lg:mt-32" : ""
      }`}
    >
      <div className="relative rounded-2xl bg-linear-to-br from-slate-200 to-slate-100 p-px shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)] transition-shadow duration-500 group-hover:from-[#4DA1FF] group-hover:to-[#1E50FF] group-hover:shadow-[0_24px_48px_-20px_rgba(30,80,255,0.38)] dark:from-white/15 dark:to-white/5 dark:group-hover:from-[#4DA1FF] dark:group-hover:to-[#1E50FF] sm:rounded-3xl">
        <div className="relative h-full w-full rounded-[calc(1rem-1px)] bg-white/85 p-6 backdrop-blur-xl transition-colors duration-500 dark:bg-[#0B1221]/88 sm:rounded-[calc(1.5rem-1px)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 rounded-[calc(1rem-1px)] bg-linear-to-br from-[#4DA1FF]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-[#4DA1FF]/15 sm:rounded-[calc(1.5rem-1px)]" />

          <div className="relative mb-4 inline-flex items-baseline">
            <span
              className={`bg-linear-to-br ${accentGradient} bg-clip-text text-3xl font-black leading-none text-transparent sm:text-4xl`}
            >
              {displayIndex}
            </span>
            <span className="ml-1 text-2xl font-bold leading-none text-slate-300 dark:text-slate-700">
              .
            </span>
          </div>

          <h3 className="relative mb-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            <T>{step.title}</T>
          </h3>

          <p className="relative text-[15px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            <T>{truncate(step.desc, 140)}</T>
          </p>
        </div>
      </div>
    </motion.li>
  );
}
