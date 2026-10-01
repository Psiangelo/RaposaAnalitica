'use client';

/**
 * Peças de interface do painel da Raposa, para os gerenciadores novos
 * (Pesquisa, Loja, Cartas, Tags) terem a mesma cara dos antigos.
 */

export const INPUT =
  'w-full bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--linha-rgb))] rounded-lg px-3.5 py-2.5 text-[15px] text-[rgb(var(--texto-forte-rgb))] font-sans focus:outline-none focus:border-[rgb(var(--acento-rgb))] transition-colors';
export const LABEL = 'block text-[11px] uppercase tracking-[0.14em] font-semibold text-[rgb(var(--texto-dim-rgb))] font-sans mb-1.5';
export const CARD = 'bg-[rgb(var(--cartao-rgb))] border border-[rgb(var(--linha-rgb))] rounded-2xl p-4 sm:p-5';
export const BTN = 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--mata)] hover:bg-[var(--cedro)] text-[var(--washi)] text-sm font-sans font-semibold transition-colors disabled:opacity-50';
export const BTN2 = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgb(var(--linha-rgb))] text-[rgb(var(--texto-rgb))] text-[13px] font-sans hover:border-[rgb(var(--acento-rgb))] hover:text-[rgb(var(--acento-rgb))] transition-colors';
export const BTN_PERIGO = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgb(var(--rubedo-rgb)/0.35)] text-[rgb(var(--rubedo-rgb))] text-[13px] font-sans hover:bg-[rgb(var(--rubedo-rgb)/0.08)] transition-colors';

export function Campo({ label, dica, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className={LABEL}>{label}</span>}
      {children}
      {dica && <span className="block mt-1 text-[12.5px] text-[rgb(var(--texto-dim-rgb))] font-sans leading-snug">{dica}</span>}
    </label>
  );
}

export function Texto({ value, onChange, placeholder, ...resto }) {
  return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT} {...resto} />;
}

export function Area({ value, onChange, rows = 3, placeholder }) {
  return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${INPUT} leading-relaxed resize-y`} />;
}

export function Escolha({ value, onChange, opcoes }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={INPUT}>
      {opcoes.map((o) => (
        <option key={o.id ?? o.value} value={o.id ?? o.value}>
          {o.label ?? o.nome}
        </option>
      ))}
    </select>
  );
}

export function Chave({ ligado, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!ligado)}
      className="inline-flex items-center gap-2.5 font-sans text-[14px] text-[rgb(var(--texto-rgb))]"
      aria-pressed={!!ligado}
    >
      <span className={`relative w-10 h-6 rounded-full transition-colors ${ligado ? 'bg-[var(--cedro)]' : 'bg-[rgb(var(--linha-rgb))]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[var(--washi)] shadow transition-transform ${ligado ? 'translate-x-4' : ''}`} />
      </span>
      {label}
    </button>
  );
}

export function Secao({ titulo, descricao, children, acoes }) {
  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h3 className="font-serif text-[1.3rem] font-semibold text-[rgb(var(--texto-forte-rgb))]">{titulo}</h3>
          {descricao && <p className="text-[14px] text-[rgb(var(--texto-dim-rgb))] font-sans max-w-2xl">{descricao}</p>}
        </div>
        {acoes}
      </div>
      {children}
    </section>
  );
}

/** Move um item numa lista (para os botões ↑ ↓). */
export function mover(lista, i, delta) {
  const j = i + delta;
  if (j < 0 || j >= lista.length) return lista;
  const nova = [...lista];
  [nova[i], nova[j]] = [nova[j], nova[i]];
  return nova;
}

export function novoId(prefixo = 'item') {
  return `${prefixo}-${Math.random().toString(36).slice(2, 8)}`;
}
