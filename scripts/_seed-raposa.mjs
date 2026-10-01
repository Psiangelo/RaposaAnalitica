// Monta o primeiro conteúdo publicado da Raposa a partir do snapshot do
// Psiangelo (já com o prefixo raposa_admin_). Roda uma vez.
import fs from 'node:fs';

const FILE = 'src/data/site-content.json';
const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const d = snap.data;

// 1. o que não vem
for (const k of [
  'raposa_admin_auth_supabase', 'raposa_admin_therapy', 'raposa_admin_courses',
  'raposa_admin_course_categories', 'raposa_admin_testimonials', 'raposa_admin_faqs',
  'raposa_admin_coming_soon', 'raposa_admin_materials', 'raposa_admin_atlas_overrides',
  'raposa_admin_cartography_nodes', 'raposa_admin_cartography_edges',
]) delete d[k];

// 2. ensaios: capas próprias da Raposa (geradas em scripts/capas_raposa.py)
for (const p of d.raposa_admin_blog) {
  p.featured_image = `/images/ensaios/${p.slug}-horizontal.webp`;
  p.featured_cover = `/images/ensaios/${p.slug}-vertical.webp`;
  p.author = 'Raposa Analítica';
}

// 3. área das trilhas
d.raposa_admin_areas = [
  { id: 'psicologia-junguiana', slug: 'psicologia-junguiana', label: 'Psicologia Analítica', color: '#2E5240', icon: 'torii' },
];

// 4. categorias dos verbetes com a máscara de cada uma
d.raposa_admin_glossario_categories = [
  { slug: 'estrutura', label: 'Estrutura da psique', tone: 'accent', mascara: 'ai', ordem: 0 },
  { slug: 'arquetipos', label: 'Arquétipos', tone: 'citrinit', mascara: 'fuji', ordem: 1 },
  { slug: 'dinamica', label: 'Dinâmica psíquica', tone: 'bright', mascara: 'aka', ordem: 2 },
  { slug: 'processo', label: 'Processo de individuação', tone: 'accent', mascara: 'kin', ordem: 3 },
  { slug: 'alquimia', label: 'Alquimia psicológica', tone: 'citrinit', mascara: 'kuro', ordem: 4 },
  { slug: 'clinica', label: 'Clínica', tone: 'rubedo', mascara: 'shiro', ordem: 5 },
];

const WA = '5581987349114';
const IG = 'https://www.instagram.com/raposaanalitica/';

// 5. bio (linktree) e autor
d.raposa_admin_bio = {
  name: 'Raposa Analítica',
  tagline: 'Psicologia analítica · Jung',
  bio: 'Sou uma raposa estudante de psicologia. Leio a obra de Jung e conto aqui o que vou achando pelo caminho.',
  avatar: '/raposa/fig/perfil-raposa-oculos.webp',
  images: [],
  author: {
    name: 'Ângelo',
    credential: 'Estudante de psicologia · leitor de Jung',
    bio: 'Leio Jung faz um tempo, e aqui eu conto o que vou achando. Os ensaios, os verbetes e as trilhas saem de um estudo contínuo da Obra Completa, com a referência de cada coisa para você ir à fonte.',
    photo: { src: '/raposa/fig/perfil-raposa-oculos.webp', alt: 'A Raposa Analítica: uma raposa de óculos redondos e cachimbo' },
    disclaimer: 'Não atendo nem dou diagnóstico por aqui.',
  },
  links: [
    { label: 'Ensaios', href: '/blog', icon: 'pincel', accent: 'mata', description: 'Textos longos, uma pergunta de cada vez.', image: '', hidden: false },
    { label: 'Trilha para começar', href: '/trilhas', icon: 'torii', accent: 'torii', description: 'Por onde começar em Jung, e o que vem depois.', image: '', hidden: false },
    { label: 'Verbetes', href: '/verbetes', icon: 'mascara', accent: 'ai', description: 'Os conceitos de Jung, curtos e ligados entre si.', image: '', hidden: false },
    { label: 'Pesquisa sob encomenda', href: '/servicos', icon: 'lupa', accent: 'musgo', description: 'Para quem escreve TCC, dissertação ou tese com Jung.', image: '', hidden: false },
    { label: 'Cartas da Raposa', href: '/newsletter', icon: 'carta', accent: 'ouro', description: 'Um e-mail quando sai coisa nova.', image: '', hidden: false },
    { label: 'Converse comigo', href: `https://wa.me/${WA}`, icon: 'whatsapp', accent: 'noite', description: 'Dúvidas, encomendas e conversa.', image: '', hidden: false },
  ],
};

