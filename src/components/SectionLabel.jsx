'use client';

import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/constants';

export default function SectionLabel({ label }) {
  return (
    <motion.p
      variants={fadeUp}
      className="font-sans text-[12.5px] font-semibold text-accent tracking-[0.12em] uppercase mb-4 flex items-center gap-4"
    >
      <span className="block w-5 h-px bg-accent opacity-40" />
      {label}
    </motion.p>
  );
}
