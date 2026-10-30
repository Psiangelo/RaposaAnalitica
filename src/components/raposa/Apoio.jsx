'use client';

import { getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import Icone from '@/components/raposa/Icone';
import Figura from '@/components/raposa/Figura';
import Padronagem from '@/components/raposa/Padronagem';

/**
 * Apoie a Raposa: o convite para a campanha no Apoia-se.
 *
 * É a mesma ema dos vídeos do YouTube (a placa de madeira que pende da
 * shimenawa no santuário de Inari, com «Apoie a Raposa» em cima), para quem
 * vem do vídeo reconhecer o pedido. A raposa da lanterna fica do lado: o
 * apoio é o que mantém as lanternas acesas.
 *
 * O link mora em Configurações (settings.apoioLink); o liga/desliga é a chave
 * «apoio» da Visibilidade. Por enquanto aparece só na /bio, como a primeira
 * coisa depois do cabeçalho.
 */

const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

/** Os veios da madeira da ema, tom sobre tom. */
const VEIOS =
  'repeating-linear-gradient(176deg, rgb(107 74 53 / 0) 0 14px, rgb(107 74 53 / 0.07) 14px 16px, rgb(107 74 53 / 0) 16px 31px, rgb(107 74 53 / 0.05) 31px 32px)';

export function useApoio() {
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const link = String(settings.apoioLink || '').trim();
  return { link, ativo: Boolean(link) && v.apoio !== false };
}

/** O endereço sem o https://, para mostrar por extenso. */
function semProtocolo(link) {
  return link.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/** A ema da /bio, pendurada na shimenawa. */
export function ApoioPlaca() {
  const { link, ativo } = useApoio();
  if (!ativo) return null;
  return (
    <div className="relative pt-[62px]">
      {/* a corda sagrada de onde a ema pende, com os dois cordões vermelhos */}
      <Figura nome="obj/shimenawa" alt="" prioridade className="pointer-events-none absolute left-1/2 top-0 w-[86%] -translate-x-1/2" />
      {['left-[27%]', 'right-[27%]'].map((lado) => (
        <span key={lado} aria-hidden className={`absolute top-[30px] ${lado} z-10 h-[46px] w-[3px] rounded-full bg-[var(--torii)]`} />
      ))}

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative z-10 block overflow-hidden rounded-[22px] border-2 border-[var(--tinta)] bg-[#CFA477] text-[var(--tinta)] shadow-[5px_5px_0_var(--tinta)] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_var(--tinta)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--tinta)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ backgroundImage: VEIOS }}
      >
        {/* o friso de dentro da ema e os furinhos dos cordões */}
        <span aria-hidden className="pointer-events-none absolute inset-[7px] rounded-[15px] border-[1.5px] border-[rgb(107_74_53/0.45)]" />
        {['left-[27%]', 'right-[27%]'].map((lado) => (
          <span key={lado} aria-hidden className={`absolute top-[11px] ${lado} h-[7px] w-[7px] -translate-x-[2px] rounded-full bg-[var(--tronco)]`} />
        ))}
        <Padronagem
          nome="asanoha"
          cor="#6B4A35"
          opacidade={0.1}
          tam={30}
          style={{ maskImage: 'linear-gradient(90deg, transparent 45%, #000 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 45%, #000 100%)' }}
        />
        {/* o halo da lanterna */}
        <span aria-hidden className="pointer-events-none absolute -right-[30px] bottom-[18px] h-[170px] w-[170px] rounded-full bg-[var(--ginkgo)] opacity-[0.32] blur-[26px] transition-opacity duration-500 group-hover:opacity-[0.5]" />

        <div className="relative flex items-end gap-2 pl-6 pr-3 pt-7 pb-5">
          <div className="min-w-0 flex-1 pb-1">
            <p className="flex items-center gap-2 font-sans text-[11.5px] font-bold uppercase tracking-[0.2em] text-[var(--urushi)]">
              <span aria-hidden className="inline-block h-[7px] w-[7px] rounded-full bg-[var(--torii)]" />
              Apoio mensal
            </p>
            <p className="mt-2 font-serif text-[2.05rem] font-extrabold leading-[0.98] tracking-[-0.01em]" style={FRAUNCES}>
              Apoie a <em className="italic font-bold text-[var(--urushi)]">Raposa</em>
            </p>
            <p className="mt-2.5 max-w-[30ch] font-body text-[0.98rem] leading-snug text-[rgb(19_33_31/0.86)]">
              Meus vídeos sobre Jung são gratuitos e vão continuar assim. Com o seu apoio, eu mantenho as lanternas acesas.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-[var(--tinta)] bg-[var(--torii)] px-5 py-2.5 font-sans text-[15px] font-bold text-[var(--washi)] shadow-[3px_3px_0_var(--tinta)] transition-colors duration-200 group-hover:bg-[var(--urushi)]">
              Quero apoiar <Icone nome="externo" size={16} />
            </span>
            <p className="mt-2.5 font-sans text-[12.5px] font-semibold leading-snug text-[rgb(19_33_31/0.62)]">
              A partir de R$ 10 por mês
              <span className="block font-normal">{semProtocolo(link)}</span>
            </p>
          </div>
          <Figura
            nome="fig/raposa-lanterna"
            alt="Uma raposa vermelha sentada, segurando na boca a vara de uma lanterna de papel acesa"
            prioridade
            className="relative -mb-2 w-[104px] shrink-0 sm:w-[118px]"
          />
        </div>
      </a>
    </div>
  );
}