// 6. configurações
d.raposa_admin_settings = {
  siteTitle: 'Raposa Analítica',
  siteDescription: 'Ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, com a referência de cada coisa. Sou uma raposa e guio você pela floresta da psicologia analítica.',
  whatsappNumber: WA,
  whatsappMessage: 'Oi! Vim pelo site da Raposa Analítica.',
  instagramLink: IG,
  youtubeLink: '',
  emailAddress: '',
  accentColor: '#2E5240',
};

// 7. textos da página inicial
d.raposa_admin_homepage = {
  hero: {
    eyebrow: 'Psicologia analítica · a obra de Jung',
    titlePrefix: 'A floresta é o',
    titleEmphasis: 'inconsciente',
    tagline: 'e eu conheço as trilhas.',
    lead: 'Ensaios, verbetes e trilhas de leitura sobre Carl Gustav Jung, escritos devagar e com a referência de cada coisa, para você ir à fonte.',
    quote: 'A floresta escura e impenetrável como a profundeza da água e do mar é o continente do desconhecido e do mistério. É uma metáfora apropriada para o inconsciente.',
    quoteSource: 'OC 13 §241',
    primaryLabel: 'Ler os ensaios',
    primaryHref: '/blog',
    secondaryLabel: 'Começar uma trilha',
    secondaryHref: '/trilhas',
  },
  about: {
    title: 'Quem sou eu',
    paragraph1: 'Toda vez que alguém me compara com um bicho, escolhe a raposa. Então a raposa ficou. Sou estudante de psicologia e leio a obra de Jung de ponta a ponta, com um acervo de notas que cruza os volumes, as datas e os parágrafos.',
    paragraph2: 'Aqui eu conto o que vou achando: o que Jung disse mesmo, onde ele mudou de ideia, o que está escondido nas notas de rodapé e nas cartas. Tudo com a fonte, para você conferir.',
    paragraph3: 'No Livro Vermelho, Jung diz ao seu mestre interior, Filêmon, que no mínimo ele é uma raposa esperta, de quem dá para aprender alguma coisa. Por aqui, eu ainda estou aprendendo.',
    quoteText: 'O animal prestativo indica o caminho que leva ao templo.',
    quoteAuthor: 'Jung, OC 13 §241, nota 5 (paráfrase)',
    credentials: [
      { mark: '◆', label: 'Leitura', detail: 'Leitura sistemática da Obra Completa, em curso' },
      { mark: '◇', label: 'Escrita', detail: 'Ensaios, verbetes e trilhas públicos' },
      { mark: '◆', label: 'Estudo', detail: 'Condução de grupo de estudos' },
      { mark: '◇', label: 'Liga', detail: 'Presidência · Psicologia Analítica · UNICAP' },
    ],
    gostos: [
      { titulo: 'Mitologia', detalhe: 'e conto de fada, que o Jung levava a sério' },
      { titulo: 'Xadrez', detalhe: 'a coruja sempre ganha' },
      { titulo: 'Anime', detalhe: 'um episódio vira três' },
      { titulo: 'Escrever', detalhe: 'caderninho sempre por perto' },
      { titulo: 'Doce', detalhe: 'a kitsune da lenda gosta de tofu frito; eu prefiro doce' },
    ],
    milestones: [],
    images: [],
  },
  contact: {
    sectionLabel: 'Converse comigo',
    title: 'Bata no shoji',
    lead: 'Dúvida sobre um ensaio, pedido de pesquisa, ideia de parceria ou só vontade de conversar sobre Jung. Eu respondo.',
    primaryLabel: 'Canal principal',
    primaryHeadingPrefix: 'Pelo',
    primaryHeadingEmphasis: 'WhatsApp',
    primaryText: 'Me conta em poucas linhas o que você quer. Costumo responder no mesmo dia.',
    primaryButton: 'Abrir conversa',
    whatsappNumber: WA,
    instagramLabel: 'Instagram',
    instagramValue: '@raposaanalitica',
    instagramUrl: IG,
    emailLabel: 'E-mail',
    emailValue: '',
  },
  newsletter: {
    eyebrow: 'Cartas da Raposa',
    title: 'Uma carta quando eu',
    emphasis: 'acho alguma coisa.',
    lead: 'Ensaio novo, verbete novo, trilha nova, e de vez em quando um achado das notas de rodapé de Jung. Sem frequência fixa e sem enrolação.',
    buttonLabel: 'Quero receber',
    buttonLoadingLabel: 'Enviando…',
    successMessage: 'Pronto. A próxima carta chega no seu e-mail.',
    alreadySubscribedMessage: 'Você já está na lista. Obrigado.',
    errorMessage: 'Não deu para confirmar agora. Tenta de novo em instantes.',
  },
};

