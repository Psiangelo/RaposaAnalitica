/**
 * Icone — os ícones da floresta, desenhados para a interface da Raposa.
 *
 * Grade de 24 px, traço em currentColor (herda a cor do texto), pontas
 * redondas. São a versão pequena das figuras do banco: o torii, a lanterna,
 * a máscara, o leque. As figuras grandes (linoleogravura) ficam em
 * public/raposa/ e entram como imagem; estes ficam no código porque precisam
 * ser nítidos a 16 px e mudar de cor com o tema.
 *
 * Sem 'use client': renderiza igual no servidor e no navegador.
 */

const P = {
  torii: (
    <>
      <path d="M2.5 5.2c3.2 1.4 15.8 1.4 19 0" />
      <path d="M4.5 8.6h15" />
      <path d="M5.5 12h13" />
      <path d="M7.2 8.6V21M16.8 8.6V21M12 8.6V12" />
    </>
  ),
  lanterna: (
    <>
      <path d="M12 1.5v1.6" />
      <rect x="9" y="3.1" width="6" height="1.8" rx=".6" />
      <path d="M12 4.9c-3.9 0-5.8 3.3-5.8 7.6s1.9 7.6 5.8 7.6 5.8-3.3 5.8-7.6-1.9-7.6-5.8-7.6z" />
      <path d="M6.7 9h10.6M6.2 12.5h11.6M6.7 16h10.6" />
      <rect x="9" y="20.1" width="6" height="1.8" rx=".6" />
    </>
  ),
  pergaminho: (
    <>
      <path d="M5.5 6.5h13v11h-13z" />
      <path d="M3.5 5v14M20.5 5v14" />
      <path d="M8.5 10h7M8.5 12.8h7M8.5 15.2h4.5" />
    </>
  ),
  mascara: (
    <>
      <path d="M5 3.2 8.3 8h7.4L19 3.2l1.2 9c0 5-3.6 8.6-8.2 8.6s-8.2-3.6-8.2-8.6z" />
      <path d="M7.9 12.4c.9.2 1.8.6 2.4 1.2M16.1 12.4c-.9.2-1.8.6-2.4 1.2" />
      <path d="M12 16.6v.8" />
      <path d="M10.3 18.6c.6.4 1.1.5 1.7.5s1.1-.1 1.7-.5" />
    </>
  ),
  ginkgo: (
    <>
      <path d="M12 21.5V13" />
      <path d="M12 13c-4.8 0-8.6-3.4-8.6-7.4 2.9 1 5.8.2 8.6-2.6 2.8 2.8 5.7 3.6 8.6 2.6 0 4-3.8 7.4-8.6 7.4z" />
      <path d="M12 3v4.5" />
    </>
  ),
  bordo: (
    <>
      <path d="m12 2.5 1.8 4.6 3.7-1.8-.9 4.6 4 .9-3.4 2.9 1 3.1-3.8-1-1 3.5-1.4-3.6-1.4 3.6-1-3.5-3.8 1 1-3.1-3.4-2.9 4-.9-.9-4.6 3.7 1.8z" />
      <path d="M12 15.5v6" />
    </>
  ),
  pincel: (
    <>
      <path d="M20.5 3.5 12.6 11.4" />
      <path d="M12.6 11.4c-2.8-.4-6.8 1.6-8.1 9.1 7.5-1.3 9.5-5.3 9.1-8.1z" />
      <path d="M10.6 13.4l1 1" />
    </>
  ),
  sino: (
    <>
      <path d="M12 2v3" />
      <circle cx="12" cy="13" r="7.2" />
      <path d="M4.9 12.6h14.2" />
      <circle cx="12" cy="16.6" r="1.1" />
    </>
  ),
  lua: <path d="M19.6 14.8A8 8 0 1 1 9.2 4.4a6.3 6.3 0 0 0 10.4 10.4z" />,
  bambu: (
    <>
      <path d="M9 2v20M15.2 4.5V22" />
      <path d="M7.4 7.5h3.2M7.4 14.5h3.2M13.6 10.5h3.2M13.6 17h3.2" />
      <path d="M15.2 10.5c1.6-2.8 3.6-4 6-4.2-.9 2.2-2.8 3.6-6 4.2zM9 13.5c-1.6-2.5-3.6-3.4-6-3.4.9 2 2.8 3.2 6 3.4z" />
    </>
  ),
  cogumelo: (
    <>
      <path d="M3 12.5C3 7.8 7 4.5 12 4.5s9 3.3 9 8z" />
      <path d="M9.2 12.5v6a2.8 2.8 0 0 0 5.6 0v-6" />
      <circle cx="9" cy="8.8" r=".9" />
      <circle cx="14.6" cy="8" r="1.1" />
    </>
  ),
  livro: (
    <>
      <path d="M5 3.5h12.5v17H5z" />
      <path d="M8 3.5v17" />
      <path d="M5.8 6.5h1.4M5.8 10.5h1.4M5.8 14.5h1.4M5.8 18h1.4" />
      <path d="M11 8h4M11 11h4" />
    </>
  ),
  carta: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.6" />
      <path d="m3.4 6 8.6 7 8.6-7" />
      <circle cx="12" cy="15.8" r="1.8" />
    </>
  ),
  sacola: (
    <>
      <path d="M4.8 8h14.4l-1.1 13H5.9z" />
      <path d="M9 10V6.4a3 3 0 0 1 6 0V10" />
    </>
  ),
  lupa: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 5.6 5.6" />
    </>
  ),
  olho: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  selo: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.2" transform="rotate(-6 12 12)" />
      <path d="M9 9.5h6M12 9.5v6M9.2 15.2h5.6" />
    </>
  ),
  balanca: (
    <>
      <path d="M12 3v18M7 21h10M5 6.5h14" />
      <path d="m5 6.5-3 6.5a3.2 3.2 0 0 0 6 0zM19 6.5l-3 6.5a3.2 3.2 0 0 0 6 0z" />
    </>
  ),
  raposa: (
    <>
      <path d="M3.5 3.5 8 9h8l4.5-5.5V12L12 20.5 3.5 12z" />
      <path d="M8.3 12.6l1.6.6M15.7 12.6l-1.6.6" />
      <path d="M11.2 17h1.6" />
    </>
  ),
  cauda: (
    <>
      <path d="M3 19c4.5 1 9.5-.4 13-4.5S20.6 5.2 19.2 3c-1.4 3.4-4 4.6-6.6 6.4C9 11.8 5.6 14 3 19z" />
      <path d="M16.4 6.6c1-.6 2-1.6 2.8-3.6" />
    </>
  ),
  fogo: (
    <path d="M12 21.5c3.9 0 6.8-2.9 6.8-6.8 0-4.6-4.2-6.6-4.8-11.2-2.8 1.8-4.2 4.6-4 7.2-1.2-.7-2-2-2.2-3.6-1.8 2-2.6 4.6-2.6 7.6 0 3.9 2.9 6.8 6.8 6.8z" />
  ),
  onda: (
    <>
      <path d="M2 20a10 10 0 0 1 20 0" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M9 20a3 3 0 0 1 6 0" />
    </>
  ),
  estrela: <path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4l-5.3 3 1.2-6-4.5-4.1 6-.7z" />,
  pegada: (
    <>
      <path d="M12 12.5c-3 0-5.5 2.6-5.5 5 0 1.8 1.5 3 3.2 3 1 0 1.6-.5 2.3-.5s1.3.5 2.3.5c1.7 0 3.2-1.2 3.2-3 0-2.4-2.5-5-5.5-5z" />
      <ellipse cx="5.2" cy="10.2" rx="1.6" ry="2.1" />
      <ellipse cx="9.2" cy="6.4" rx="1.6" ry="2.2" />
      <ellipse cx="14.8" cy="6.4" rx="1.6" ry="2.2" />
      <ellipse cx="18.8" cy="10.2" rx="1.6" ry="2.1" />
    </>
  ),
  cha: (
    <>
      <path d="M3 10.5h18a9 8 0 0 1-18 0z" />
      <path d="M9 19.6h6" />
      <path d="M9.5 2.8c-.8 1 .8 2 0 3.2M14.5 2.8c-.8 1 .8 2 0 3.2" />
    </>
  ),
  montanha: (
    <>
      <path d="m2 20 7.5-13 4.2 7 2.6-3.8L22 20z" />
      <path d="M7.2 11l1.6.9 1.4-1 1 1" />
    </>
  ),
  nuvem: (
    <path d="M6.5 18.5a4 4 0 0 1-.4-8 6 6 0 0 1 11.6-1.2 4.6 4.6 0 0 1 .3 9.2z" />
  ),
  sakura: (
    <>
      <path d="M12 12c-2.2-1.6-3.2-4.2-2-6.6.6.5 1.3.7 2 .4.7.3 1.4.1 2-.4 1.2 2.4.2 5-2 6.6z" />
      <path d="M12 12c2.6-.8 5.4 0 6.7 2.3-.7.3-1.1.9-1.2 1.6-.4.6-1 .9-1.8.9-1.9 1.8-4.6 1.6-3.7-4.8z" />
      <path d="M12 12c-2.6-.8-5.4 0-6.7 2.3.7.3 1.1.9 1.2 1.6.4.6 1 .9 1.8.9 1.9 1.8 4.6 1.6 3.7-4.8z" />
      <circle cx="12" cy="12" r=".9" />
    </>
  ),
  ema: (
    <>
      <path d="M4 9.5 12 4l8 5.5V20H4z" />
      <path d="M12 4V1.8" />
      <path d="M7.5 12.5h9M7.5 15.5h6" />
    </>
  ),
  leque: (
    <>
      <path d="M12 20 3 9.5a12.5 12.5 0 0 1 18 0z" />
      <path d="M12 20 7.5 6.2M12 20V5.4M12 20l4.5-13.8" />
    </>
  ),
  arvore: (
    <>
      <path d="M12 21.5V13" />
      <path d="M12 16l-3.2-2.4M12 14.5l3-2" />
      <path d="M7 13.5a4.5 4.5 0 0 1-.6-8.9 5.6 5.6 0 0 1 11.2 0 4.5 4.5 0 0 1-.6 8.9z" />
    </>
  ),
  caminho: (
    <>
      <path d="M8 21.5c0-3 8-4 8-7.5S8 10 8 6.5 11 2.5 12 2.5" strokeDasharray="2.4 2.6" />
      <circle cx="16.5" cy="5" r="1.6" />
    </>
  ),
  chave: (
    <>
      <circle cx="7.5" cy="15.5" r="4.2" />
      <path d="m10.5 12.5 9-9M16 7l2.5 2.5M18.5 4.5 21 7" />
    </>
  ),
  vagalume: (
    <>
      <circle cx="12" cy="14.5" r="3.4" />
      <path d="M12 11.1V9M10 9.2c-2.5-2-4.8-1.8-6-1 1.4 1.8 3.6 2.6 6 1zM14 9.2c2.5-2 4.8-1.8 6-1-1.4 1.8-3.6 2.6-6 1z" />
      <path d="M12 3.5v1.8M5 14.5H3.2M20.8 14.5H19" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  seta: <path d="M4 12h15.5M13.5 6l6 6-6 6" />,
  setaVolta: <path d="M20 12H4.5M10.5 6l-6 6 6 6" />,
  externo: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </>
  ),
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 5.6 5.6" />
    </>
  ),
  check: <path d="m4.5 12.5 4.8 4.8L19.5 7" />,
  ouvir: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13.5" width="4.2" height="6.5" rx="1.4" />
      <rect x="16.8" y="13.5" width="4.2" height="6.5" rx="1.4" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r=".7" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 4.8 16A8.6 8.6 0 1 1 8 19.2z" />
      <path d="M9.2 8.6c.2-.5.5-.6.8-.6h.6c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.5.8 1.2 1.6 2.2 2.1.3.1.4.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.6.8c.3.1.4.2.4.4 0 .5-.2 1.4-1 1.7-.8.4-1.8.4-3.4-.4-1.9-1-3.4-2.7-4-4-.6-1.3-.4-2.4.4-3z" />
    </>
  ),
  email: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="1.6" />
      <path d="m3.4 6 8.6 7 8.6-7" />
    </>
  ),
  coruja: (
    <>
      <path d="M5 4.5 8 7a7 7 0 0 1 8 0l3-2.5V14a7 7 0 0 1-14 0z" />
      <circle cx="9.2" cy="11.5" r="2" />
      <circle cx="14.8" cy="11.5" r="2" />
      <path d="m12 13.6-.8 1.4h1.6z" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </>
  ),
  ponte: (
    <>
      <path d="M2 14c4-4.5 16-4.5 20 0" />
      <path d="M2 17.5h20M5.5 11.8v5.7M18.5 11.8v5.7M12 10v7.5" />
    </>
  ),
  daruma: (
    <>
      <path d="M12 3c-4.6 0-7.5 3.8-7.5 9.2S7.4 21 12 21s7.5-3.4 7.5-8.8S16.6 3 12 3z" />
      <ellipse cx="12" cy="10" rx="4.2" ry="3.4" />
      <circle cx="10.4" cy="9.8" r=".9" fill="currentColor" />
      <circle cx="13.6" cy="9.8" r=".9" />
    </>
  ),
};

