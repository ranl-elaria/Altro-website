import { motion } from 'motion/react';

const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30 }) {
  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : x, y: prefersReducedMotion ? 0 : y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
    >
      {children}
    </motion.div>
  );
}
