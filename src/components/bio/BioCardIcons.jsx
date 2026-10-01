/**
 * Ícones das placas do /bio: os ícones da floresta (Icone.jsx).
 * Nomes antigos do Psiangelo (feather, mandala, scroll…) continuam valendo.
 */
import Icone, { resolveIcone, ICONE_ROTULO } from '@/components/raposa/Icone';

const OPCOES = [
  'pincel', 'mascara', 'torii', 'lupa', 'carta', 'sacola', 'livro', 'pergaminho', 'lanterna', 'raposa',
  'ema', 'caminho', 'olho', 'ouvir', 'coruja', 'sakura', 'lua', 'estrela', 'whatsapp', 'instagram', 'email',
];

export const BIO_ICON_OPTIONS = [{ value: '', label: '— sem ícone —' }, ...OPCOES.map((v) => ({ value: v, label: ICONE_ROTULO[v] || v }))];

export function BioCardIcon({ name, className = '' }) {
  if (!resolveIcone(name)) return null;
  const svg = <Icone nome={name} size={48} />;
  return className ? <div className={className}>{svg}</div> : svg;
}

export function hasBioIcon(name) {
  return !!resolveIcone(name);
}

/** Adivinha o ícone pelo endereço e pelo texto do link. */
export function inferBioIcon(link) {
  if (!link) return null;
  if (link.icon && resolveIcone(link.icon)) return link.icon;
  const href = (link.href || '').toLowerCase();
  const blob = `${link.label || ''} ${link.description || ''}`.toLowerCase();
  if (/wa\.me|whatsapp/.test(href)) return 'whatsapp';
  if (/instagram\.com/.test(href)) return 'instagram';
  if (/^mailto:/.test(href)) return 'email';
  if (/\/blog|\/ensaio/.test(href)) return 'pincel';
  if (/\/verbete|\/glossario/.test(href)) return 'mascara';
  if (/\/trilha|\/estudo/.test(href)) return 'torii';
  if (/\/servico|\/pesquisa/.test(href)) return 'lupa';
  if (/\/loja|\/material|hotmart|kiwify|gumroad/.test(href)) return 'sacola';
  if (/\/newsletter|\/cartas|substack|buttondown/.test(href)) return 'carta';
  if (/\/sobre/.test(href)) return 'raposa';
  if (/youtu|spotify|podcast/.test(href)) return 'ouvir';
  if (/carta|newsletter|e-?mail/.test(blob)) return 'carta';
  if (/ensaio|texto|blog/.test(blob)) return 'pincel';
  if (/verbete|conceito/.test(blob)) return 'mascara';
  if (/trilha|começar|comecar/.test(blob)) return 'torii';
  if (/pesquisa|tcc|tese|dissert/.test(blob)) return 'lupa';
  if (/loja|material|guia|comprar/.test(blob)) return 'sacola';
  return 'raposa';
}
