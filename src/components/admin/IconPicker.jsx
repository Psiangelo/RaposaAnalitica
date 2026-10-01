'use client';

/**
 * IconPicker — grid visual reutilizável pro admin escolher ícone cerimonial.
 *
 * Props:
 *   value:    string         — slug atual
 *   onChange: (slug) => void
 *   slugs:    string[]       — universo de ícones permitidos (ex.: TRILHA_ICON_SLUGS)
 *   accent:   string         — cor accent quando selecionado (default dourado)
 *   compact:  boolean        — versão compacta (sem labels, grid mais denso)
 *
 * O slug atualmente selecionado aparece preview maior + nome em cima do grid.
 */

import TrilhaIcon from '@/components/estudos/icons';
import { iconLabel } from '@/lib/trilhaIcons';

const ACCENT_DEFAULT = '#2E5240';

export default function IconPicker({ value, onChange, slugs, accent = ACCENT_DEFAULT, compact = false }) {
  const list = Array.isArray(slugs) && slugs.length > 0 ? slugs : ['compass'];
  const current = list.includes(value) ? value : list[0];

  return (
    <div className="space-y-2">
      {!compact && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg border"
          style={{
            borderColor: `${accent}33`,
            background: `${accent}0d`,
          }}
        >
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border"
            style={{ color: accent, borderColor: `${accent}55` }}
          >
            <TrilhaIcon name={current} size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[rgb(var(--texto-dim-rgb))]">Selecionado</p>
            <p className="font-serif text-[rgb(var(--texto-forte-rgb))]">{iconLabel(current)}</p>
          </div>
        </div>
      )}

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: compact
            ? 'repeat(auto-fill, minmax(32px, 1fr))'
            : 'repeat(auto-fill, minmax(56px, 1fr))',
        }}
      >
        {list.map((slug) => {
          const selected = slug === current;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onChange(slug)}
              title={iconLabel(slug)}
              aria-label={`Ícone: ${iconLabel(slug)}`}
              aria-pressed={selected}
              className={`group flex flex-col items-center justify-center rounded-md border transition-colors ${
                compact ? 'h-9 p-1' : 'h-[64px] py-2 px-1'
              }`}
              style={{
                borderColor: selected ? accent : 'rgb(var(--acento-rgb)/0.12)',
                background: selected ? `${accent}1a` : 'transparent',
                color: selected ? accent : '#2C3A35',
              }}
            >
              <TrilhaIcon name={slug} size={compact ? 18 : 22} />
              {!compact && (
                <span
                  className="text-[9px] font-sans tracking-wide mt-1 text-center leading-none truncate w-full px-0.5"
                  style={{ color: selected ? accent : '#56655D' }}
                >
                  {iconLabel(slug)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