// 8. visibilidade, ordem da home e nomes do menu
d.raposa_admin_visibility = {
  home: true, blog: true, bio: true, estudos: true, glossario: true,
  servicos: true, loja: true, newsletter: true,
  ensaioDestaque: true, autor: true, about: true, contato: true,
  verbetesHome: true, servicosHome: true, lojaHome: true,
  blogAuthorBox: true, autorInstagram: true, whatsappFlutuante: true,
  cartografia: false, materiais: false,
};
d.raposa_admin_home_sections = ['hero', 'featuredEssay', 'blog', 'verbetes', 'estudos', 'servicos', 'newsletter', 'loja', 'about', 'contato'];
d.raposa_admin_home_sections_layout = 1;
d.raposa_admin_labels = {
  nav: { home: 'Início', blog: 'Ensaios', glossario: 'Verbetes', estudos: 'Trilhas', servicos: 'Pesquisa', loja: 'Loja', about: 'Sobre', newsletter: 'Cartas' },
  sections: {},
};

// 9. página das trilhas
const ep = d.raposa_admin_estudos_page || {};
ep.hero = {
  eyebrow: 'Trilhas de leitura',
  title: 'O caminho dos',
  emphasis: 'mil torii',
  kicker: 'Por onde começar, o que ler, em que ordem',
  lead: 'Cada trilha é um caminho com etapas: o que ler, o que observar e o que vem depois. Você marca o que já fez e eu guardo onde você parou.',
  primaryCtaLabel: 'Começar uma trilha',
  primaryCtaHref: '#trilhas',
  secondaryCtaLabel: 'Ver os verbetes',
  secondaryCtaHref: '/verbetes',
};
d.raposa_admin_estudos_page = ep;

// 10. página dos verbetes
d.raposa_admin_glossario_page = {
  hero: {
    eyebrow: 'Verbetes · psicologia analítica',
    title: 'As máscaras',
    emphasis: 'da floresta',
    kicker: 'Os conceitos de Jung, curtos e ligados entre si',
    lead: 'Cada verbete diz o essencial de um conceito e aponta para onde ele se liga. Dentro dos ensaios, o termo com um ? abre o verbete sem você sair da leitura.',
  },
  empty: { sectionLabel: 'Categorias', emptyMessage: 'Nenhum verbete ainda.' },
};