/** Nomes antigos (Psiangelo) → ícone da floresta, para dados já salvos. */
const APELIDOS = {
  compass: 'caminho', spiral: 'onda', flame: 'fogo', eye: 'olho', key: 'chave', mountain: 'montanha',
  bridge: 'ponte', vessel: 'cha', labyrinth: 'caminho', sun: 'sol', moon: 'lua', tree: 'arvore',
  anchor: 'sino', star: 'estrela', gate: 'torii', mirror: 'lua', book: 'livro', map: 'caminho',
  video: 'olho', essay: 'pincel', quote: 'pergaminho', headphones: 'ouvir', cartography: 'caminho',
  ritual: 'torii', scroll: 'pergaminho', lantern: 'lanterna', threshold: 'torii', feather: 'pincel',
  mandala: 'sakura', lunar: 'lua', solar: 'sol', column: 'torii', heart: 'sakura', search: 'lupa',
};

export const ICONES = Object.keys(P);

export const ICONE_ROTULO = {
  torii: 'Torii', lanterna: 'Lanterna', pergaminho: 'Pergaminho', mascara: 'Máscara', ginkgo: 'Ginkgo',
  bordo: 'Bordo', pincel: 'Pincel', sino: 'Sino', lua: 'Lua', bambu: 'Bambu', cogumelo: 'Cogumelo',
  livro: 'Livro', carta: 'Carta', sacola: 'Sacola', lupa: 'Lupa', olho: 'Olho', selo: 'Selo',
  balanca: 'Balança', raposa: 'Raposa', cauda: 'Cauda', fogo: 'Fogo-de-raposa', onda: 'Onda',
  estrela: 'Estrela', pegada: 'Pegada', cha: 'Chá', montanha: 'Montanha', nuvem: 'Nuvem', sakura: 'Sakura',
  ema: 'Ema', leque: 'Leque', arvore: 'Árvore', caminho: 'Caminho', chave: 'Chave', vagalume: 'Vaga-lume',
  relogio: 'Relógio', coruja: 'Coruja', sol: 'Sol', ponte: 'Ponte', daruma: 'Daruma', ouvir: 'Ouvir',
  instagram: 'Instagram', whatsapp: 'WhatsApp', email: 'E-mail',
};

export function resolveIcone(nome) {
  if (P[nome]) return nome;
  if (APELIDOS[nome]) return APELIDOS[nome];
  return null;
}

export function iconePaths(nome) {
  const n = resolveIcone(nome);
  return n ? P[n] : null;
}

export default function Icone({ nome, size = 20, strokeWidth, className = '', style, titulo }) {
  const n = resolveIcone(nome) || 'raposa';
  const sw = strokeWidth ?? (size >= 48 ? 1.25 : size >= 28 ? 1.45 : 1.65);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo || undefined}
    >
      {P[n]}
    </svg>
  );
}
