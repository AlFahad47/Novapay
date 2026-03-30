import type { Variants } from "framer-motion";
import type { MotionConfig } from "./types";

const EASE: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

export const DEFAULT_MOTION: MotionConfig = {
  duration: 0.75,
  stagger: 0.16,
};

export const createHowItWorksVariants = (
  shouldReduceMotion: boolean,
  motionConfig: MotionConfig = DEFAULT_MOTION,
): {
  hero: Variants;
  grid: Variants;
  item: Variants;
  cta: Variants;
} => {
  const reducedY = shouldReduceMotion ? 0 : 50;
  const reducedScale = shouldReduceMotion ? 1 : 0.97;

  return {
    hero: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 34 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionConfig.duration,
          ease: EASE,
        },
      },
    },
    grid: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: motionConfig.stagger,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: reducedY },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionConfig.duration,
          ease: EASE,
        },
      },
    },
    cta: {
      hidden: { opacity: 0, y: reducedY, scale: reducedScale },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: motionConfig.duration,
          ease: EASE,
        },
      },
    },
  };
};
