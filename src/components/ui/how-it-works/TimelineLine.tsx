import { motion, type MotionValue } from "framer-motion";

interface TimelineLineProps {
  progress: MotionValue<number>;
}

export function TimelineLine({ progress }: TimelineLineProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-12 left-1/2 top-12 hidden w-px -translate-x-1/2 overflow-hidden rounded-full bg-slate-300/45 dark:bg-white/10 md:block"
    >
      <motion.div
        className="h-full w-full origin-top bg-linear-to-b from-[#4DA1FF]/75 via-[#1E50FF]/95 to-[#1E50FF]/65"
        style={{ scaleY: progress }}
      />
    </div>
  );
}
