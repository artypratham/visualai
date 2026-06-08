"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin gradient bar that tracks scroll through the lesson. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
    >
      <div
        className="h-full w-full"
        style={{ background: "linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c))" }}
      />
    </motion.div>
  );
}
