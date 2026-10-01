// ============================================================
// TRILHAS DE ESTUDO
// Cada trilha é uma sequência sugerida de materiais + cursos +
// posts do blog, organizada por intenção do leitor.
// "stages" são fases ordenadas; cada stage referencia ids reais
// quando existirem (linkando), ou texto livre quando não.
// ============================================================

export const trilhas = [
  {
    id: 'comecando-em-jung',
    name: 'Começando em Jung',
    subtitle: 'Para quem está chegando agora à psicologia analítica',
    area: 'psicologia-junguiana',
    icon: 'gate',
    archetype: 'Persona',          // tom da paleta (Persona = clareza)
    duration: '4 a 6 semanas',
    level: 'Introdutório',
    stages: [
      {
        title: 'I · Antes do Jung',
        kind: 'leitura',
        icon: 'scroll',
        detail: 'Familiarize-se com os termos básicos antes da obra primária. Esta trilha começa por uma leitura de transição.',
        material: 'pensamento-vivo-jung',
      },
      {
        title: 'II · Estrutura da consciência',
        kind: 'mapa',
        icon: 'map',
        detail: 'O ponto de partida: como Jung entendia ego, complexo e consciência. Mapa mental denso, leve no consumo.',
        material: 'consciencia-complexo-ego',
      },
      {
        title: 'III · Os tipos psicológicos',
        kind: 'mapa',
        icon: 'map',
        detail: 'Atitudes (extroversão/introversão) e funções. A tipologia é a base para entender qualquer fenômeno clínico em Jung.',
        material: 'extroversao-introversao',
      },
      {
        title: 'IV · Cartografia interativa',
        kind: 'extra',
        icon: 'cartography',
        detail: 'Volte à home e explore o mapa de conceitos para ver como tudo se conecta antes de aprofundar.',
        href: '/#cartografia',
      },
    ],
  },
  {
    id: 'aprofundando-na-clinica',
    name: 'Aprofundando na clínica',
    subtitle: 'Para quem já atende e quer afiar o olhar junguiano',
    area: 'psicologia-junguiana',
    icon: 'vessel',
    archetype: 'Self',
    duration: '6 a 8 semanas',
    level: 'Intermediário',
    stages: [
      {
        title: 'I · A obra clínica primária',
        kind: 'livro',
        icon: 'book',
        detail: 'O Volume XVI/1 das Obras Completas é onde a clínica junguiana se expõe. Comece pelo livro completo ou capítulo a capítulo.',
        material: 'pratica-psicoterapia',
      },
      {
        title: 'II · A arte de interpretar',
        kind: 'leitura',
        icon: 'scroll',
        detail: 'Hermenêutica aplicada à clínica — como ler o material que aparece na sessão sem reduzir ao já-sabido.',
        material: 'hermeneutica-psicologia',
      },
      {
        title: 'III · Equação pessoal',
        kind: 'mapa',
        icon: 'map',
        detail: 'Como sua subjetividade afeta a sessão. Útil para autosupervisão.',
        material: 'equacao-pessoal',
      },
      {
        title: 'IV · Neurose e fim de análise',
        kind: 'mapa',
        icon: 'map',
        detail: 'Os fatores terapêuticos e os critérios para finalizar o processo analítico.',
        material: 'neurose-fatores-terapeuticos',
      },
    ],
  },
  {
    id: 'supervisao-pratica-deliberada',
    name: 'Supervisão e prática deliberada',
    subtitle: 'Método de aprimoramento contínuo para psicoterapeutas',
    area: 'psicologia-junguiana',
    icon: 'mirror',
    archetype: 'Anima',
    duration: 'Contínuo',
    level: 'Avançado',
    stages: [
      {
        title: 'I · Diagnóstico e tipologia',
        kind: 'mapa',
        icon: 'map',
        detail: 'Atitude, tipologia e diagnóstico — base para identificar padrões nos pacientes e em si mesmo.',
        material: 'atitude-tipologia-diagnostico',
      },
      {
        title: 'II · Projeção',
        kind: 'mapa',
        icon: 'map',
        detail: 'O mecanismo central da clínica. Reconhecer projeção é central para qualquer supervisão.',
        material: 'projecao',
      },
      {
        title: 'III · Equação pessoal',
        kind: 'mapa',
        icon: 'map',
        detail: 'Volte aqui sempre — a equação pessoal não se "resolve", se trabalha continuamente.',
        material: 'equacao-pessoal',
      },
      {
        title: 'IV · Grupo de prática',
        kind: 'extra',
        icon: 'ritual',
        detail: 'Supervisão e intervisão fazem diferença real. Entre em contato pelo WhatsApp para conhecer os grupos abertos.',
        href: 'https://wa.me/5581987349114',
      },
    ],
  },
];

// Tom de cor por arquétipo (consistente com Testimonials)
export const TRILHA_TONE = {
  Persona: { color: '#13211F', bg: 'rgb(var(--texto-forte-rgb)/0.08)', border: 'rgb(var(--texto-forte-rgb)/0.3)' },
  Self:    { color: '#2E5240', bg: 'rgb(var(--acento-rgb)/0.14)',  border: 'rgb(var(--acento-rgb)/0.4)' },
  Anima:   { color: '#962B24', bg: 'rgb(var(--ouro-rgb)/0.12)',  border: 'rgb(var(--ouro-rgb)/0.4)' },
  Sombra:  { color: '#962B24', bg: 'rgb(var(--rubedo-rgb)/0.12)',   border: 'rgb(var(--rubedo-rgb)/0.4)' },
};

// Ícone (string curta) por tipo de etapa
export const STAGE_KIND_LABEL = {
  livro:   'Livro',
  leitura: 'Leitura',
  mapa:    'Mapa mental',
  curso:   'Curso',
  ensaio:  'Ensaio',
  extra:   'Extra',
};
