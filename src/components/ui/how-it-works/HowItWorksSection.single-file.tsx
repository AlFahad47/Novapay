"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface HowItWorksSingleStep {
  title: string;
  desc: string;
}

interface HowItWorksSingleFileProps {
  steps: HowItWorksSingleStep[];
  accentGradient?: string;
  motionConfig?: { duration: number; stagger: number };
}

const truncate = (text: string, max = 140) => {
  const normalized = text.trim();
  return normalized.length > max
    ? `${normalized.slice(0, max).trimEnd()}...`
    : normalized;
};

export default function HowItWorksSectionSingleFile({
  steps,
  accentGradient = "from-[#4DA1FF] to-[#1E50FF]",
  motionConfig = { duration: 0.75, stagger: 0.16 },
}: HowItWorksSingleFileProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const variants: {
    hero: Variants;
    grid: Variants;
    item: Variants;
  } = {
    hero: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 34 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionConfig.duration,
          ease: [0.2, 0.9, 0.2, 1],
        },
      },
    },
    grid: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: motionConfig.stagger },
      },
    },
    item: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionConfig.duration,
          ease: [0.2, 0.9, 0.2, 1],
        },
      },
    },
  };

  const hasSteps = steps.length > 0;

  return (
    <section
      aria-labelledby="how-it-works-heading-single"
      className="relative w-full overflow-hidden border-y border-slate-200 bg-[#F8FAFC] py-20 transition-colors duration-700 dark:border-white/10 dark:bg-[#050B14] sm:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="single-blob absolute -left-[12%] -top-[16%] h-105 w-105 rounded-full bg-[#4DA1FF]/15 blur-[110px] dark:bg-[#1E50FF]/25" />
        <div className="single-blob single-blob-b absolute -bottom-[18%] -right-[12%] h-105 w-105 rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <header className="relative z-10 mx-auto max-w-3xl space-y-5 text-center">
          <motion.h1
            id="how-it-works-heading-single"
            variants={variants.hero}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-balance text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl"
          >
            How NovaPay{" "}
            <span
              className={`bg-linear-to-r ${accentGradient} bg-clip-text text-transparent`}
            >
              Works
            </span>
          </motion.h1>

          <motion.p
            variants={variants.hero}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="mx-auto max-w-2xl text-pretty text-[16px] font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[17px]"
          >
            Experience a next-generation digital wallet built with security,
            performance, and modern architecture at its core.
          </motion.p>
        </header>

        {hasSteps ? (
          <div className="relative mx-auto mt-16 max-w-5xl md:mt-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-12 left-1/2 top-12 hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-[#4DA1FF]/35 to-transparent md:block"
            />

            <motion.ul
              variants={variants.grid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
            >
              {steps.map((step, index) => (
                <motion.li
                  key={`${step.title}-${index}`}
                  variants={variants.item}
                  tabIndex={0}
                  role="article"
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  className={`group relative z-10 flex w-full flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E50FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC] dark:focus-visible:ring-offset-[#050B14] sm:rounded-3xl ${
                    index % 2 !== 0 ? "md:mt-24 lg:mt-32" : ""
                  }`}
                >
                  <div className="relative rounded-2xl bg-linear-to-br from-slate-200 to-slate-100 p-px shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)] transition-shadow duration-500 group-hover:from-[#4DA1FF] group-hover:to-[#1E50FF] group-hover:shadow-[0_24px_48px_-20px_rgba(30,80,255,0.38)] dark:from-white/15 dark:to-white/5 dark:group-hover:from-[#4DA1FF] dark:group-hover:to-[#1E50FF] sm:rounded-3xl">
                    <div className="relative h-full w-full rounded-[calc(1rem-1px)] bg-white/85 p-6 backdrop-blur-xl transition-colors duration-500 dark:bg-[#0B1221]/88 sm:rounded-[calc(1.5rem-1px)] sm:p-8">
                      <div className="pointer-events-none absolute inset-0 rounded-[calc(1rem-1px)] bg-linear-to-br from-[#4DA1FF]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-[#4DA1FF]/15 sm:rounded-[calc(1.5rem-1px)]" />

                      <div className="relative mb-4 inline-flex items-baseline">
                        <span
                          className={`bg-linear-to-br ${accentGradient} bg-clip-text text-3xl font-black leading-none text-transparent sm:text-4xl`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="ml-1 text-2xl font-bold leading-none text-slate-300 dark:text-slate-700">
                          .
                        </span>
                      </div>

                      <h3 className="relative mb-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {step.title}
                      </h3>

                      <p className="relative text-[15px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                        {truncate(step.desc, 140)}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ) : (
          <div className="mt-16 md:mt-20" aria-hidden="true" />
        )}

        <div
          aria-hidden="true"
          className={`mx-auto h-px w-40 bg-linear-to-r from-transparent via-[#4DA1FF]/40 to-transparent ${
            hasSteps ? "mt-16 md:mt-24" : "mt-20 md:mt-28"
          }`}
        />
      </div>

      <style jsx>{`
        .single-blob {
          animation: singleFloat 11s ease-in-out infinite;
          transform: translate3d(0, 0, 0);
        }

        .single-blob-b {
          animation-delay: -2.75s;
          animation-duration: 13s;
        }

        @keyframes singleFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -12px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .single-blob {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
