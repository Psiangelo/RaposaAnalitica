'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisibilityGate from '@/components/VisibilityGate';
import AuthorBand from '@/components/AuthorBand';
import { useVisibility } from '@/lib/useVisibility';
import { useSitedata } from '@/lib/useSitedata';
import { useTrilhaProgress } from '@/lib/useTrilhaProgress';
import { getTrilhas, getAreas, SITEDATA_KEYS } from '@/lib/sitedata';
import { migrateTrilhaBlocks } from '@/lib/linkResolver';
import { findArea, DEFAULT_AREAS } from '@/lib/areas';
import { stripHighlights } from '@/lib/highlightTitle';
import { resolveExtraAccent } from '@/lib/extraTone';
import EstudosHero from '@/components/estudos/EstudosHero';
import AreaTabs from '@/components/estudos/AreaTabs';
import ContinueBanner from '@/components/estudos/ContinueBanner';
import TrilhaCard from '@/components/estudos/TrilhaCard';
import Timeline from '@/components/estudos/Timeline';

const DEFAULT_ACCENT = '#2E5240';

function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function EstudosListingClient({ initialTrilhas, initialAreas }) {
  const rawTrilhas = useSitedata(getTrilhas, initialTrilhas, SITEDATA_KEYS.trilhas);
  const areas = useSitedata(getAreas, initialAreas || DEFAULT_AREAS, SITEDATA_KEYS.areas);
  const { visibility } = useVisibility();

  const [activeArea, setActiveArea] = useState(null); // slug | null
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const containerRef = useRef(null);

  // Migra trilhas pra garantir campos `area`, `icon` etc.
  // Trilhas marcadas como `hidden` somem do listing; `comingSoon` aparecem
  // mas com badge "Em breve" (a navegação fica capturada no card).
  const trilhas = useMemo(
    () => (rawTrilhas || []).map(migrateTrilhaBlocks).filter((t) => !t.hidden),
    [rawTrilhas]
  );

  // Contagens por área (mostradas nos tabs)
  const countsByArea = useMemo(() => {
    const counts = {};
    for (const t of trilhas) {
      const slug = t.area || 'psicologia-junguiana';
      counts[slug] = (counts[slug] || 0) + 1;
    }
    return counts;
  }, [trilhas]);

  // Universo de níveis presentes
  const levels = useMemo(() => {
    const set = new Set();
    trilhas.forEach((t) => { if (t.level) set.add(t.level); });
    return Array.from(set);
  }, [trilhas]);

  // Aplicar filtros
  const filtered = useMemo(() => {
    return trilhas.filter((t) => {
      if (activeArea && t.area !== activeArea) return false;
      if (filterLevel && t.level !== filterLevel) return false;
      if (search) {
        const q = normalize(search);
        const hay = normalize(
          `${stripHighlights(t.name)} ${t.subtitle || ''} ${(t.stages || []).map((s) => s.title).join(' ')}`
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [trilhas, activeArea, filterLevel, search]);

  // Progresso
  const { progress, percentOf } = useTrilhaProgress();

  // Trilha pra "Continue de onde parou": maior pct parcial (1-99%)
  const ongoing = useMemo(() => {
    const candidates = trilhas
      .map((t) => {
        const p = progress[t.id];
        if (!p?.completedStages?.length) return null;
        const pct = percentOf(t);
        if (pct === 0 || pct === 100) return null;
        const nextStage = t.stages.find((s) => !p.completedStages.includes(s.title));
        return { trilha: t, pct, nextStage };
      })
      .filter(Boolean);
    return candidates.sort((a, b) => b.pct - a.pct)[0] || null;
  }, [trilhas, progress, percentOf]);

  // Área ativa => accent dinâmico
  const activeAreaObj = activeArea ? findArea(areas, activeArea) : null;
  const accent = activeAreaObj?.color || DEFAULT_ACCENT;

  // Items pra Timeline (mapeia trilhas + meta de progresso)
  const timelineItems = useMemo(() => {
    return filtered.map((t) => {
      const area = findArea(areas, t.area);
      const pct = percentOf(t);
      const itemAccent = resolveExtraAccent(t, area?.color || DEFAULT_ACCENT);
      return {
        id: t.id || t.slug,
        icon: t.icon,
        pct,
        accent: itemAccent,
        trilha: t,
        area,
      };
    });
  }, [filtered, areas, percentOf]);

  // Selo do hero: usa ícone da área ativa, senão compass
  const heroSeal = activeAreaObj?.icon || 'compass';

  // Meta numérica no hero
  const totalEtapas = trilhas.reduce((sum, t) => sum + (t.stages?.length || 0), 0);
  const heroMeta = [
    { label: trilhas.length === 1 ? 'trilha' : 'trilhas', value: trilhas.length },
    { label: 'áreas', value: areas.length },
    { label: totalEtapas === 1 ? 'etapa' : 'etapas', value: totalEtapas },
  ];

  return (
    <VisibilityGate visibilityKey="estudos" title="Estudos indisponível">
      <Navbar />
      <main>
        <EstudosHero
          eyebrow={
            activeAreaObj
              ? `Sala de estudos · ${activeAreaObj.label}`
              : 'Sala de estudos · Psicologia Analítica'
          }
          title="Estudos"
          emphasis="guiados"
          lead="Cada trilha é um guia rico — texto explicativo, vídeos, materiais, cartografia e ensaios — montado para te conduzir passo a passo. Comece pela área."
          sealIcon={heroSeal}
          accent={accent}
          meta={heroMeta}
        />

        <section
          ref={containerRef}
          className="relative py-8 md:py-12 px-5 sm:px-6 md:px-12"
        >
          <div className="max-w-[1180px] mx-auto">
            {/* Filtro primário: Áreas */}
            <div className="mb-6 md:mb-8">
              <AreaTabs
                areas={areas}
                active={activeArea}
                onChange={setActiveArea}
                counts={countsByArea}
              />
            </div>

            {/* Filtros secundários: busca + nível (collapsible) */}
            {(trilhas.length > 2 || search) && (
              <div className="mb-10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-2 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-text-dim hover:text-accent transition-colors mb-3"
                  aria-expanded={showAdvanced}
                >
                  <span className={`inline-block transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▸</span>
                  Buscar ou filtrar por nível
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 flex-wrap pt-2">
                        <div className="flex-1 min-w-[200px] relative border-b border-border-subtle focus-within:border-accent/50 transition-colors">
                          <svg
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.6}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            placeholder="Buscar trilha ou etapa…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-transparent text-text-bright placeholder:text-text-dim/50 focus:outline-none font-serif italic text-[0.95rem]"
                          />
                        </div>
                        {levels.length > 1 && (
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => setFilterLevel(null)}
                              className={`px-3 py-1.5 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                                !filterLevel
                                  ? 'bg-accent text-bg'
                                  : 'border border-border-subtle text-text-dim hover:text-accent'
                              }`}
                            >
                              Todos
                            </button>
                            {levels.map((l) => (
                              <button
                                key={l}
                                onClick={() => setFilterLevel(filterLevel === l ? null : l)}
                                className={`px-3 py-1.5 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                                  filterLevel === l
                                    ? 'bg-accent text-bg'
                                    : 'border border-border-subtle text-text-dim hover:text-accent'
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Continue de onde parou */}
            {ongoing && !activeArea && !search && !filterLevel && (
              <ContinueBanner
                trilha={ongoing.trilha}
                pct={ongoing.pct}
                nextStage={ongoing.nextStage}
                accent={findArea(areas, ongoing.trilha.area)?.color || DEFAULT_ACCENT}
              />
            )}

            {/* Timeline + cards */}
            {timelineItems.length > 0 ? (
              <Timeline
                items={timelineItems}
                defaultAccent={accent}
                renderItem={(item) => (
                  <TrilhaCard
                    trilha={item.trilha}
                    area={item.area}
                    pct={item.pct}
                    accent={item.accent}
                    completedTitles={progress[item.trilha.id]?.completedStages || []}
                  />
                )}
              />
            ) : trilhas.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border-subtle rounded-sm">
                <p className="font-serif italic text-text-dim">Nenhuma trilha publicada ainda.</p>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border-subtle rounded-sm">
                <p className="font-serif italic text-text-dim mb-3">
                  Nenhuma trilha com esses filtros.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterLevel(null);
                    setActiveArea(null);
                  }}
                  className="font-sans text-[12.5px] font-semibold text-accent tracking-[0.12em] uppercase hover:text-text-bright transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quem organiza — fecha a listagem, como a faixa "quem escreve" fecha o
            blog. Aqui o texto é de curadoria, não de escuta clínica: o que
            legitima uma trilha é o percurso de quem a montou. */}
        {visibility.autor !== false && (
          <AuthorBand
            id="quem-organiza"
            eyebrow="Quem organiza"
            body="As trilhas daqui saem do meu próprio percurso de leitura. Conduzo grupos de estudo para estudantes e profissionais, participo de intervisões e da Liga de Psicologia Analítica da UNICAP, e o que atravesso nesse caminho volta organizado em etapas, para você entrar na obra de Jung pela porta certa."
            secondary={{ href: '/blog', label: 'Ler os ensaios' }}
          />
        )}
      </main>
      <Footer />
    </VisibilityGate>
  );
}
