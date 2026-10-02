'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVisibility } from '@/lib/useVisibility';
import { useSitedata } from '@/lib/useSitedata';
import { getLabels, DEFAULT_LABELS, SITEDATA_KEYS } from '@/lib/sitedata';
import Marca from '@/components/raposa/Marca';
import Icone from '@/components/raposa/Icone';
import Figura from '@/components/raposa/Figura';

/**
 * Menu da Raposa: papel claro, a marca à esquerda, os lugares da floresta
 * no meio e, à direita, a lupa (busca) e o botão das Cartas. No celular
 * abre uma folha na noite da mata, com a raposa espiando no pé.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname() || '/';
  const { visibility: v } = useVisibility();
  const labels = useSitedata(getLabels, DEFAULT_LABELS, SITEDATA_KEYS.labels);
  const nl = labels?.nav || DEFAULT_LABELS.nav;

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  const links = [
    { href: '/blog', label: nl.blog || 'Ensaios', key: 'blog', icone: 'pincel' },
    { href: '/trilhas', label: nl.estudos || 'Trilhas', key: 'estudos', icone: 'torii' },
    { href: '/servicos', label: nl.servicos || 'Pesquisa', key: 'servicos', icone: 'lupa' },
    { href: '/loja', label: nl.loja || 'Loja', key: 'loja', icone: 'sacola' },
    { href: '/sobre', label: nl.about || 'Sobre', key: null, icone: 'raposa' },
  ].filter((l) => !l.key || v[l.key] !== false);

  const ativo = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const abrirBusca = () => window.dispatchEvent(new CustomEvent('raposa:busca'));

  return (
    <>
      <nav
        data-nav="main"
        className={`fixed top-0 inset-x-0 z-[500] transition-[background,box-shadow,border-color] duration-300 border-b ${
          scrolled
            ? 'bg-bg/[0.96] border-linha shadow-[0_8px_24px_-18px_rgb(19_33_31/0.5)] md:backdrop-blur-md md:bg-bg/[0.88]'
            : 'bg-bg border-transparent'
        }`}
      >
        <div className="max-w-[1240px] mx-auto h-[var(--nav-h)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Raposa Analítica · início" className="shrink-0 hover:opacity-90 transition-opacity">
            <Marca tamanho={40} />
          </Link>

          <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
            {links.map((l) => {
              const a = ativo(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={a ? 'page' : undefined}
                    className={`relative inline-flex items-center px-3 py-2 rounded-full font-sans text-[15px] font-medium tracking-[0.01em] transition-colors ${
                      a ? 'text-text-bright' : 'text-text-dim hover:text-text-bright hover:bg-bg-warm'
                    }`}
                  >
                    {l.label}
                    {a && (
                      <motion.span
                        layoutId="nav-ativo"
                        className="absolute left-3 right-3 -bottom-[2px] h-[3px] rounded-full bg-torii"
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={abrirBusca}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-full text-text-dim hover:text-text-bright hover:bg-bg-warm transition-colors"
              aria-label="Buscar no site (Ctrl+K)"
              title="Buscar (Ctrl+K)"
            >
              <Icone nome="busca" size={19} />
              <kbd className="hidden xl:inline font-sans text-[11px] font-semibold tracking-[0.08em] text-text-faint">Ctrl K</kbd>
            </button>
            {v.newsletter !== false && (
              <Link
                href="/blog/#cartas"
                className="hidden sm:inline-flex items-center gap-2 h-10 pl-3.5 pr-4 rounded-full bg-mata text-[var(--washi)] font-sans text-[14px] font-semibold hover:bg-[var(--cedro)] transition-colors"
              >
                <Icone nome="carta" size={17} />
                {nl.newsletter || 'Cartas'}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAberto(true)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-text-bright hover:bg-bg-warm"
              aria-label="Abrir o menu"
              aria-expanded={aberto}
            >
              <Icone nome="menu" size={22} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {aberto && (
          <motion.div
            key="folha"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="noite fixed inset-0 z-[600] lg:hidden flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between h-[var(--nav-h)] px-4 sm:px-6 border-b border-linha">
              <Marca tamanho={40} />
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-text-bright hover:bg-bg-card"
                aria-label="Fechar o menu"
              >
                <Icone nome="fechar" size={22} />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-5 pt-6 pb-40 space-y-1">
              {[{ href: '/', label: nl.home || 'Início', icone: 'caminho' }, ...links].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i + 0.05 }}
                >
                  <Link
                    href={l.href}
                    className={`flex items-center gap-4 py-3 font-serif text-[1.9rem] leading-tight ${
                      ativo(l.href) && (l.href !== '/' || pathname === '/') ? 'text-[var(--ginkgo)]' : 'text-text-bright'
                    }`}
                    style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-card text-accent shrink-0">
                      <Icone nome={l.icone} size={20} />
                    </span>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              {v.newsletter !== false && (
                <li className="pt-4">
                  <Link href="/blog/#cartas" className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-[var(--ginkgo)] text-[var(--tinta)] font-sans font-semibold">
                    <Icone nome="carta" size={18} /> Receber as {nl.newsletter || 'Cartas'}
                  </Link>
                </li>
              )}
            </ul>
            <Figura
              nome="fig/raposa-olhando-lua"
              alt=""
              className="pointer-events-none absolute -bottom-2 right-2 w-[46vw] max-w-[260px] opacity-95 [mask-image:linear-gradient(90deg,transparent,#000_13%,#000_86%,transparent)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
