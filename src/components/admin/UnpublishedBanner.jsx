'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUnpublishedChanges } from '@/lib/useUnpublishedChanges';
import { markPublished } from '@/lib/unpublishedChanges';
import { publicar, lerToken } from '@/lib/githubPublish';

function formatAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

/** Faixa no topo do painel quando há edição ainda não publicada. */
export default function UnpublishedBanner({ addToast, addLogEntry, onGoToPublish }) {
  const { ready, hasChanges, publishedAt } = useUnpublishedChanges();
  const [publishing, setPublishing] = useState(false);
  const [etapa, setEtapa] = useState('');

  if (!ready || !hasChanges) return null;

  const handlePublish = async () => {
    const token = lerToken();
    if (!token) {
      addToast?.('Falta o token do GitHub: abra a aba Publicar.', 'error');
      onGoToPublish?.();
      return;
    }
    setPublishing(true);
    try {
      await publicar({ token, nota: 'pela faixa de aviso', progresso: setEtapa });
      markPublished();
      addToast?.('Publicado. O site se atualiza em uns 2 minutos.', 'success');
      addLogEntry?.('Publicado (faixa)', '');
    } catch (e) {
      addToast?.(`Não deu para publicar: ${e.message}`, 'error');
    } finally {
      setPublishing(false);
      setEtapa('');
    }
  };

  const ultima = publishedAt ? `Última publicação: ${formatAgo(publishedAt)}` : 'Sem registro de publicação neste navegador';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="sticky top-[57px] z-30 bg-[var(--ginkgo)] border-b border-[rgb(var(--linha-rgb))]"
        role="status"
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden className="w-2 h-2 rounded-full bg-[var(--urushi)] animate-pulse shrink-0" />
            <div className="min-w-0 font-sans text-[var(--tinta)]">
              <p className="text-sm font-semibold leading-tight">Você tem mudanças não publicadas</p>
              <p className="text-[12px] leading-tight opacity-80">{ultima} · o que você editou está só neste navegador até publicar</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onGoToPublish && (
              <button type="button" onClick={onGoToPublish} className="hidden sm:inline text-[13px] font-sans text-[var(--tinta)] underline underline-offset-2 px-2">
                detalhes
              </button>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-full bg-[var(--mata)] hover:bg-[var(--cedro)] disabled:opacity-60 text-[var(--washi)] text-sm font-sans font-semibold px-4 py-2 whitespace-nowrap"
            >
              {publishing ? `${etapa || 'Publicando'}…` : 'Publicar agora'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
