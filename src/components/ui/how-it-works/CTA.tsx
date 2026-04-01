import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  accentGradient: string;
  variants: Variants;
  hasSteps: boolean;
}

export function CTA({ accentGradient, variants, hasSteps }: CTAProps) {
  return (
    <motion.section
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className={`relative z-20 mx-auto max-w-4xl text-center ${
        hasSteps ? "mt-20 md:mt-32" : "mt-24 md:mt-36"
      }`}
      aria-label="Get started call to action"
    >
      <div className="group relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#4DA1FF] via-[#1E50FF] to-[#0A30A3] p-px shadow-[0_20px_54px_-20px_rgba(30,80,255,0.52)] transition-transform duration-500 hover:-translate-y-1 sm:rounded-[2.5rem]">
        <div className="relative rounded-[calc(2rem-1px)] bg-white/95 px-6 py-12 backdrop-blur-2xl transition-colors duration-500 dark:bg-[#050B14]/95 sm:rounded-[calc(2.5rem-1px)] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#4DA1FF]/12 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <h2 className="relative mb-6 text-balance text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            Ready to experience the future of digital finance?
          </h2>

          <Link
            href="/register"
            aria-label="Create your free NovaPay account"
            className={`relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent bg-linear-to-b ${accentGradient} px-8 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_14px_28px_-14px_rgba(30,80,255,0.85)] outline-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_34px_-12px_rgba(30,80,255,0.95)] focus-visible:ring-2 focus-visible:ring-[#1E50FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#050B14] active:scale-[0.99]`}
          >
            <span className="text-[16px] font-bold tracking-wide text-white drop-shadow-sm">
              Get Started for Free
            </span>
            <ArrowRight size={18} strokeWidth={2.5} className="text-white" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
