import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Droplet, Heart } from 'lucide-react';

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.05 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
        }
      }}
      whileHover={reduced ? undefined : { y: -2, transition: { duration: 0.16 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const BloodDropLoader: React.FC<{ label?: string }> = ({ label = 'লোড হচ্ছে...' }) => {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3" role="status" aria-live="polite">
      <motion.div
        animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-2xl bg-[#FCE4E8] border border-[#F0445E]/30 flex items-center justify-center text-[#B5122A]"
      >
        <Droplet className="w-6 h-6 fill-[#B5122A]" />
      </motion.div>
      <p className="text-sm font-medium text-[#75686C]">{label}</p>
    </div>
  );
};

export const HeartbeatEmblem: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      animate={reduced ? undefined : { scale: [1, 1.08, 1, 1.05, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <Heart className="w-5 h-5 fill-current" />
    </motion.div>
  );
};

export const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const duration = 550;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  return <span className="tabular-nums">{display.toLocaleString('bn-BD')}</span>;
};
