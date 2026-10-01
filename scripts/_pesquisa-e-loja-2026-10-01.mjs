// Pesquisa e Loja refeitas a pedido do Gabriel (01/10/2026). Rodou uma vez;
// depois disso o conteúdo vive no site-content.json e no painel.
//
// Pesquisa: um serviço só (a pesquisa na obra inteira, em três níveis) e,
// ao lado, roteiros sobre Jung. Saíram as quatro peças do plano (§4.5).
// Loja: só o que o Vault Teoria já sustenta (17 conceitos com estudo da obra
// inteira, 21 livros com retrato), com nome de vitrine.
import fs from 'node:fs';

const FILE = 'src/data/site-content.json';
const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const d = snap.data;

d.raposa_admin_servicos = {
  hero: {
    eyebrow: 'Pesquisa sob encomenda',
    title: 'Vou pescar',
    emphasis: 'na obra por você',
    lead: 'Para quem escreve TCC, dissertação, tese ou artigo com Jung. Você me diz o tema; eu procuro em todos os volumes da Obra Completa e te devolvo o que ele escreveu sobre isso, com a obra e o parágrafo de cada coisa.',
    primaryLabel: 'Pedir um orçamento',
  },
  servico: {
    rotulo: 'Um serviço só',
    titulo: 'Uma pesquisa na obra inteira,',
    pivo: 'sobre o tema que você precisar',
    texto: 'Você me diz o tema e para que é. Eu procuro em todos os volumes da Obra Completa de Jung, inclusive nos lugares em que ele trata do assunto sem dizer o nome, e te devolvo tudo organizado: onde está, o que diz, como uma passagem conversa com a outra e por onde começar a ler.',
    temas: [
      { titulo: 'Um conceito', exemplo: 'sombra, anima, sincronicidade, individuação' },
      { titulo: 'Uma relação', exemplo: 'persona e sombra, o símbolo e a religião' },
      { titulo: 'Jung e outro campo', exemplo: 'a educação, a arte, o corpo, a política' },
      { titulo: 'Uma pergunta', exemplo: 'o que Jung pensa do casamento? e do mal?' },
    ],
    textoProprioTitulo: 'Já tem um texto?',
    textoProprio: 'Mande junto. Eu leio o que você escreveu para saber o que procurar, e a pesquisa volta apontada para ele: o que de Jung sustenta cada parte, o que complica, o que você ainda não usou e onde dá para ir mais fundo.',
  },
  pecas: [
    {
      id: 'essencial', nome: 'Essencial', pergunta: 'Para TCC, monografia e artigo',
      descricao: 'O mapa do tema na obra inteira: cada lugar em que Jung trata do assunto, com a obra e o parágrafo, em ordem de data, uma linha de contexto em cada um e os trechos decisivos citados. Fecha com um roteiro do que ler primeiro.',
      entrega: 'PDF com o mapa e o roteiro', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lupa', destaque: false, oculto: false,
    },
    {
      id: 'aprofundado', nome: 'Aprofundado', pergunta: 'Para mestrado e artigo de revista',
      descricao: 'Tudo do Essencial, mais a articulação: como a ideia nasce, como muda de um livro para outro, onde Jung se contradiz, com que conceitos ela conversa e o que isso abre para o seu argumento.',
      entrega: 'PDF com o mapa, a articulação e o roteiro', prazo: 'a combinar', preco: 'sob orçamento', icone: 'pergaminho', destaque: true, oculto: false,
    },
    {
      id: 'completo', nome: 'Completo', pergunta: 'Para doutorado e pesquisa de fôlego',
      descricao: 'Tudo do Aprofundado, mais as camadas: o que Jung escreveu sobre o tema em cada época, as passagens que tratam dele sem nomeá-lo, os conceitos vizinhos e os caminhos que cada um abre para a sua pesquisa. Depois da entrega, uma rodada de perguntas por escrito.',
      entrega: 'PDF completo e uma rodada de perguntas', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lanterna', destaque: false, oculto: false,
    },
  ],
  roteiros: {
    ativo: true,
    rotulo: 'Para quem faz conteúdo',
    titulo: 'Também escrevo',
    pivo: 'roteiros sobre Jung',
    texto: 'Para quem faz vídeo, podcast, aula ou post e quer falar de Jung sem errar: eu escrevo o roteiro sobre o tema que você escolher, com o que ele disse de verdade e a referência de cada coisa, no formato e no tempo que você precisa.',
    formatos: ['Vídeo e reels', 'Podcast', 'Carrossel e post', 'Aula e apresentação'],
    preco: 'sob orçamento',
    botao: 'Pedir um roteiro',
    whatsappMensagem: 'Oi! Vim pela página de pesquisa e queria um roteiro sobre Jung. Tema e formato: ',
  },
  passos: [
    { titulo: 'Você me conta o tema', texto: 'Pelo WhatsApp ou por e-mail: o tema, para que é (TCC, mestrado, doutorado, artigo), o prazo e, se tiver, o texto que já escreveu.' },
    { titulo: 'Eu devolvo escopo e preço', texto: 'Digo qual nível faz sentido, o que vou cobrir, quanto custa e quando entrego. Sem surpresa no meio.' },
    { titulo: 'Eu pesco na obra inteira', texto: 'Procuro em todos os volumes da Obra Completa e confiro cada achado na fonte antes de pôr na entrega.' },
    { titulo: 'Você recebe o PDF', texto: 'Com o método logo no começo: o que foi procurado, em que edição e o que ficou de fora. Dá para mostrar ao seu orientador.' },
  ],
  limites: [
    'Não escrevo o seu trabalho. O que eu entrego é material de pesquisa; quem escreve é você.',
    'Não colo a obra inteira sobre o tema. Os trechos decisivos vêm citados, o resto vem localizado e explicado. É melhor assim: quem cita numa tese precisa conferir na edição da própria bibliografia, e o parágrafo numerado é o mesmo em qualquer edição.',
    'Não interpreto caso clínico nem sonho de ninguém.',
    'Uso inteligência artificial para procurar, e digo isso de saída: o que você recebe é a minha leitura e o meu julgamento, conferidos na fonte.',
  ],
  cta: {
    titulo: 'Tem uma pergunta? Me conta.',
    texto: 'Conte o tema, o nível do trabalho e o prazo. A resposta vem com escopo e preço.',
    whatsappMensagem: 'Oi! Vim pela página de pesquisa da Raposa Analítica e queria um orçamento. Tema: ',
    email: d.raposa_admin_servicos?.cta?.email || '',
  },
};

