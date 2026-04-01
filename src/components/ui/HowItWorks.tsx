"use client";

import { useReducedMotion } from "framer-motion";
import { Hero } from "./how-it-works/Hero";
import {
  createHowItWorksVariants,
  DEFAULT_MOTION,
} from "./how-it-works/motion";
import { StepsGrid } from "./how-it-works/StepsGrid";
import type { HowItWorksSectionProps } from "./how-it-works/types";
import { defaultSteps } from "./how-it-works/utils";

export type { HowItWorksSectionProps, StepItem } from "./how-it-works/types";

export function HowItWorksSection({
  steps = defaultSteps,
  accentGradient = "from-[#4DA1FF] to-[#1E50FF]",
  motionConfig = DEFAULT_MOTION,
}: HowItWorksSectionProps) {
  const reducedMotionPreference = useReducedMotion();
  const shouldReduceMotion = Boolean(reducedMotionPreference);
  const variants = createHowItWorksVariants(shouldReduceMotion, motionConfig);
  const hasSteps = steps.length > 0;

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="home-section py-20 sm:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="hiw-blob hiw-blob-left absolute -left-[12%] -top-[16%] h-105 w-105 rounded-full bg-[#4DA1FF]/15 blur-[110px] dark:bg-[#1E50FF]/25" />
        <div className="hiw-blob hiw-blob-right absolute -bottom-[18%] -right-[12%] h-105 w-105 rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/20" />
      </div>

      <div className="home-container">
        <Hero accentGradient={accentGradient} variants={variants.hero} />

        {hasSteps ? (
          <>
            <StepsGrid
              steps={steps}
              gridVariants={variants.grid}
              itemVariants={variants.item}
              accentGradient={accentGradient}
              shouldReduceMotion={shouldReduceMotion}
            />
          </>
        ) : (
          <div className="mt-20 md:mt-28" aria-hidden="true" />
        )}
      </div>

      <style jsx>{`
        .hiw-blob {
          animation: hiwFloat 11s ease-in-out infinite;
          transform: translate3d(0, 0, 0);
        }

        .hiw-blob-right {
          animation-delay: -2.75s;
          animation-duration: 13s;
        }

        @keyframes hiwFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -12px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hiw-blob {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

export default HowItWorksSection;
