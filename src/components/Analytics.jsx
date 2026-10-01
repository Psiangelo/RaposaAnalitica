/**
 * Analytics — Plausible (privacy-friendly, ~1kb, GDPR/LGPD ok).
 *
 * Ativa quando NEXT_PUBLIC_PLAUSIBLE_DOMAIN está definido.
 * Exemplo: NEXT_PUBLIC_PLAUSIBLE_DOMAIN=psiangelo.github.io/Psiangelo
 *
 * Configurações opcionais:
 *   NEXT_PUBLIC_PLAUSIBLE_HOST  — host alternativo (self-host); default plausible.io
 */

export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io';

  if (!domain) return null;

  const src = `${host.replace(/\/$/, '')}/js/script.js`;

  return (
    <script
      defer
      data-domain={domain}
      src={src}
    />
  );
}
