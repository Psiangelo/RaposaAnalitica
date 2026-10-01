'use client';

import { useState } from 'react';

/**
 * AdminSidebar — navegação vertical agrupada (desktop).
 * Mobile continua usando MobileBottomNav separado.
 */
export default function AdminSidebar({ activeTab, setActiveTab, groups, counts = {} }) {
  // Grupos iniciam expandidos; persistir estado por localStorage
  const [collapsed, setCollapsed] = useState({});
  const toggleGroup = (id) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <aside className="hidden sm:flex flex-col gap-1 py-3 px-2 sticky top-[61px] self-start max-h-[calc(100vh-61px)] overflow-y-auto border-r border-[rgb(var(--acento-rgb)/0.08)]">
      {groups.map((g) => {
        const isCollapsed = !!collapsed[g.id];
        const hasActive = g.items.some((i) => i.id === activeTab);
        return (
          <div key={g.id} className="mb-2">
            <button
              onClick={() => toggleGroup(g.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--texto-dim-rgb))] font-sans hover:text-[rgb(var(--acento-rgb))] transition-colors"
            >
              <span
                className="inline-block w-2 text-[rgb(var(--acento-rgb)/0.5)] transition-transform"
                style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              >
                ▾
              </span>
              <span className="flex-1 text-left">{g.label}</span>
              {hasActive && isCollapsed && (
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--acento-rgb))]" />
              )}
            </button>
            {!isCollapsed && (
              <ul className="mt-1 space-y-0.5">
                {g.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  const count = counts[item.id];
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`group w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-colors text-left ${
                          isActive
                            ? 'bg-[rgb(var(--acento-rgb)/0.12)] text-[rgb(var(--acento-rgb))]'
                            : 'text-[#8A7F71] hover:text-[rgb(var(--texto-forte-rgb))] hover:bg-[rgb(var(--cartao-rgb))]'
                        }`}
                      >
                        {Icon ? (
                          <Icon size={15} />
                        ) : (
                          <span className="w-[15px] text-center text-[rgb(var(--texto-dim-rgb))] text-[0.7rem]">·</span>
                        )}
                        <span className="text-[0.82rem] font-sans flex-1 truncate">
                          {item.label}
                        </span>
                        {count != null && count !== '' && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded leading-none ${
                              isActive
                                ? 'bg-[rgb(var(--acento-rgb)/0.2)] text-[rgb(var(--acento-rgb))]'
                                : 'text-[rgb(var(--texto-dim-rgb))]'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}
