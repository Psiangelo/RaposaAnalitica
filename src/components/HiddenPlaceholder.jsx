'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

/**
 * HiddenPlaceholder — renderizado quando o módulo/página está
 * oculto pelo admin via Visibility. Mostra uma página mínima
 * com link pra home.
 */
export default function HiddenPlaceholder({ title = 'Indisponível no momento' }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <span className="block w-10 h-px bg-accent/40 mx-auto mb-6" />
          <h1 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] text-text-bright leading-tight mb-3">
            {title}
          </h1>
          <p className="text-[0.92rem] text-text-dim leading-[1.75] mb-8">
            Esta seção não está disponível no momento. Volte para a página inicial
            ou explore outras áreas do site.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-7 py-3.5 font-sans text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-bg bg-accent hover:bg-text-bright transition-colors"
          >
            Voltar à home
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <span className="block w-10 h-px bg-accent/40 mx-auto mt-10" />
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