// 11. serviços para pesquisadores (do plano de negócio, §4.5)
d.raposa_admin_servicos = {
  hero: {
    eyebrow: 'Pesquisa sob encomenda',
    title: 'Vou pescar',
    emphasis: 'na obra por você',
    lead: 'Para quem escreve TCC, dissertação, tese ou artigo com Jung. Você traz a pergunta; eu volto com o que a Obra Completa tem sobre ela, localizado obra por obra e parágrafo por parágrafo.',
    primaryLabel: 'Pedir um orçamento',
  },
  pecas: [
    { id: 'localizacao', nome: 'Localização', pergunta: 'Onde Jung fala disso?', descricao: 'Tudo o que o acervo tem sobre o tema: obra, parágrafo, contexto de uma linha e ordem cronológica, para você ir direto à fonte.', entrega: 'Lista comentada em PDF', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lupa', destaque: false },
    { id: 'dossie', nome: 'Dossiê temático', pergunta: 'Como esse conceito anda pela obra?', descricao: 'A localização e mais a articulação: como o conceito se forma, onde se desloca, onde Jung se contradiz e onde os comentadores divergem.', entrega: 'Dossiê em PDF', prazo: 'a combinar', preco: 'sob orçamento', icone: 'pergaminho', destaque: false },
    { id: 'rastreio', nome: 'Jung disse mesmo?', pergunta: 'Essa frase é dele?', descricao: 'Rastreio de atribuição: os lugares a favor, os lugares contra e o veredito, com a referência de cada um. Serve para a frase famosa que ninguém sabe de onde veio.', entrega: 'Parecer curto em PDF', prazo: 'a combinar', preco: 'sob orçamento', icone: 'olho', destaque: false },
    { id: 'conferencia', nome: 'Conferência de fundamentação', pergunta: 'Minhas citações de Jung estão certas?', descricao: 'Você manda o capítulo; ele volta com cada atribuição a Jung conferida contra a fonte, com o parágrafo certo ou a correção. Erro de atribuição derruba na banca.', entrega: 'Seu texto anotado + relatório', prazo: 'a combinar', preco: 'sob orçamento', icone: 'selo', destaque: true },
  ],
  passos: [
    { titulo: 'Você manda a pergunta', texto: 'Pelo WhatsApp ou por e-mail: o tema, para que é (TCC, tese, artigo) e o prazo que você tem.' },
    { titulo: 'Eu devolvo escopo e preço', texto: 'Digo o que dá para cobrir, em que obras, quanto custa e quando entrego. Sem surpresa no meio.' },
    { titulo: 'A entrega vem com o método', texto: 'Todo PDF abre com um cabeçalho de método: o que foi varrido, em que edição, o que ficou de fora e por quê. Você pode mostrar ao seu orientador.' },
  ],
  limites: [
    'O que eu entrego é localização e articulação, com a citação curta do trecho decisivo. Nunca uma compilação de todas as citações: o localizador vale mais que o texto colado, porque você vai precisar conferir na edição da sua bibliografia.',
    'É material de fundamentação, não texto para a sua tese. Não escrevo trabalho acadêmico por ninguém.',
    'Não interpreto caso clínico nem sonho de ninguém.',
    'Uso inteligência artificial na produção, e digo isso de saída: o que você compra é a conferência e o julgamento, não a geração.',
  ],
  cta: {
    titulo: 'Tem uma pergunta? Me conta.',
    texto: 'Conte o tema, o tipo de trabalho e o prazo. A resposta vem com escopo e preço.',
    whatsappMensagem: 'Oi! Vim pela página de pesquisa da Raposa Analítica e queria um orçamento. Tema: ',
    email: '',
  },
};

// 12. loja (linhas de produto do plano, §4.2 a §4.4; tudo «em breve»)
d.raposa_admin_loja = {
  hero: {
    eyebrow: 'Loja',
    title: 'Materiais para',
    emphasis: 'estudar Jung',
    lead: 'Guias que atravessam a obra por um conceito, leituras comentadas para ler junto com o livro, e o que mais eu for fazendo. Compra única, para estudar no seu tempo.',
  },
  avisoSemProdutos: 'Os primeiros materiais estão sendo escritos. Entre nas Cartas da Raposa para saber quando abrirem.',
  linhas: [
    { id: 'guia', nome: 'Guias', descricao: 'Um conceito, ou uma família de conceitos, atravessando a obra inteira: onde nasce, como se desloca, onde Jung se contradiz.', icone: 'mascara' },
    { id: 'leitura', nome: 'Leituras comentadas', descricao: 'Uma obra, capítulo a capítulo, para ler junto com o livro.', icone: 'livro' },
    { id: 'cotejo', nome: 'Cotejos', descricao: 'Um pós-junguiano medido contra Jung: onde continua, onde rompe e se o rompimento se sustenta.', icone: 'balanca' },
    { id: 'objeto', nome: 'Objetos', descricao: 'Coisas com a minha cara: estampas, cadernos, o que vier.', icone: 'sacola' },
  ],
  produtos: [
    { id: 'guia-o-feminino', linha: 'guia', titulo: 'O feminino em Jung', subtitulo: 'anima, animus, Eros e sizígia', descricao: 'Um guia pela família de conceitos do feminino: o mapa, o roteiro de leitura e as fichas, com o parágrafo de cada coisa.', preco: '', link: '', status: 'em-breve', capa: '', figura: 'mascara/fuji', formato: 'PDF', destaque: true },
    { id: 'guia-a-sombra', linha: 'guia', titulo: 'A sombra', subtitulo: 'da obra inteira, com as datas', descricao: 'O conceito de sombra atravessando os volumes: onde nasce, como muda e onde os comentadores divergem.', preco: '', link: '', status: 'em-breve', capa: '', figura: 'mascara/kuro', formato: 'PDF', destaque: false },
    { id: 'leitura-tipos', linha: 'leitura', titulo: 'Leitura comentada de Tipos Psicológicos', subtitulo: 'para ler junto com o livro', descricao: 'Capítulo a capítulo: o que está acontecendo ali, a quem Jung responde e onde o texto se liga às outras obras.', preco: '', link: '', status: 'em-breve', capa: '', figura: 'obj/livro', formato: 'PDF', destaque: false },
  ],
};

// 13. newsletter: provedor ainda não escolhido
d.raposa_admin_newsletter = {
  nome: 'Cartas da Raposa',
  provedor: 'nenhum',
  buttondownUsuario: '',
  substackEndereco: '',
  formularioAcao: '',
  formularioCampoEmail: 'email',
  pagina: {
    eyebrow: 'Newsletter',
    title: 'Cartas da',
    emphasis: 'Raposa',
    lead: 'Uma carta quando eu acho alguma coisa na floresta: ensaio novo, verbete novo, trilha nova, e de vez em quando um achado das notas de rodapé de Jung.',
    itens: [
      { titulo: 'O que chega', texto: 'O aviso do que saiu no site, com duas linhas sobre por que vale a leitura.' },
      { titulo: 'O achado', texto: 'Uma coisa pequena e boa da obra: uma nota de rodapé, uma carta, uma mudança de ideia datada.' },
      { titulo: 'O que não chega', texto: 'Promoção toda semana, funil, sequência de e-mails automáticos. Você sai com um clique quando quiser.' },
    ],
  },
};

snap.version = Date.now();
snap.published_at = new Date().toISOString();
snap.note = 'Primeiro conteúdo da Raposa Analítica (a partir do Psiangelo)';
fs.writeFileSync(FILE, JSON.stringify(snap, null, 2));
console.log('ok', Object.keys(d).length, 'chaves; versão', snap.version, (fs.statSync(FILE).size / 1024).toFixed(0) + ' KB');
