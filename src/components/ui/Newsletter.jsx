'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useSitedata } from '@/lib/useSitedata';
import {
  getNewsletterConfig, DEFAULT_NEWSLETTER, getSettings, DEFAULT_SETTINGS,
  getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS,
} from '@/lib/sitedata';
import Icone from '@/components/raposa/Icone';
import Figura from '@/components/raposa/Figura';
import { TituloSecao } from '@/components/raposa/Cabecalho';
import Rotulo from '@/components/raposa/Rotulo';

/**
 * Cartas da Raposa: a inscrição na newsletter.
 *
 * O site é estático, então o e-mail vai direto para o serviço escolhido no
 * painel (Admin → Cartas): Buttondown, um formulário qualquer (MailerLite,
 * Kit, Brevo, Google Forms) ou o Substack. Enquanto nenhum foi escolhido, o
 * formulário diz a verdade: as cartas começam em breve, e quem quiser pode
 * pedir o aviso pelo WhatsApp.
 *
 * LGPD: o consentimento é uma caixa que a pessoa marca; nunca vem marcada.
 */
export const CONSENT_TEXT =
  'Aceito receber por e-mail as Cartas da Raposa e li a Política de Privacidade. Sei que posso sair quando quiser.';

export function FormularioCartas({ source = 'site', tom = 'claro', compacto = false }) {
  const cfg = useSitedata(getNewsletterConfig, DEFAULT_NEWSLETTER, SITEDATA_KEYS.newsletter);
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const txt = { ...DEFAULT_HOMEPAGE.newsletter, ...(home?.newsletter || {}) };
  const inputId = useId();
  const consentId = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const provedor = cfg?.provedor || 'nenhum';
  const whats = String(settings.whatsappNumber || '').replace(/\D/g, '');
  const escuro = tom === 'escuro';

  async function enviar(e) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setStatus('error');
      setMessage('Confere o e-mail: parece que falta alguma coisa.');
      return;
    }
    if (!consent) {
      setStatus('error');
      setMessage('Marque a caixinha de consentimento para continuar.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      if (provedor === 'substack' && cfg.substackEndereco) {
        const base = cfg.substackEndereco.replace(/\/$/, '');
        const url = `${base.startsWith('http') ? base : `https://${base}`}/subscribe?email=${encodeURIComponent(email.trim())}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        let acao = '';
        let campo = 'email';
        if (provedor === 'buttondown' && cfg.buttondownUsuario) {
          acao = `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(cfg.buttondownUsuario)}`;
        } else if (provedor === 'formulario' && cfg.formularioAcao) {
          acao = cfg.formularioAcao;
          campo = cfg.formularioCampoEmail || 'email';
        }
        if (!acao) throw new Error('sem provedor');
        const fd = new FormData();
        fd.append(campo, email.trim());
        if (provedor === 'buttondown') fd.append('tag', source);
        // no-cors: o serviço recebe, mas a resposta é opaca. Se a rede
        // falhar, o fetch lança e cai no erro abaixo.
        await fetch(acao, { method: 'POST', body: fd, mode: 'no-cors' });
      }
      setStatus('success');
      setMessage(txt.successMessage);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(txt.errorMessage);
    }
  }

  if (provedor === 'nenhum') {
    const msg = encodeURIComponent(`Oi! Quero receber as ${cfg.nome || 'Cartas da Raposa'} quando começarem.`);
    return (
      <div className={`rounded-2xl p-5 sm:p-6 ${escuro ? 'bg-bg-card' : 'bg-bg-card border border-linha'}`}>
        <p className="font-serif text-[1.25rem] font-semibold text-text-bright">As cartas começam em breve.</p>
        <p className="mt-1.5 font-body text-[0.98rem] text-text">Ainda estou arrumando a escrivaninha. Quer o aviso da primeira?</p>
        <div className="btn-row mt-4">
          {whats && (
            <a href={`https://wa.me/${whats}?text=${msg}`} target="_blank" rel="noopener noreferrer" className={`btn ${escuro ? 'btn--ouro' : 'btn--solid'}`}>
              <Icone nome="whatsapp" size={18} /> Me avise pelo WhatsApp
            </a>
          )}
          {settings.instagramLink && (
            <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              <Icone nome="instagram" size={18} /> Seguir no Instagram
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="w-full">
      <label htmlFor={inputId} className="sr-only">Seu e-mail</label>
      <div className={`flex flex-col sm:flex-row gap-2.5 ${compacto ? '' : 'sm:items-stretch'}`}>
        <div className={`flex-1 flex items-center gap-3 rounded-full px-5 h-[54px] border-[1.5px] transition-colors focus-within:border-[var(--acento)] ${escuro ? 'bg-bg-card border-linha' : 'bg-[var(--cartao)] border-linha'}`}>
          <Icone nome="carta" size={19} className="text-text-dim shrink-0" />
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 bg-transparent font-sans text-[16px] text-text-bright placeholder:text-text-faint focus:outline-none"
          />
        </div>
        <button type="submit" disabled={status === 'loading'} className={`btn ${escuro ? 'btn--ouro' : 'btn--solid'} h-[54px] disabled:opacity-70`}>
          {status === 'loading' ? txt.buttonLoadingLabel : txt.buttonLabel}
        </button>
      </div>
      <label htmlFor={consentId} className="mt-3 flex items-start gap-2.5 cursor-pointer font-sans text-[13.5px] leading-snug text-text-dim">
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[2px] w-4 h-4 accent-[var(--acento)] shrink-0"
        />
        <span>
          Aceito receber as cartas por e-mail e li a{' '}
          <Link href="/privacidade" className="underline underline-offset-2 hover:text-text-bright">Política de Privacidade</Link>. Dá para sair quando quiser.
        </span>
      </label>
      <p role="status" aria-live="polite" className={`mt-2 min-h-[1.25rem] font-sans text-[14px] ${status === 'error' ? 'text-rubedo' : 'text-accent'}`}>
        {message}
      </p>
    </form>
  );
}

/**
 * Seção completa das Cartas (home e fim dos ensaios): a raposa sob o
 * guarda-chuva e o formulário numa placa de papel velho.
 */
export default function Newsletter({ source = 'home', variante = 'secao' }) {
  const home = useSitedata(getHomepage, DEFAULT_HOMEPAGE, SITEDATA_KEYS.homepage);
  const t = { ...DEFAULT_HOMEPAGE.newsletter, ...(home?.newsletter || {}) };

  if (variante === 'post') {
    return (
      <aside className="relative overflow-hidden rounded-[26px] bg-[var(--papel-velho)] px-6 py-8 sm:px-10 sm:py-10 my-14" data-reading-hide="true">
        <Figura nome="fig/raposa-wagasa" alt="" className="pointer-events-none absolute -right-4 -bottom-3 w-[140px] sm:w-[190px] opacity-95" />
        <div className="relative max-w-[520px]">
          <Rotulo className="mb-3">{t.eyebrow}</Rotulo>
          <p className="font-serif text-[1.7rem] leading-[1.08] font-bold text-text-bright" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            {t.title} <em className="italic text-accent-bright">{t.emphasis}</em>
          </p>
          <p className="mt-3 mb-5 font-body text-[1rem] leading-relaxed text-text">{t.lead}</p>
          <FormularioCartas source={source} />
        </div>
      </aside>
    );
  }

  return (
    <section id="cartas" className="relative overflow-hidden py-20 sm:py-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--papel-velho)] grid lg:grid-cols-[1fr_0.8fr] items-center">
          <div
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'radial-gradient(circle at 12px 24px, transparent 9px, rgb(107 74 53 / 0.18) 9.5px, rgb(107 74 53 / 0.18) 11px, transparent 11.5px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative p-7 sm:p-12 lg:p-14">
            <Rotulo className="mb-4">{t.eyebrow}</Rotulo>
            <TituloSecao antes={t.title} pivo={t.emphasis} tamanho="text-[clamp(2rem,4vw,3.2rem)]" />
            <p className="mt-4 mb-7 font-body text-[1.08rem] leading-relaxed text-text max-w-[48ch]">{t.lead}</p>
            <FormularioCartas source={source} />
          </div>
          <div className="relative h-[280px] lg:h-full lg:min-h-[440px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] max-w-[380px] aspect-square rounded-full bg-[var(--nevoa)]" />
            <Figura nome="fig/raposa-wagasa" alt="A raposa sob o guarda-chuva, na chuva com sol" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[62%] max-w-[330px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
