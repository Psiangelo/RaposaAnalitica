'use client';

import { useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VisibilityGate from '@/components/VisibilityGate';
import { useSitedata } from '@/lib/useSitedata';
import { useTrilhaProgress } from '@/lib/useTrilhaProgress';
import { getTrilhas, getAreas, getMaterials, SITEDATA_KEYS } from '@/lib/sitedata';
import { findArea, DEFAULT_AREAS } from '@/lib/areas';
import { defaultIconForKind } from '@/lib/trilhaIcons';
import { migrateTrilhaBlocks } from '@/lib/linkResolver';
import { resolveExtraAccent, isExtra } from '@/lib/extraTone';
import { deriveStageThumb } from '@/lib/stageThumb';
import TrilhaHero from '@/components/estudos/TrilhaHero';
import TrilhaIntro from '@/components/estudos/TrilhaIntro';
import StageCard from '@/components/estudos/StageCard';
import Timeline from '@/components/estudos/Timeline';
import PrevNextTrilhas from '@/components/estudos/PrevNextTrilhas';

const DEFAULT_ACCENT = '#2E5240';

function getBlogPosts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('raposa_admin_blog');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function TrilhaDetailClient({
  initialTrilha,
  initialAreas,
  initialPosts,
  initialMaterials,
  initialAllTrilhas,
}) {
  const allTrilhas = useSitedata(
    getTrilhas,
    initialAllTrilhas || [initialTrilha],
    SITEDATA_KEYS.trilhas
  );
  const areas = useSitedata(getAreas, initialAreas || DEFAULT_AREAS, SITEDATA_KEYS.areas);
  const posts = useSitedata(getBlogPosts, initialPosts || [], 'raposa_admin_blog');
  const materials = useSitedata(
    getMaterials,
    initialMaterials || [],
    SITEDATA_KEYS.materials
  );

  const targetSlug = initialTrilha.slug || initialTrilha.id;

  const trilha = useMemo(() => {
    const found = allTrilhas.find((t) => (t.slug || t.id) === targetSlug);
    return migrateTrilhaBlocks(found || initialTrilha);
  }, [allTrilhas, initialTrilha, targetSlug]);

  const area = findArea(areas, trilha.area);
  const areaAccent = area?.color || DEFAULT_ACCENT;
  const accent = resolveExtraAccent(trilha, areaAccent);
  const trilhaExtra = isExtra(trilha);

  const { percentOf, resetTrilha, progress, toggleStage } = useTrilhaProgress();
  const pct = percentOf(trilha);
  const completedTitles = progress[trilha.id]?.completedStages || [];

  const nextUnfinished = useMemo(() => {
    return (trilha.stages || []).find((s) => !completedTitles.includes(s.title));
  }, [trilha, completedTitles]);

  // Items pra Timeline (etapas binárias: 0 ou 100)
  // Cada etapa pode ter seu próprio accent (roxo se .extra), mas se a trilha
  // inteira é extra, todas herdam roxo automaticamente.
  // Etapas com `hidden:true` somem da timeline; `comingSoon:true` aparecem
  // mas com badge + link bloqueado.
  const items = useMemo(() => {
    return (trilha.stages || [])
      .filter((stage) => !stage.hidden)
      .map((stage, idx) => {
        const done = completedTitles.includes(stage.title);
        const stageAccent = trilhaExtra
          ? accent
          : resolveExtraAccent(stage, areaAccent);
        return {
          id: stage.id || `stage-${idx}`,
          icon: stage.icon || defaultIconForKind(stage.kind),
          pct: done ? 100 : 0,
          accent: stageAccent,
          stage,
          idx,
          done,
        };
      });
  }, [trilha, completedTitles, accent, areaAccent, trilhaExtra]);

  // Prev/Next trilhas
  const migratedAll = useMemo(
    () => (allTrilhas || []).map(migrateTrilhaBlocks),
    [allTrilhas]
  );
  const myIdx = migratedAll.findIndex(
    (t) => (t.slug || t.id) === targetSlug
  );
  const prev = myIdx > 0 ? migratedAll[myIdx - 1] : null;
  const next =
    myIdx >= 0 && myIdx < migratedAll.length - 1 ? migratedAll[myIdx + 1] : null;

  return (
    <VisibilityGate visibilityKey="estudos" title="Estudos indisponível">
      <Navbar />
      <main>
        <TrilhaHero
          completedTitles={completedTitles}
          trilha={trilha}
          area={area}
          pct={pct}
          nextStage={nextUnfinished}
          onReset={() => resetTrilha(trilha.id)}
          accent={accent}
        />

        {trilha.description && (
          <TrilhaIntro description={trilha.description} accent={accent} />
        )}

        <section className="py-8 md:py-12 px-5 sm:px-6 md:px-12">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <span
                className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: accent }}
              >
                Etapas
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: `linear-gradient(to right, ${accent}55, transparent)` }}
              />
              <span className="font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase text-text-dim">
                {trilha.stages.length} {trilha.stages.length === 1 ? 'etapa' : 'etapas'}
              </span>
            </div>

            {items.length > 0 ? (
              <Timeline
                items={items}
                defaultAccent={accent}
                renderItem={(item) => (
                  <StageCard
                    stage={item.stage}
                    idx={item.idx}
                    trilhaSlug={trilha.slug || trilha.id}
                    accent={item.accent}
                    done={item.done}
                    onToggle={() => toggleStage(trilha.id, item.stage.title)}
                    thumb={deriveStageThumb(item.stage, { posts, materials })}
                    trilhaCover={trilha.coverImage}
                  />
                )}
              />
            ) : (
              <div className="text-center py-16 border border-dashed border-border-subtle rounded-sm">
                <p className="font-serif italic text-text-dim">
                  Esta trilha ainda não tem etapas publicadas.
                </p>
              </div>
            )}
          </div>
        </section>

        <PrevNextTrilhas prev={prev} next={next} areas={areas} />
      </main>
      <Footer />
    </VisibilityGate>
  );
}
