'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisibilityGate from '@/components/VisibilityGate';
import BlockRenderer from '@/components/estudos/BlockRenderer';
import SubstageBlock from '@/components/estudos/SubstageBlock';
import EtapaHero from '@/components/estudos/EtapaHero';
import StageIntro from '@/components/estudos/StageIntro';
import EtapaFooterNav from '@/components/estudos/EtapaFooterNav';
import TrilhaIcon, { IconSeal } from '@/components/estudos/icons';
import { useSitedata } from '@/lib/useSitedata';
import { useTrilhaProgress } from '@/lib/useTrilhaProgress';
import {
  getTrilhas, getMaterials, getGlossario, getAreas,
  SITEDATA_KEYS,
} from '@/lib/sitedata';
import { findArea, DEFAULT_AREAS } from '@/lib/areas';
import { defaultIconForKind } from '@/lib/trilhaIcons';
import { migrateTrilhaBlocks } from '@/lib/linkResolver';
import { resolveExtraAccent, isExtra } from '@/lib/extraTone';

const DEFAULT_ACCENT = '#2E5240';

function readJsonSafe(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
}

export default function EtapaClient({
  initialTrilha,
  initialEtapaIdx,
  initialPosts = [],
  initialCourses = [],
  initialMaterials,
  initialAreas,
}) {
  const allTrilhas = useSitedata(getTrilhas, [initialTrilha], SITEDATA_KEYS.trilhas);
  const materials  = useSitedata(getMaterials, initialMaterials || [], SITEDATA_KEYS.materials);
  const glossario  = useSitedata(getGlossario, [], SITEDATA_KEYS.glossario);
  const areas      = useSitedata(getAreas, initialAreas || DEFAULT_AREAS, SITEDATA_KEYS.areas);
  const [posts, setPosts] = useState(initialPosts);
  const [courses, setCourses] = useState(initialCourses);

  useEffect(() => {
    setPosts(readJsonSafe('raposa_admin_blog', initialPosts));
    setCourses(readJsonSafe('raposa_admin_courses', initialCourses));
  }, [initialPosts, initialCourses]);

  const trilha = useMemo(() => {
    const trilhaSlug = initialTrilha.slug || initialTrilha.id;
    const found = allTrilhas.find((t) => (t.slug || t.id) === trilhaSlug);
    return found ? migrateTrilhaBlocks(found) : initialTrilha;
  }, [allTrilhas, initialTrilha]);

  const stage = trilha.stages[initialEtapaIdx];
  const trilhaSlug = trilha.slug || trilha.id;
  const prev = initialEtapaIdx > 0 ? trilha.stages[initialEtapaIdx - 1] : null;
  const next = initialEtapaIdx < trilha.stages.length - 1 ? trilha.stages[initialEtapaIdx + 1] : null;
  const total = trilha.stages.length;
  const pct = Math.round(((initialEtapaIdx + 1) / total) * 100);

  // Accent dinâmico:
  //  - área define o accent base (ouro/terra)
  //  - se a trilha for extra OU a etapa for extra → vira roxo cerimonial
  //  - sub-etapas resolvem seu próprio accent dentro de SubstageBlock
  const area = findArea(areas, trilha.area);
  const areaAccent = area?.color || DEFAULT_ACCENT;
  const trilhaExtra = isExtra(trilha);
  const stageExtra = isExtra(stage);
  const accent = (trilhaExtra || stageExtra)
    ? resolveExtraAccent({ extra: true }, areaAccent)
    : areaAccent;

  // Tempo de leitura estimado
  const readingTime = useMemo(() => {
    if (!stage) return 0;
    let words = 0;
    words += (stage.summary || '').split(/\s+/).filter(Boolean).length;
    words += (stage.intro || '').split(/\s+/).filter(Boolean).length;
    for (const b of stage.blocks || []) {
      if (b.type === 'text' || b.type === 'quote') {
        words += String(b.body || '').split(/\s+/).filter(Boolean).length;
      }
    }
    return Math.max(1, Math.round(words / 220));
  }, [stage]);

  const { isStageDone, toggleStage, isSubstageDone, toggleSubstage, substageStats } = useTrilhaProgress();
  const done = isStageDone(trilha.id, stage?.title);
  const subStats = stage ? substageStats(trilha.id, stage) : { done: 0, total: 0 };

  const [tocOpen, setTocOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const router = useRouter();

  // Atalhos: ← → navega; T abre índice; M marca; ESC fecha
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft' && prev) {
        e.preventDefault();
        router.push(`/trilhas/${trilhaSlug}/${prev.slug}`);
      } else if (e.key === 'ArrowRight' && next) {
        e.preventDefault();
        router.push(`/trilhas/${trilhaSlug}/${next.slug}`);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTocOpen((v) => !v);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleStage(trilha.id, stage?.title);
      } else if (e.key === 'Escape' && tocOpen) {
        setTocOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, trilhaSlug, trilha.id, stage?.title, tocOpen, toggleStage, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!stage) return null;

  const lists = { materials, posts, courses, glossario };

  return (
    <VisibilityGate visibilityKey="estudos" title="Estudos indisponível">
      <Navbar />

      {/* Barra de progresso fixa no topo (cor da área) */}
      <div
        className="fixed top-[60px] left-0 right-0 z-[40] backdrop-blur-sm pointer-events-none"
        style={{
          background: 'rgb(var(--fundo-rgb)/0.7)',
          borderBottom: '1px solid rgb(var(--acento-rgb)/0.15)',
        }}
      >
        <div
          className="h-0.5 transition-all duration-500"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      <main className="pb-16">
        {/* Hero da etapa */}
        <EtapaHero
          stage={stage}
          trilha={trilha}
          area={area}
          idx={initialEtapaIdx}
          total={total}
          readingTime={readingTime}
          done={done}
          onToggle={() => toggleStage(trilha.id, stage.title)}
          accent={accent}
        />

        {/* Botão de índice da trilha + breadcrumb mobile */}
        <div className="max-w-[800px] mx-auto px-5 sm:px-6 md:px-12 mb-2 flex items-center justify-between gap-3">
          <Link
            href={`/trilhas/${trilhaSlug}`}
            className="inline-flex items-center gap-2 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-text-dim hover:text-text-bright transition-colors"
          >
            ← Voltar ao sumário
          </Link>
          <button
            onClick={() => setTocOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 border font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase rounded transition-colors"
            style={{
              borderColor: `${accent}33`,
              color: accent,
            }}
            aria-label="Abrir índice da trilha"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Índice
          </button>
        </div>

        {/* Intro markdown da etapa */}
        {stage.intro && <StageIntro content={stage.intro} accent={accent} />}

        {/* Indicador de progresso das sub-etapas (se houver) */}
        {subStats.total > 0 && (
          <div className="max-w-[800px] mx-auto px-5 sm:px-6 md:px-12 mb-4">
            <p
              className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase inline-flex items-center gap-2"
              style={{ color: accent }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: accent }} />
              {subStats.done} de {subStats.total} sub-etapas concluídas
            </p>
          </div>
        )}

        {/* Corpo: blocks (com counter de substages pra numeração romana) */}
        <article className="max-w-[800px] mx-auto px-5 sm:px-6 md:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {(() => {
              let substageIdx = 0;
              return (stage.blocks || []).map((block, i) => {
                if (block.type === 'substage') {
                  substageIdx += 1;
                  const subDone = isSubstageDone(trilha.id, stage.id, block.id);
                  const currentIdx = substageIdx;
                  return (
                    <motion.div
                      key={block.id || i}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.4 }}
                    >
                      <SubstageBlock
                        substage={block}
                        idx={currentIdx}
                        done={subDone}
                        onToggle={() => toggleSubstage(trilha.id, stage.id, block.id)}
                        accent={accent}
                        lists={lists}
                      />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                  >
                    <BlockRenderer block={block} lists={lists} accent={accent} />
                  </motion.div>
                );
              });
            })()}

            {(!stage.blocks || stage.blocks.length === 0) && !stage.intro && (
              <div className="my-8 p-6 border border-dashed border-border-subtle text-center rounded-sm">
                <p className="font-serif italic text-text-dim">Esta etapa ainda não tem conteúdo publicado.</p>
              </div>
            )}
          </motion.div>

          {/* Navegação anterior/próxima rica */}
          <EtapaFooterNav
            prev={prev}
            next={next}
            prevIdx={initialEtapaIdx - 1}
            nextIdx={initialEtapaIdx + 1}
            trilhaSlug={trilhaSlug}
            trilhaName={trilha.name}
            accent={accent}
          />
        </article>
      </main>

      {/* Botão voltar ao topo */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            className="fixed bottom-6 right-6 z-[50] w-11 h-11 rounded-full shadow-lg shadow-black/30 flex items-center justify-center transition-colors"
            style={{ background: accent, color: '#F2EBDC' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dica de atalhos no footer */}
      <div className="max-w-[800px] mx-auto px-5 sm:px-6 md:px-12 pb-4 -mt-8 text-center">
        <p className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgb(var(--texto-dim-rgb)/0.5)' }}>
          ← anterior · → próxima · T índice · M marcar concluída
        </p>
      </div>

      {/* Drawer índice enriquecido */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTocOpen(false)}
              className="fixed inset-0 bg-black/65 z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-[61] w-full sm:w-[400px] overflow-y-auto"
              style={{
                background: '#15110D',
                borderLeft: `1px solid ${accent}44`,
              }}
              aria-label="Índice da trilha"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <p
                    className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: accent }}
                  >
                    Trilha
                  </p>
                  <button
                    onClick={() => setTocOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-text-dim hover:[color:var(--toc-accent)] transition-colors"
                    style={{ '--toc-accent': accent }}
                    aria-label="Fechar índice"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                </div>

                {/* Cabeçalho da trilha no drawer */}
                <Link
                  href={`/trilhas/${trilhaSlug}`}
                  onClick={() => setTocOpen(false)}
                  className="flex items-center gap-3 mb-6 group"
                >
                  <IconSeal name={trilha.icon || 'compass'} size={48} color={accent} />
                  <div className="min-w-0 flex-1">
                    <h2
                      className="font-serif text-lg leading-tight text-text-bright group-hover:[color:var(--toc-accent)] transition-colors"
                      style={{ '--toc-accent': accent }}
                    >
                      {trilha.name}
                    </h2>
                    {trilha.subtitle && (
                      <p className="font-serif italic text-text-dim/80 text-xs leading-tight line-clamp-1 mt-1">
                        {trilha.subtitle}
                      </p>
                    )}
                  </div>
                </Link>

                <ol className="space-y-1" role="list">
                  {trilha.stages.map((s, i) => {
                    const isCurrent = i === initialEtapaIdx;
                    const stageDone = isStageDone(trilha.id, s.title);
                    const iconName = s.icon || defaultIconForKind(s.kind);
                    return (
                      <li key={s.id || i}>
                        <Link
                          href={`/trilhas/${trilhaSlug}/${s.slug}`}
                          onClick={() => setTocOpen(false)}
                          aria-current={isCurrent ? 'page' : undefined}
                          className="flex items-center gap-3 px-3 py-2.5 border-l-2 transition-colors"
                          style={
                            isCurrent
                              ? {
                                  borderColor: accent,
                                  background: `${accent}1a`,
                                  color: '#13211F',
                                }
                              : stageDone
                              ? {
                                  borderColor: `${accent}66`,
                                  color: '#9A7552',
                                }
                              : {
                                  borderColor: 'rgb(var(--acento-rgb)/0.15)',
                                  color: '#9A7552',
                                }
                          }
                        >
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border flex-shrink-0"
                            style={
                              stageDone
                                ? { background: accent, color: '#F2EBDC', borderColor: accent }
                                : isCurrent
                                ? { background: `${accent}14`, color: accent, borderColor: accent }
                                : { background: 'transparent', color: `${accent}aa`, borderColor: `${accent}55` }
                            }
                          >
                            {stageDone ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            ) : (
                              <TrilhaIcon name={iconName} size={13} />
                            )}
                          </span>
                          <span className="font-mono italic text-xs opacity-60 flex-shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="font-serif text-[0.92rem] leading-tight flex-1 min-w-0">
                            {s.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </VisibilityGate>
  );
}
