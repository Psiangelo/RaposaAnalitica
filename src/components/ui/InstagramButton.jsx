'use client';

import Button, { InstagramIcon } from '@/components/ui/Button';
import { getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS } from '@/lib/sitedata';
import { useSitedata } from '@/lib/useSitedata';
import { useVisibility } from '@/lib/useVisibility';

/**
 * InstagramButton — convite para seguir o perfil, reutilizado nos três blocos
 * de autor (AuthorBand, AuthorBox, About) sem repetir o mesmo JSX três vezes.
 *
 * O link vem de `getSettings().instagramLink` (Admin → Configurações →
 * Contato e Redes Sociais) — nunca hardcoded aqui. Se o campo estiver vazio
 * o botão simplesmente não renderiza, então o dono pode desligar o convite
 * removendo o link no painel. Também respeita a chave de visibilidade
 * `autorInstagram` (Admin → Visibilidade → Blog): desligada, o botão some
 * dos 3 blocos de autor mesmo com o link preenchido.
 *
 * Usa o desenho de botão único do site (`Button`, variant="outline" por
 * padrão): sóbrio, dourado, sem as cores de marca do Instagram — o ícone
 * (câmera + lente) é o único elemento de reconhecimento.
 */
export default function InstagramButton({
  label = 'Acompanhe no Instagram',
  variant = 'outline',
  size = 'md',
  className = '',
}) {
  const settings = useSitedata(getSettings, DEFAULT_SETTINGS, SITEDATA_KEYS.settings);
  const { visibility: v } = useVisibility();
  const href = settings.instagramLink;

  if (!href || v.autorInstagram === false) return null;

  return (
    <Button href={href} variant={variant} size={size} iconLeft={<InstagramIcon />} className={className}>
      {label}
      <span className="sr-only"> (abre em nova aba)</span>
    </Button>
  );
}
