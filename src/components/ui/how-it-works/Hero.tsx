import { motion, type Variants } from "framer-motion";
import T from "@/components/T";

interface HeroProps {
  accentGradient: string;
  variants: Variants;
}

export function Hero({ accentGradient, variants }: HeroProps) {
  return (
    <header className="relative z-10 mx-auto max-w-3xl space-y-5 text-center">
      <motion.h1
        id="how-it-works-heading"
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="home-heading text-balance text-3xl font-black"
      >
        <T>How NovaPay</T>{" "}
        <span className={`home-gradient-text bg-linear-to-r ${accentGradient}`}>
          <T>Works</T>
        </span>
      </motion.h1>

      <motion.p
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="home-body mx-auto max-w-2xl text-pretty text-[16px] sm:text-[17px]"
      >
        <T>Experience a next-generation digital wallet built with security, performance, and modern architecture at its core.</T>
      </motion.p>
    </header>
  );
}
