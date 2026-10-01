/**
 * Citações de C.G. Jung — utilizadas pelo componente <JungQuote />.
 * Fonte preferencialmente Obras Completas (CW = Collected Works).
 */

export const jungQuotes = [
  {
    text: 'Quem olha para fora, sonha; quem olha para dentro, desperta.',
    source: 'CW 11, § 778',
  },
  {
    text: 'Tudo que nos irrita no outro pode nos conduzir a uma compreensão de nós mesmos.',
    source: 'Memórias, Sonhos, Reflexões',
  },
  {
    text: 'Até tornar-se consciente, o inconsciente dirigirá sua vida e você o chamará de destino.',
    source: 'Aion, CW 9ii',
  },
  {
    text: 'Ninguém se torna iluminado imaginando figuras de luz, mas tornando escura a consciência.',
    source: 'The Philosophical Tree, CW 13',
  },
  {
    text: 'Conhecer a sua própria escuridão é o melhor método para lidar com as escuridões das outras pessoas.',
    source: 'Letters',
  },
  {
    text: 'A tarefa principal da vida não é chegar a algum lugar, mas tornar-se quem se é.',
    source: 'Parafraseado de CW 17',
  },
  {
    text: 'A solidão não vem de não ter pessoas ao redor, mas de não poder comunicar as coisas que parecem importantes.',
    source: 'Memórias, Sonhos, Reflexões',
  },
  {
    text: 'A natureza do símbolo não é substituir aquilo que significa, mas apontar para além de si.',
    source: 'CW 6',
  },
  {
    text: 'A projeção torna o mundo inteiro um duplicado do nosso rosto desconhecido.',
    source: 'Aion, CW 9ii',
  },
  {
    text: 'O encontro de duas personalidades é como o contato de duas substâncias químicas: se há alguma reação, ambas são transformadas.',
    source: 'Modern Man in Search of a Soul',
  },
  {
    text: 'O sentido da vida é uma questão subjetiva que deve ser respondida por cada um em sua própria experiência.',
    source: 'CW 17',
  },
  {
    text: 'Não é a luz que fazemos, mas a escuridão da qual emergimos, que define nossa forma.',
    source: 'The Philosophical Tree, CW 13',
  },
  {
    text: 'O indivíduo é a única realidade. Quanto mais nos afastamos dele em direção a ideias abstratas sobre o Homo sapiens, mais erramos.',
    source: 'CW 10',
  },
  {
    text: 'A sombra é um problema moral que desafia a personalidade do ego por inteiro.',
    source: 'Aion, CW 9ii',
  },
  {
    text: 'Aquilo que você resiste, persiste.',
    source: 'Atribuído · paráfrase de CW 13',
  },
  {
    text: 'A psique não é menos real do que o corpo.',
    source: 'CW 8',
  },
  {
    text: 'Tudo o que é verdadeiro deve mudar e só o que muda permanece verdadeiro.',
    source: 'Memórias, Sonhos, Reflexões',
  },
  {
    text: 'Não existe iluminação sem a dor das trevas.',
    source: 'Paráfrase · CW 13',
  },
];

/** Retorna uma citação aleatória determinística por seed (para SSR estável). */
export function pickQuote(seed = 0) {
  const i = Math.abs(Math.floor(seed)) % jungQuotes.length;
  return jungQuotes[i];
}