const guia = (id, titulo, subtitulo, descricao, figura, extra = {}) => ({
  id, linha: 'guia', titulo, subtitulo, descricao, preco: 'R$ 67', precoAntigo: '', link: '', status: 'em-breve',
  capa: '', figura, formato: 'PDF', paginas: '', amostra: '', destaque: false, ...extra,
});
const leitura = (id, titulo, subtitulo, descricao, figura) => ({
  id, linha: 'leitura', titulo, subtitulo, descricao, preco: 'R$ 67', precoAntigo: '', link: '', status: 'em-breve',
  capa: '', figura, formato: 'PDF', paginas: '', amostra: '', destaque: false,
});

d.raposa_admin_loja = {
  hero: {
    eyebrow: 'Loja',
    title: 'Materiais para',
    emphasis: 'estudar Jung',
    lead: 'Tudo o que eu vendo sai da mesma mesa: a leitura da Obra Completa inteira, livro por livro, com a referência de cada coisa. Aqui ela vira material para você estudar no seu tempo, com o livro aberto do lado. Compra única, sem assinatura.',
  },
  avisoSemProdutos: 'Os primeiros materiais estão sendo escritos. Entre nas Cartas da Raposa e eu aviso quando abrirem.',
  prova: {
    rotulo: 'Da minha mesa',
    titulo: 'Antes de vender,',
    pivo: 'eu li',
    itens: [
      { numero: '17', texto: 'conceitos de Jung já estudados através da obra inteira, do primeiro livro ao último' },
      { numero: '21', texto: 'livros da Obra Completa estudados um a um: o que cada um faz e com quem Jung discute ali' },
      { numero: '§', texto: 'cada afirmação com a obra e o parágrafo, para você conferir na sua edição' },
    ],
  },
  avisoLegal: 'Material de estudo independente, sem vínculo com os herdeiros de Jung nem com as editoras. Não substitui o livro: foi feito para ser lido com ele.',
  linhas: [
    { id: 'guia', nome: 'Guias de conceito', descricao: 'Um conceito, ou uma família deles, atravessando a obra inteira: onde nasce, como muda, onde Jung se contradiz. Com o mapa, o roteiro de leitura e as fichas.', icone: 'mascara' },
    { id: 'leitura', nome: 'Leituras comentadas', descricao: 'Um livro de Jung acompanhado do começo ao fim: o que está acontecendo ali, com quem ele está discutindo e como aquilo se liga ao resto da obra.', icone: 'livro' },
    { id: 'colecao', nome: 'Coleção completa', descricao: 'Todos os guias numa compra só. O preço sobe a cada guia novo que entra: quem chega cedo paga menos.', icone: 'pergaminho' },
    { id: 'objeto', nome: 'Para levar', descricao: 'Coisas com a minha cara: camiseta, marcadores de página, o que vier.', icone: 'sacola' },
  ],
  produtos: [
    guia('guia-feminino-masculino', 'O feminino e o masculino em Jung', 'anima, animus, Eros, Logos e a sizígia',
      'A família inteira num guia só: o que Jung chama de anima e de animus, como os dois se juntam na sizígia e onde entram Eros e Logos. Onde cada ideia nasce, como muda de livro para livro e onde Jung se contradiz.',
      'mascara/fuji', { destaque: true }),
    guia('guia-sombra-persona', 'A sombra e a persona', 'a máscara e o que ela esconde',
      'Os dois conceitos que todo mundo cita e quase ninguém lê inteiros: o que Jung entende por persona, o que entende por sombra e por que um não se explica sem o outro.',
      'mascara/kuro'),
    guia('guia-inconsciente', 'O inconsciente', 'pessoal e coletivo',
      'O conceito que organiza todos os outros: a diferença entre o inconsciente pessoal e o coletivo, como Jung chegou a ela e o que muda de uma fase da obra para a outra.',
      'mascara/ai'),
    guia('guia-arquetipo-instinto', 'Arquétipo e instinto', 'as imagens e os impulsos',
      'O que Jung quis dizer com arquétipo, o que ele não quis dizer (e muita gente repete) e por que ele amarra a ideia ao instinto.',
      'mascara/koke'),
    guia('guia-ego-si-mesmo', 'Ego, consciência e si-mesmo', 'o centro que você conhece e o que você não conhece',
      'O ego como centro da consciência, o si-mesmo como centro da psique inteira e a relação entre os dois, que é onde Jung põe o sentido da vida psíquica.',
      'mascara/kin'),
    guia('guia-complexos', 'Os complexos', 'a teoria que veio antes de todas',
      'Do experimento de associação de palavras ao complexo autônomo: a ideia com que Jung começou e que continua sustentando o resto da obra.',
      'mascara/aka'),
    guia('guia-individuacao', 'Individuação', 'o caminho, sem autoajuda',
      'O que Jung chamou de individuação, em que livros ele desenvolve a ideia e o que ela não é: nem autoaperfeiçoamento, nem promessa de felicidade.',
      'obj/torii'),
    leitura('leitura-tipos', 'Para ler junto com Tipos Psicológicos', 'OC 6, do começo ao fim',
      'O livro mais citado e menos lido de Jung, acompanhado de perto: o problema que cada parte enfrenta, com quem Jung está discutindo e como os tipos se ligam ao resto da obra.',
      'obj/livro'),
    leitura('leitura-simbolos', 'Para ler junto com Símbolos da Transformação', 'OC 5, o livro da ruptura com Freud',
      'O livro que custou a amizade com Freud, lido com calma: o fio do argumento no meio dos mitos, o que mudou da primeira versão para a revisão de 1952 e onde já está o Jung que viria depois.',
      'obj/makimono'),
    leitura('leitura-sincronicidade', 'Para ler junto com Sincronicidade', 'OC 8/3, o ensaio mais difícil',
      'O ensaio em que Jung conversa com a física do seu tempo: o que ele está propondo, o que ele não está e como ler o experimento astrológico que fica no meio do texto.',
      'mata/lua-nuvem'),
    {
      id: 'colecao-guias', linha: 'colecao', titulo: 'Todos os guias de conceito', subtitulo: 'numa compra só, com o preço de quem chega cedo',
      descricao: 'Os guias da loja numa compra só. O preço sobe a cada guia novo que entra na coleção: quem entra cedo paga menos.',
      preco: 'R$ 197', precoAntigo: '', link: '', status: 'em-breve', capa: '', figura: 'kamon/raposa-claro', formato: 'PDF', paginas: '', amostra: '', destaque: false,
    },
    {
      id: 'camiseta-raposa', linha: 'objeto', titulo: 'Camiseta da raposa de óculos', subtitulo: 'a mesma do perfil, como gravura',
      descricao: 'A raposa de óculos e cachimbo estampada no estilo das gravuras da floresta.',
      preco: '', precoAntigo: '', link: '', status: 'rascunho', capa: '', figura: 'fig/perfil-raposa-oculos', formato: 'Camiseta', paginas: '', amostra: '', destaque: false,
    },
    {
      id: 'marcadores-kamon', linha: 'objeto', titulo: 'Marcadores de página', subtitulo: 'os brasões da floresta',
      descricao: 'Os kamon da Raposa Analítica em marcadores de papel grosso, para saber onde você parou na Obra Completa.',
      preco: '', precoAntigo: '', link: '', status: 'rascunho', capa: '', figura: 'kamon/ginkgo-claro', formato: 'Kit de marcadores', paginas: '', amostra: '', destaque: false,
    },
  ],
};

fs.writeFileSync(FILE, JSON.stringify(snap, null, 2) + '\n');
console.log('servicos:', d.raposa_admin_servicos.pecas.length, 'níveis · loja:', d.raposa_admin_loja.produtos.length, 'produtos');
