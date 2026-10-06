'use client';

import { getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import Icone from '@/components/raposa/Icone';
import Figura from '@/components/raposa/Figura';
import Padronagem from '@/components/raposa/Padronagem';
import Rotulo from '@/components/raposa/Rotulo';
import { TituloSecao } from '@/components/raposa/Cabecalho';

/**
 * Toca da Raposa: o convite para o grupo de WhatsApp (a comunidade).
 *
 * A foto é a mesma do grupo (as três raposas espiando da boca da toca), para
 * a pessoa reconhecer o grupo quando entrar. A toca vem do mito de origem da
 * marca: na gravura de Michelspacher que Jung comenta (OC 13 §241, n. 5), a
 * raposa some num buraco da montanha, e o buraco é o caminho.
 *
 * O link mora em Configurações (settings.tocaLink); o liga/desliga é a chave
 * «toca» da Visibilidade. Aparece na home, no pé do blog, no fim de cada
 * ensaio, na /bio e no rodapé.
 */

const FRAUNCES = { fontVariationSettings: '"SOFT" 100, "WONK" 1' };

export function useToca() {
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const link = String(settings.tocaLink || '').trim();
  return { link, ativo: Boolean(link) && v.toca !== false };
}

/** A foto redonda do grupo, com o halo de ouro. */
export function FotoToca({ className = 'w-[120px]', anel = 'ring-[5px]', halo = true }) {
  return (
    <div className={`relative shrink-0 aspect-square ${className}`}>
      {halo && (
        <>
          <div aria-hidden className="absolute -inset-[9%] rounded-full bg-[var(--ginkgo)] opacity-[0.13]" />
          <div aria-hidden className="absolute -inset-[18%] rounded-full bg-[var(--ginkgo)] opacity-[0.06]" />
        </>
      )}
      <Figura
        nome="fig/toca-da-raposa"
        alt="Três raposas espiando da boca de uma toca num morro: a kitsune branca de óculos e cachimbo no meio, uma raposa vermelha e uma castanha dos lados"
        className={`relative w-full rounded-full ${anel} ring-[var(--ginkgo)]`}
      />
    </div>
  );
}

function BotaoToca({ link, rotulo = 'Entrar na Toca', className = '' }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={`btn btn--ouro ${className}`}>
      <Icone nome="whatsapp" size={19} /> {rotulo}
    </a>
  );
}

/** A faixa grande (home e pé do blog). */
export default function Toca({ id = 'toca' }) {
  const { link, ativo } = useToca();
  if (!ativo) return null;
  return (
    <section id={id} className="relative py-16 sm:py-20 scroll-mt-16" data-reading-hide="true">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="noite relative overflow-hidden rounded-[32px] bg-[var(--mata)]">
          <Padronagem nome="asanoha" cor="#8DAA68" opacidade={0.09} tam={44} />
          <div aria-hidden className="ceu-estrelado absolute inset-0" />
          <Figura nome="mata/vaga-lumes" alt="" className="pointer-events-none absolute -right-6 -top-4 w-[150px] sm:w-[210px] opacity-80" />
          <div className="relative grid md:grid-cols-[auto_1fr] items-center gap-10 md:gap-14 px-7 py-12 sm:px-12 sm:py-14 lg:px-16">
            <FotoToca className="mx-auto w-[200px] sm:w-[250px] lg:w-[290px]" anel="ring-[6px]" />
            <div className="text-center md:text-left">
              <Rotulo className="mb-4 justify-center md:justify-start" cor="text-[var(--kitsunebi)]">A comunidade no WhatsApp</Rotulo>
              <TituloSecao antes="Toca da" pivo="Raposa" tamanho="text-[clamp(2.3rem,5vw,3.8rem)]" />
              <p className="mt-4 mx-auto md:mx-0 max-w-[46ch] font-body text-[1.08rem] leading-relaxed text-text">
                O grupo de quem lê Jung por aqui. Aviso lá quando sai ensaio novo, e a conversa sobre o que a gente está lendo continua lá dentro.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 justify-center md:justify-start">
                <BotaoToca link={link} />
                <span className="font-sans text-[13.5px] text-text-dim">Grupo aberto. Dá para sair quando quiser.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** O cartão do fim de cada ensaio. */
export function TocaCartao() {
  const { link, ativo } = useToca();
  if (!ativo) return null;
  return (
    <aside className="noite relative overflow-hidden rounded-[26px] bg-[var(--mata)] px-6 py-7 sm:px-9 sm:py-8 mt-12" data-reading-hide="true">
      <Padronagem nome="asanoha" cor="#8DAA68" opacidade={0.08} tam={36} />
      <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
        <FotoToca className="w-[118px] sm:w-[132px]" anel="ring-4" />
        <div className="min-w-0">
          <p className="font-serif text-[1.55rem] leading-[1.1] font-bold text-text-bright" style={FRAUNCES}>
            Quer conversar sobre <em className="italic font-semibold text-[var(--ginkgo)]">este ensaio</em>?
          </p>
          <p className="mt-2 mb-5 font-body text-[1rem] leading-relaxed text-text">
            A conversa continua na Toca da Raposa, o grupo no WhatsApp de quem lê Jung por aqui.
          </p>
          <BotaoToca link={link} />
        </div>
      </div>
    </aside>
  );
}

/** A placa da /bio (no mesmo desenho das outras placas, com a foto do grupo). */
export function TocaPlaca() {
  const { link, ativo } = useToca();
  if (!ativo) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 overflow-hidden rounded-[18px] border-2 border-[var(--tinta)] bg-[var(--mata)] px-4 py-[0.9rem] text-[var(--washi)] shadow-[4px_4px_0_var(--tinta)] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_var(--tinta)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--tinta)]"
    >
      <Padronagem nome="asanoha" cor="#8DAA68" opacidade={0.16} tam={30} style={{ maskImage: 'linear-gradient(90deg, transparent 38%, #000 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 38%, #000 100%)' }} />
      <FotoToca className="w-[56px] -rotate-[5deg] transition-transform duration-300 group-hover:rotate-0" anel="ring-[3px]" halo={false} />
      <span className="relative min-w-0 flex-1">
        <span className="block font-serif text-[1.2rem] font-bold leading-tight" style={FRAUNCES}>
          Toca da <em className="italic font-semibold text-[var(--ginkgo)]">Raposa</em>
        </span>
        <span className="mt-0.5 block font-sans text-[13.5px] leading-snug opacity-80">O grupo no WhatsApp: entre e converse sobre Jung.</span>
      </span>
      <span className="relative flex items-center justify-center w-9 h-9 rounded-full shrink-0 border-[1.5px] border-[var(--ginkgo)] text-[var(--ginkgo)] transition-colors duration-200 group-hover:bg-[var(--ginkgo)] group-hover:text-[var(--tinta)]">
        <Icone nome="whatsapp" size={17} />
      </span>
    </a>
  );
}

/** O convite pequeno do rodapé (fundo da noite). */
export function TocaRodape() {
  const { link, ativo } = useToca();
  if (!ativo) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-8 inline-flex items-center gap-3.5 rounded-full border border-linha bg-bg-card py-2 pl-2 pr-5 transition-colors hover:border-[var(--ginkgo)]"
    >
      <FotoToca className="w-[46px]" anel="ring-2" halo={false} />
      <span className="font-sans text-[14.5px] leading-tight text-text">
        Entre na <b className="font-semibold text-text-bright">Toca da Raposa</b>
        <span className="block text-[12.5px] text-text-dim">o grupo no WhatsApp</span>
      </span>
      <Icone nome="seta" size={16} className="text-[var(--ginkgo)] transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}
