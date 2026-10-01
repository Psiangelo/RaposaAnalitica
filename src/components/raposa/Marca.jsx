/**
 * Marca — a máscara de kitsune de três quartos num disco da mata, e o nome.
 * É a mesma mascarinha que acompanha o @ nos posts do Instagram.
 */
import { BASE_PATH } from '@/lib/site';

export function Mascarinha({ tamanho = 40, disco = 'var(--mata)', className = '' }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden ${className}`}
      style={{ width: tamanho, height: tamanho, background: disco, boxShadow: 'inset 0 0 0 2px rgb(242 235 220 / 0.18)' }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE_PATH}/raposa/mascara-34-${tamanho > 60 ? 240 : 96}.webp`}
        alt=""
        width={87}
        height={133}
        style={{ height: tamanho * 0.82, width: 'auto', transform: 'translate(4%, 6%) rotate(-6deg)' }}
        draggable={false}
      />
    </span>
  );
}

export default function Marca({ tamanho = 40, compacta = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mascarinha tamanho={tamanho} />
      {!compacta && (
        <span className="flex flex-col leading-[0.95]">
          <span
            className="font-serif text-[1.18rem] font-bold text-text-bright tracking-[-0.01em]"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 36' }}
          >
            Raposa
          </span>
          <span
            className="font-serif italic text-[1.02rem] font-semibold text-accent-bright -mt-[1px]"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 36' }}
          >
            Analítica
          </span>
        </span>
      )}
    </span>
  );
}
