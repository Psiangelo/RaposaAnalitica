/**
 * Glossário junguiano — termos fundamentais da psicologia analítica.
 *
 * Cada termo tem:
 *   slug: URL-friendly (/verbetes/<slug>)
 *   term: nome canônico
 *   aliases: variações (pra busca)
 *   short: definição de 1-2 linhas
 *   full: definição completa (parágrafos, markdown leve)
 *   related: { terms: [...slugs], materials: [...ids] }
 *   category: núcleo temático
 */

export const CATEGORIES = {
  estrutura: { label: 'Estrutura da psique', tone: 'accent' },
  arquetipos: { label: 'Arquétipos', tone: 'citrinit' },
  dinamica: { label: 'Dinâmica psíquica', tone: 'bright' },
  clinica: { label: 'Clínica', tone: 'rubedo' },
  processo: { label: 'Processo de individuação', tone: 'accent' },
  alquimia: { label: 'Alquimia psicológica', tone: 'citrinit' },
};

export const glossario = [
  {
    slug: 'self',
    term: 'Self',
    aliases: ['si-mesmo', 'si mesmo'],
    category: 'estrutura',
    short: 'Centro regulador da psique — totalidade que engloba consciente e inconsciente.',
    full: `O Self é, para Jung, o arquétipo da totalidade: centro e circunferência da psique ao mesmo tempo. Diferente do Ego — que é apenas o centro da consciência — o Self compreende tudo: pensamentos reconhecidos, afetos recalcados, tendências coletivas.

Fenomenologicamente, o Self aparece em sonhos e experiências numinosas como mandalas, figuras divinas ou símbolos de união de opostos. Não é algo a ser "conquistado", mas reconhecido — o processo de individuação é exatamente o diálogo progressivo entre Ego e Self.

Para a clínica: o sintoma muitas vezes é o Self "puxando" a consciência em direção a uma completude que o Ego resiste em aceitar.`,
    related: { terms: ['ego', 'individuacao', 'mandala'], materials: [] },
  },
  {
    slug: 'ego',
    term: 'Ego',
    aliases: ['eu'],
    category: 'estrutura',
    short: 'Sujeito da consciência — centro do campo consciente, não da psique toda.',
    full: `O Ego, para Jung, é o complexo central da consciência: o "eu" que vivencia, escolhe, lembra. Mas não é toda a psique — é apenas o campo iluminado por ela.

Um dos erros mais comuns (inclusive em clínica) é confundir Ego com Self. O Ego é serviçal, relativo; o Self é totalidade. Quando o Ego se infla e se toma pelo Self, temos o que Jung chamou de "inflação psíquica" — e tipicamente, um colapso subsequente.`,
    related: { terms: ['self', 'persona', 'complexo'], materials: ['consciencia-complexo-ego'] },
  },
  {
    slug: 'persona',
    term: 'Persona',
    aliases: ['máscara'],
    category: 'estrutura',
    short: 'Máscara social — o rosto que o Ego apresenta ao mundo.',
    full: `Persona é a interface entre o Ego e o coletivo. Todo mundo tem uma — e precisa ter: é o que nos permite atuar como "profissional", "filho", "terapeuta", sem despejar toda a nossa intimidade a cada contato.

O problema surge quando o Ego se identifica com a Persona — quando não há mais distinção entre "quem eu sou" e "o papel que desempenho". O terapeuta que só se experimenta como terapeuta, o pai que só se experimenta como pai: ali a Persona devorou o Ego.`,
    related: { terms: ['ego', 'sombra'], materials: [] },
  },
  {
    slug: 'sombra',
    term: 'Sombra',
    aliases: ['shadow'],
    category: 'arquetipos',
    short: 'Aquilo que o Ego rejeita em si — o "lado escuro" da personalidade.',
    full: `A Sombra é tudo o que o Ego considera incompatível consigo: impulsos, traços, desejos que foram recalcados no processo de formação da Persona. Não é necessariamente "mal" — é rejeitado.

Um analista agressivo, que se vê como gentil, projeta agressividade nos pacientes "difíceis". Um religioso devoto, que se vê como puro, enxerga tentação em toda mulher. A Sombra volta como projeção — e é clinicamente reconhecida quando o paciente (ou o próprio terapeuta) reage desproporcionalmente a um traço em alguém.

Integrar a Sombra não é "agir a partir dela", mas reconhecer que ela é sua, relativizando o que antes era visto como puramente externo.`,
    related: { terms: ['persona', 'projecao', 'individuacao'], materials: ['projecao'] },
  },
  {
    slug: 'anima',
    term: 'Anima',
    aliases: [],
    category: 'arquetipos',
    short: 'Imagem do feminino no inconsciente do homem — função de ligação com o inconsciente.',
    full: `Anima é, para Jung, a figuração arquetípica do feminino na psique masculina — aparece em sonhos, fantasias e projeções amorosas. Não é "a mulher real", mas uma imagem moldada por séculos de experiência coletiva e pela história pessoal com figuras femininas (primeiramente a mãe).

Na clínica, o terapeuta junguiano atento à Anima pergunta: quem é a mulher dos sonhos desse paciente? Como ele se relaciona com o feminino nele? Qual é o tom emocional que vem junto?

O desenvolvimento da Anima — de Eva (instinto) a Helena (romance), Maria (devoção) e Sofia (sabedoria) — é um mapa clássico do processo de diferenciação.`,
    related: { terms: ['animus', 'projecao', 'sizigia'], materials: [] },
  },
  {
    slug: 'animus',
    term: 'Animus',
    aliases: [],
    category: 'arquetipos',
    short: 'Imagem do masculino no inconsciente da mulher — frequentemente figurada como "a voz".',
    full: `Assim como Anima é a figura feminina no homem, Animus é a figuração do masculino na mulher. Jung descreveu-o frequentemente como "a voz" — a voz interna que julga, categoriza, opina.

Quando não integrado, aparece como convicção rígida ("todo mundo sabe que..."), discurso apropriado de figuras de autoridade, ou relações amorosas onde a mulher busca um "salvador-pensador". Integrado, é discernimento, palavra precisa, corte criativo.`,
    related: { terms: ['anima', 'sizigia'], materials: [] },
  },
  {
    slug: 'inconsciente-coletivo',
    term: 'Inconsciente coletivo',
    aliases: ['psique objetiva'],
    category: 'estrutura',
    short: 'Substrato psíquico comum à humanidade — onde os arquétipos residem.',
    full: `A grande descoberta de Jung, e o que o separou radicalmente de Freud. Enquanto o inconsciente pessoal contém material recalcado da biografia individual, o inconsciente coletivo contém padrões estruturantes compartilhados — os arquétipos.

A evidência empírica que Jung apresentou: motivos idênticos aparecendo em sonhos de pessoas sem contato com as mitologias que os contêm; paralelos entre delírios psicóticos e mitos antigos; imagens recorrentes na arte, na religião, nos contos de fada.

Não é um "banco de memórias herdadas" — é uma estrutura psíquica compartilhada, como o fato de todos nascermos com a mesma anatomia cerebral.`,
    related: { terms: ['arquetipo', 'self', 'mito-pessoal'], materials: ['hermeneutica-psicologia'] },
  },
  {
    slug: 'arquetipo',
    term: 'Arquétipo',
    aliases: [],
    category: 'arquetipos',
    short: 'Forma a priori — padrão estruturante no inconsciente coletivo.',
    full: `Arquétipos são *formas* — não conteúdos. Como o leito de um rio: o rio (o conteúdo) pode variar, mas há uma direção, um padrão escavado pela repetição.

A Mãe, o Herói, a Sombra, o Velho Sábio, o Trapaceiro — esses não são "personagens" fixos, mas potenciais psíquicos que se manifestam em imagens culturalmente específicas. Cada cultura preenche o arquétipo da Mãe à sua maneira (Maria, Démeter, Iemanjá), mas o padrão está ali.

A confusão comum é tratar arquétipos como receitas ou etiquetas. Eles são, acima de tudo, *energia* — carga afetiva que pode capturar a consciência.`,
    related: { terms: ['inconsciente-coletivo', 'mito-pessoal'], materials: ['hermeneutica-psicologia'] },
  },
  {
    slug: 'complexo',
    term: 'Complexo',
    aliases: ['complexo afetivo'],
    category: 'dinamica',
    short: 'Núcleo afetivo autônomo — um "pedaço" da psique com vida própria.',
    full: `Um complexo é uma constelação de imagens, memórias, afetos em torno de um núcleo arquetípico. É autônomo: pode ser ativado sem convite, tomar a consciência, falar pela boca do Ego.

"Todo mundo tem complexos" — e deve ter. O complexo materno, o complexo de inferioridade, o complexo paterno. Não são patologia em si: são estrutura. Patológica é a *identificação* com o complexo, a incapacidade de se distinguir dele.

Jung descobriu os complexos via experimento de associação de palavras: perturbações na resposta (pausa, tropeço, esquecimento) indicavam a constelação de um complexo.`,
    related: { terms: ['ego', 'sombra'], materials: ['consciencia-complexo-ego'] },
  },
  {
    slug: 'individuacao',
    term: 'Individuação',
    aliases: [],
    category: 'processo',
    short: 'Tornar-se quem se é — processo de diferenciação do indivíduo face ao coletivo.',
    full: `Individuação não é "individualismo". É o processo pelo qual uma pessoa se torna um indivíduo psicológico: ou seja, um ser indivisível, uma unidade irrevogável, um "todo" — Jung.

É um processo de diferenciação do coletivo inconsciente: do que se herdou da família, da cultura, dos papéis sociais — sem abandonar tudo isso, mas reconhecendo-o *como outro*. Ter relação consigo em vez de *ser* o que foi recebido.

Não termina. Há marcos, passagens — a saída da infância psicológica, a integração da Sombra, o encontro com Anima/Animus, o reconhecimento do Self. Mas o processo é a vida inteira.`,
    related: { terms: ['self', 'sombra', 'funcao-transcendente'], materials: [] },
  },
  {
    slug: 'sincronicidade',
    term: 'Sincronicidade',
    aliases: [],
    category: 'dinamica',
    short: 'Coincidência significativa — sentido sem causa.',
    full: `Sincronicidade é o conceito que Jung propôs para eventos que se correspondem *por significado*, não por causa. Um paciente fala de um escaravelho; bate um besouro na janela. Duas pessoas sonham o mesmo símbolo na mesma noite, de cidades diferentes.

Não é mágica, nem causalidade oculta. É uma categoria de ordenamento diferente — complementar à causalidade, não concorrente. Jung só publicou o conceito tardiamente (em colaboração com Wolfgang Pauli, físico quântico) porque reconhecia quão facilmente vira pseudociência.

Clinicamente, o que importa é: quando o paciente traz uma sincronicidade, algo está sendo constelado. Vale perguntar: o que está querendo dizer isso?`,
    related: { terms: ['inconsciente-coletivo', 'arquetipo'], materials: [] },
  },
  {
    slug: 'projecao',
    term: 'Projeção',
    aliases: [],
    category: 'dinamica',
    short: 'Conteúdo psíquico interno vivido como se fosse externo.',
    full: `Projeção é o mecanismo pelo qual algo que está *em mim* — uma característica, um afeto, um conteúdo arquetípico — é vivenciado como estando *no outro*.

Projeta-se a Sombra nos inimigos, a Anima na amada, o Self no mestre espiritual. Em todos os casos, o conteúdo tem *base real* no outro (por isso projeção não é alucinação), mas a intensidade do afeto vem de dentro.

O trabalho analítico é, em grande parte, o trabalho de *retirar as projeções*: reconhecer que o ódio exagerado tem minha Sombra, que o amor absoluto carrega minha Anima. Não é minimizar o outro — é dar pra cada um o que é seu.`,
    related: { terms: ['sombra', 'anima', 'animus'], materials: ['projecao'] },
  },
  {
    slug: 'sizigia',
    term: 'Sizígia',
    aliases: ['par divino', 'par conjunto'],
    category: 'arquetipos',
    short: 'Par Anima-Animus ou qualquer emparelhamento arquetípico de opostos.',
    full: `Sizígia é, na linguagem junguiana, o par arquetípico de opostos que tendem a aparecer juntos: Anima-Animus, sol-lua, rei-rainha, Yang-Yin.

Clinicamente, a sizígia aparece em sonhos como casais míticos, ou em relações amorosas onde o par se encaixa "cabeça-ombro" psicologicamente — cada um carregando a contraparte que o outro rejeita em si.`,
    related: { terms: ['anima', 'animus'], materials: [] },
  },
  {
    slug: 'funcao-transcendente',
    term: 'Função transcendente',
    aliases: [],
    category: 'processo',
    short: 'Capacidade psíquica de gerar um terceiro a partir de dois opostos em tensão.',
    full: `A função transcendente é uma das grandes invenções conceituais de Jung. Quando há um conflito real — não decidível pela vontade do Ego — algo na psique, se sustentado o tempo suficiente, produz uma terceira coisa: um símbolo, uma imagem, uma síntese imprevisível.

Esse "terceiro" não é compromisso nem meio-termo: é uma configuração nova, frequentemente surpreendente, que torna obsoleta a polarização anterior.

A prática da imaginação ativa é um dos modos de convocar essa função.`,
    related: { terms: ['individuacao', 'imaginacao-ativa'], materials: [] },
  },
  {
    slug: 'imaginacao-ativa',
    term: 'Imaginação ativa',
    aliases: [],
    category: 'clinica',
    short: 'Método de diálogo consciente com conteúdos do inconsciente.',
    full: `Imaginação ativa é uma técnica desenvolvida por Jung: entrar deliberadamente em diálogo com uma imagem do inconsciente (um personagem de um sonho, uma fantasia recorrente, uma voz interna) e *deixá-la responder*.

Não é fantasia passiva ("deixar a mente vagar") nem sugestão guiada ("imagine uma praia"): é uma prática séria, que requer Ego firme e capacidade de discernir imaginação de projeção.

É um dos modos privilegiados de ativar a função transcendente. Mal conduzida, pode desestabilizar pacientes com Ego frágil — daí o cuidado clínico.`,
    related: { terms: ['funcao-transcendente', 'self'], materials: [] },
  },
  {
    slug: 'mito-pessoal',
    term: 'Mito pessoal',
    aliases: [],
    category: 'processo',
    short: 'Narrativa arquetípica que organiza a biografia de uma pessoa.',
    full: `Para Jung, cada vida individual é, no fundo, a concretização de um mito. Não "inventado" — *encarnado*. A tarefa de individuação inclui reconhecer qual mito se está vivendo, sem confusão nem idealização.

Jung descreveu o seu próprio em *Memórias, Sonhos, Reflexões*: a pergunta "qual é o meu mito?" o acompanhou a vida toda.`,
    related: { terms: ['individuacao', 'arquetipo'], materials: [] },
  },
  {
    slug: 'tipologia',
    term: 'Tipologia',
    aliases: ['tipos psicológicos', 'funções da consciência'],
    category: 'estrutura',
    short: 'Teoria das funções da consciência (pensamento, sentimento, sensação, intuição) e das atitudes (introversão/extroversão).',
    full: `A tipologia junguiana descreve como a consciência se orienta no mundo. São duas atitudes — Introversão (energia para dentro) e Extroversão (para fora) — e quatro funções — Pensamento, Sentimento, Sensação, Intuição.

Cada pessoa tem uma função dominante (mais desenvolvida), auxiliares, e uma inferior (o "tendão de Aquiles" psíquico, habitat da Sombra). Não é "personalidade estática": é um mapa de onde a consciência brilha e onde tropeça.

A tipologia popular (MBTI etc.) é simplificação grosseira do que Jung propôs.`,
    related: { terms: ['ego'], materials: ['atitude-tipologia-diagnostico', 'extroversao-introversao'] },
  },
  {
    slug: 'libido',
    term: 'Libido',
    aliases: ['energia psíquica'],
    category: 'dinamica',
    short: 'Energia psíquica em sentido amplo — não apenas sexual.',
    full: `A ruptura com Freud passou, entre outras coisas, pelo conceito de libido. Para Jung, libido é *energia psíquica*: neutra, móvel, que pode se investir em qualquer conteúdo — sexual, espiritual, criativo, destrutivo.

O que importa clinicamente é *onde* a libido está investida num dado momento, e para *onde* ela pode se deslocar. Um sintoma é libido represada num lugar inadequado; a cura passa pela liberação do fluxo.`,
    related: { terms: ['complexo'], materials: [] },
  },
  {
    slug: 'numinoso',
    term: 'Numinoso',
    aliases: ['numinosidade', 'numinosum'],
    category: 'dinamica',
    short: 'Qualidade de experiências que arrebatam a consciência — sagrado, terrível, fascinante.',
    full: `Termo herdado de Rudolf Otto (*O Sagrado*, 1917). Experiências numinosas são marcadas por dois polos: *mysterium tremendum* (tremor, pavor) e *fascinans* (atração irresistível).

Jung considerava que toda verdadeira cura psicoterapêutica envolve, em algum momento, uma experiência numinosa — um encontro com algo que transcende o Ego e o força a se reorganizar.`,
    related: { terms: ['self', 'arquetipo'], materials: [] },
  },
  {
    slug: 'mandala',
    term: 'Mandala',
    aliases: [],
    category: 'arquetipos',
    short: 'Símbolo circular de totalidade — manifestação visual do Self.',
    full: `Mandala (do sânscrito "círculo") é o símbolo arquetípico da totalidade. Aparece em culturas de todos os continentes, em épocas totalmente desconectadas.

Clinicamente, mandalas espontâneas em sonhos ou desenhos de pacientes frequentemente indicam um momento de reorganização psíquica — o Self se apresentando.`,
    related: { terms: ['self', 'quaternidade'], materials: [] },
  },
  {
    slug: 'quaternidade',
    term: 'Quaternidade',
    aliases: ['quaternio'],
    category: 'alquimia',
    short: 'Estrutura arquetípica de quatro — símbolo de completude psíquica.',
    full: `Enquanto o três é dinâmico (tese-antítese-síntese), o quatro é estático — completo. Jung via na quaternidade um símbolo recorrente de totalidade psíquica: quatro funções da consciência, quatro cantos da cruz, quatro estágios alquímicos.

A Santíssima Trindade, dizia ele, é incompleta justamente porque exclui um quarto termo (a matéria, o feminino, o mal) — e a neurose coletiva ocidental tem relação com essa exclusão.`,
    related: { terms: ['mandala', 'tipologia'], materials: [] },
  },
  {
    slug: 'alquimia-psicologica',
    term: 'Alquimia psicológica',
    aliases: [],
    category: 'alquimia',
    short: 'Uso das imagens alquímicas como mapa simbólico do processo de individuação.',
    full: `Nos últimos 30 anos de vida, Jung se dedicou intensamente ao estudo da alquimia. Não como proto-química, mas como psicologia projetada: os alquimistas, ao "trabalhar a matéria", projetavam nela conteúdos psíquicos de transformação.

O *opus alquimicum* — com suas etapas de nigredo (enegrecimento), albedo (branqueamento), citrinitas (amarelecimento) e rubedo (avermelhamento) — oferece a Jung um vocabulário simbólico para descrever o processo de individuação.`,
    related: { terms: ['nigredo', 'albedo', 'rubedo', 'individuacao'], materials: [] },
  },
  {
    slug: 'nigredo',
    term: 'Nigredo',
    aliases: ['obra em negro'],
    category: 'alquimia',
    short: 'Primeira etapa alquímica — dissolução, confronto com a Sombra.',
    full: `Nigredo é o "enegrecimento": a dissolução da matéria-prima, a morte do velho estado. Psicologicamente, corresponde ao confronto com a Sombra, à depressão criativa, ao momento em que as velhas identificações ruem e ainda não há forma nova.

É doloroso, necessário, e frequentemente o paciente quer "passar logo disso". A tentativa prematura de sair produz inflação ou recaída.`,
    related: { terms: ['alquimia-psicologica', 'sombra'], materials: [] },
  },
  {
    slug: 'albedo',
    term: 'Albedo',
    aliases: ['obra em branco'],
    category: 'alquimia',
    short: 'Etapa alquímica do branqueamento — purificação, aparição da Anima.',
    full: `Depois do nigredo, vem o albedo: o branqueamento. É a etapa da reflexão clara, da distinção, do surgimento de uma nova atitude. Psicologicamente corresponde ao aparecimento de Anima/Animus purificados — o encontro com a contraparte.`,
    related: { terms: ['alquimia-psicologica', 'anima'], materials: [] },
  },
  {
    slug: 'rubedo',
    term: 'Rubedo',
    aliases: ['obra em vermelho'],
    category: 'alquimia',
    short: 'Etapa alquímica final — união dos opostos, aparecimento do Self.',
    full: `Rubedo é o avermelhamento — a etapa final do opus. Sangue, vida, encarnação. Psicologicamente, corresponde à conjunção dos opostos no Self, à totalidade realizada — não como estado permanente, mas como momento paradigmático.`,
    related: { terms: ['alquimia-psicologica', 'self'], materials: [] },
  },
];

export function getGlossarioBySlug(slug) {
  return glossario.find((g) => g.slug === slug) || null;
}

export function getGlossarioByCategory() {
  const out = {};
  for (const item of glossario) {
    out[item.category] = out[item.category] || [];
    out[item.category].push(item);
  }
  return out;
}
