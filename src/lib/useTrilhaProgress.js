'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'raposa_trilha_progress';

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('trilha-progress:changed'));
  } catch {
    /* noop */
  }
}

/**
 * useTrilhaProgress — hook completo de progresso por trilha.
 * Retorna:
 *   progress: { [trilhaId]: { completedStages: string[], startedAt, updatedAt } }
 *   isStageDone(trilhaId, stageTitle)
 *   toggleStage(trilhaId, stageTitle)
 *   resetTrilha(trilhaId)
 *   percentOf(trilha) — trilha é objeto { id, stages }
 */
export function useTrilhaProgress() {
  const [progress, setProgress] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readAll());
    setReady(true);

    const onChange = () => setProgress(readAll());
    window.addEventListener('trilha-progress:changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('trilha-progress:changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const isStageDone = useCallback(
    (trilhaId, stageTitle) => {
      const t = progress[trilhaId];
      return t?.completedStages?.includes(stageTitle) || false;
    },
    [progress]
  );

  const toggleStage = useCallback((trilhaId, stageTitle) => {
    const all = readAll();
    const now = new Date().toISOString();
    const entry = all[trilhaId] || { completedStages: [], completedSubstages: {}, startedAt: now, updatedAt: now };
    const done = entry.completedStages.includes(stageTitle);
    const updated = {
      ...entry,
      completedStages: done
        ? entry.completedStages.filter((s) => s !== stageTitle)
        : [...entry.completedStages, stageTitle],
      updatedAt: now,
      startedAt: entry.startedAt || now,
    };
    writeAll({ ...all, [trilhaId]: updated });
  }, []);

  /** Sub-etapas: progresso granular dentro de uma stage (chave: stageId, substageId) */
  const isSubstageDone = useCallback(
    (trilhaId, stageId, substageId) => {
      const e = progress[trilhaId];
      return !!e?.completedSubstages?.[stageId]?.includes(substageId);
    },
    [progress]
  );

  const toggleSubstage = useCallback((trilhaId, stageId, substageId) => {
    if (!trilhaId || !stageId || !substageId) return;
    const all = readAll();
    const now = new Date().toISOString();
    const entry = all[trilhaId] || { completedStages: [], completedSubstages: {}, startedAt: now, updatedAt: now };
    const stageSubs = entry.completedSubstages?.[stageId] || [];
    const done = stageSubs.includes(substageId);
    const updatedSubs = done
      ? stageSubs.filter((s) => s !== substageId)
      : [...stageSubs, substageId];
    const updated = {
      ...entry,
      completedSubstages: {
        ...(entry.completedSubstages || {}),
        [stageId]: updatedSubs,
      },
      updatedAt: now,
      startedAt: entry.startedAt || now,
    };
    writeAll({ ...all, [trilhaId]: updated });
  }, []);

  /** Contadores de substages concluídas numa stage. Retorna {done, total}. */
  const substageStats = useCallback(
    (trilhaId, stage) => {
      const subs = (stage?.blocks || []).filter((b) => b?.type === 'substage');
      const total = subs.length;
      if (total === 0) return { done: 0, total: 0 };
      const completed = progress[trilhaId]?.completedSubstages?.[stage.id] || [];
      const done = subs.filter((s) => completed.includes(s.id)).length;
      return { done, total };
    },
    [progress]
  );

  const resetTrilha = useCallback((trilhaId) => {
    const all = readAll();
    delete all[trilhaId];
    writeAll(all);
  }, []);

  const percentOf = useCallback(
    (trilha) => {
      if (!trilha?.stages?.length) return 0;
      const t = progress[trilha.id];
      if (!t) return 0;
      return Math.round((t.completedStages.length / trilha.stages.length) * 100);
    },
    [progress]
  );

  return {
    progress,
    ready,
    isStageDone,
    toggleStage,
    isSubstageDone,
    toggleSubstage,
    substageStats,
    resetTrilha,
    percentOf,
  };
}
