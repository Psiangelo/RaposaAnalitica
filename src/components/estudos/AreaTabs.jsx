'use client';

import TrilhaIcon from './icons';

/**
 * AreaTabs — filtro primário do listing /estudos.
 *
 * Tab "Todas" + uma por área (com ícone + label + cor própria).
 * Quando uma área é selecionada, o resto da página recebe `accent`
 * da cor da área pra dar coesão visual.
 *
 * Props:
 *   areas: [{ id, slug, label, icon, color }]
 *   active: string | null     — slug da área ativa, null = "Todas"
 *   onChange: (slug | null) => void
 *   counts?: { [slug]: number } — opcional, mostra contagem em cada tab
 */

const DEFAULT_ACCENT = '#2E5240';

export default function AreaTabs({ areas = [], active, onChange, counts = {} }) {
  if (!Array.isArray(areas) || areas.length === 0) return null;
  // Não mostra filtro de área quando só existe uma — seria ruído
  const meaningful = areas.length > 1;
  if (!meaningful) return null;

  return (
    <div
      role="tablist"
      aria-label="Filtrar por área de estudo"
      className="flex flex-wrap items-center gap-2"
    >
      <Tab
        label="Todas"
        active={!active}
        accent={DEFAULT_ACCENT}
        onClick={() => onChange?.(null)}
      />
      {areas.map((a) => (
        <Tab
          key={a.slug}
          label={a.label}
          icon={a.icon}
          accent={a.color || DEFAULT_ACCENT}
          active={active === a.slug}
          count={counts[a.slug]}
          onClick={() => onChange?.(active === a.slug ? null : a.slug)}
        />
      ))}
    </div>
  );
}

function Tab({ label, icon, accent, active, count, onClick }) {
  const style = active
    ? {
        background: `${accent}1a`,
        borderColor: accent,
        color: accent,
      }
    : {
        background: 'transparent',
        borderColor: 'rgb(var(--acento-rgb)/0.18)',
        color: '#2C3A35',
      };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-text-bright"
      style={style}
    >
      {icon && <TrilhaIcon name={icon} size={14} />}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className="font-sans text-[12.5px] font-semibold opacity-70"
          style={{ color: active ? accent : '#56655D' }}
        >
          · {count}
        </span>
      )}
    </button>
  );
}
