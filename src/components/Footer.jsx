'use client';

import Link from 'next/link';
import { getSettings, DEFAULT_SETTINGS, getBio, DEFAULT_BIO, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';
import Selo from '@/components/raposa/Selo';
import Figura from '@/components/raposa/Figura';
import Icone from '@/components/raposa/Icone';
import { BASE_PATH } from '@/lib/site';

/**
 * Rodapé: a noite da mata. Lua, vaga-lumes, a raposa olhando a lua, o selo
 * vermelho e a frase do §241 no lugar do γνῶθι σεαυτόν do Psiangelo.
 */
export default function Footer() {
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const bio = useSitedata(getBio, DEFAULT_BIO, SITEDATA_KEYS.bio);
  const author = bio?.author || DEFAULT_BIO.author;
  const { visibility: v } = useVisibility();
  const ano = new Date().getFullYear();

  const whats = settings.whatsappNumber ? `https://wa.me/${String(settings.whatsappNumber).replace(/\D/g, '')}` : null;

  const colunas = [
    {
      titulo: 'Ler',
      itens: [
        v.blog !== false && { href: '/blog', label: 'Ensaios' },
        v.glossario !== false && { href: '/verbetes', label: 'Verbetes' },
        v.estudos !== false && { href: '/trilhas', label: 'Trilhas' },
        v.blog !== false && { href: `${BASE_PATH}/feed.xml`, label: 'RSS', arquivo: true },
      ],
    },
    {
      titulo: 'Encomendar',
      itens: [
        v.servicos !== false && { href: '/servicos', label: 'Pesquisa sob encomenda' },
        v.loja !== false && { href: '/loja', label: 'Loja' },
        v.newsletter !== false && { href: '/newsletter', label: 'Cartas da Raposa' },
      ],
    },
    {
      titulo: 'Conversar',
      itens: [
        whats && { href: whats, label: 'WhatsApp', externo: true },
        settings.instagramLink && { href: settings.instagramLink, label: 'Instagram', externo: true },
        settings.youtubeLink && { href: settings.youtubeLink, label: 'YouTube', externo: true },
        settings.emailAddress && { href: `mailto:${settings.emailAddress}`, label: 'E-mail' },
        { href: '/sobre', label: 'Sobre a raposa' },
        v.bio !== false && { href: '/bio', label: 'Bio' },
      ],
    },
  ].map((c) => ({ ...c, itens: c.itens.filter(Boolean) }));

  return (
    <footer className="noite relative overflow-hidden mt-0" data-reading-hide="true">
      {/* céu: estrelas e vaga-lumes */}
      <div aria-hidden className="ceu-estrelado absolute inset-0 pointer-events-none" />
      <Figura nome="mata/vaga-lumes" alt="" className="pointer-events-none absolute bottom-[120px] right-[250px] w-[200px] opacity-80 hidden lg:block" />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Selo tamanho={72} />
            <p
              className="mt-7 font-serif text-[1.9rem] sm:text-[2.2rem] leading-[1.08] text-text-bright font-semibold max-w-[16ch]"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
            >
              A floresta é o <em className="text-[var(--ginkgo)]">inconsciente</em>.
            </p>
            <p className="mt-4 font-body italic text-[0.98rem] leading-relaxed text-text-dim max-w-[44ch]">
              “A floresta escura e impenetrável como a profundeza da água e do mar é o continente do desconhecido e do mistério.”
              <span className="not-italic font-sans text-[12px] font-semibold tracking-[0.14em] uppercase ml-2 text-[var(--kitsunebi)]">OC 13 §241</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {colunas.map((c) => (
              <div key={c.titulo}>
                <p className="font-sans text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--kitsunebi)] mb-4">{c.titulo}</p>
                <ul className="space-y-2.5">
                  {c.itens.map((i) => (
                    <li key={i.href + i.label}>
                      {i.externo || i.arquivo ? (
                        <a href={i.href} {...(i.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="font-sans text-[15px] text-text hover:text-[var(--ginkgo)] transition-colors inline-flex items-center gap-1.5">
                          {i.label}
                          {i.externo && <Icone nome="externo" size={13} className="opacity-60" />}
                        </a>
                      ) : (
                        <Link href={i.href} className="font-sans text-[15px] text-text hover:text-[var(--ginkgo)] transition-colors">
                          {i.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-16 pt-6 pb-36 sm:pb-0 border-t border-linha flex flex-col sm:flex-row sm:items-end justify-between gap-4 pr-0 sm:pr-[220px]">
          <div className="font-sans text-[13px] text-text-dim leading-relaxed">
            <p>© {ano} Raposa Analítica · escrito por {author.name || 'Ângelo'}</p>
            {author.disclaimer && <p className="text-text-faint">{author.disclaimer}</p>}
          </div>
          <div className="flex gap-4 font-sans text-[13px] text-text-dim">
            <Link href="/privacidade" className="hover:text-text-bright">Privacidade</Link>
            <Link href="/cookies" className="hover:text-text-bright">Cookies</Link>
          </div>
        </div>
      </div>

      <Figura
        nome="fig/raposa-olhando-lua"
        alt="Uma raposa de costas, sentada na relva, olhando a lua"
        className="pointer-events-none absolute bottom-0 right-2 sm:right-8 w-[150px] sm:w-[210px]"
      />
    </footer>
  );
}
