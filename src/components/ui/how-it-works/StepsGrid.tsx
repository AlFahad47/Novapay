import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import { useRef } from "react";
import { StepCard } from "./StepCard";
import { TimelineLine } from "./TimelineLine";
import type { StepItem } from "./types";

interface StepsGridProps {
  steps: StepItem[];
  gridVariants: Variants;
  itemVariants: Variants;
  accentGradient: string;
  shouldReduceMotion: boolean;
}

export function StepsGrid({
  steps,
  gridVariants,
  itemVariants,
  accentGradient,
  shouldReduceMotion,
}: StepsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 75%", "end 30%"],
  });

  // Match a smooth progress component feel while scrolling.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 40,
    bounce: 0,
  });

  return (
    <div ref={gridRef} className="relative mx-auto mt-16 max-w-5xl md:mt-24">
      <TimelineLine progress={smoothProgress} />

      <motion.ul
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
      >
        {steps.map((step, index) => (
          <StepCard
            key={`${step.title}-${index}`}
            step={step}
            index={index}
            itemVariants={itemVariants}
            accentGradient={accentGradient}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </motion.ul>
    </div>
  );
}
