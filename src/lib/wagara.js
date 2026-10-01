/**
 * wagara — as padronagens japonesas da Raposa como ladrilho SVG.
 *
 * Portadas de japao.py e banco.py (o motor do Instagram), para o site e o feed
 * terem a mesma mão. Cada padrão devolve um data-URI pronto para
 * `background-image`, na cor e na opacidade pedidas. Os ladrilhos são
 * contínuos por construção (<pattern> de um módulo só), então repetem sem
 * emenda em qualquer tamanho.
 *
 * Uso: style={{ backgroundImage: wagaraUrl('seigaiha', '#2E5240', 0.14) }}
 */

const R3 = Math.sqrt(3);

function corpo(nome, s, cor, larg) {
  switch (nome) {
    case 'seigaiha': {
      const arcos = [];
      for (const [cx, cy] of [[0, s], [s, s], [s / 2, s / 2]]) {
        for (const r of [s * 0.5, s * 0.36, s * 0.22]) {
          arcos.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${cor}" stroke-width="${larg}"/>`);
        }
      }
      return { svg: arcos.join(''), h: s };
    }
    case 'asanoha': {
      const h = (s * R3) / 2;
      return {
        svg: `<path d="M0 0 L${s / 2} ${h / 3} L${s} 0 M${s / 2} ${h / 3} L${s / 2} ${h} M0 0 L0 ${h} M${s} 0 L${s} ${h} M0 ${h} L${s / 2} ${h - h / 3} L${s} ${h}" fill="none" stroke="${cor}" stroke-width="${larg}"/>`,
        h,
      };
    }
    case 'shippo':
      return {
        svg: [[0, 0], [s, 0], [0, s], [s, s], [s / 2, s / 2]]
          .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="none" stroke="${cor}" stroke-width="${larg}"/>`)
          .join(''),
        h: s,
      };
    case 'kikko': {
      const h = (s * R3) / 2;
      return {
        svg: `<path d="M${s * 0.25} 0 L${s * 0.75} 0 L${s} ${h / 2} L${s * 0.75} ${h} L${s * 0.25} ${h} L0 ${h / 2} Z" fill="none" stroke="${cor}" stroke-width="${larg}"/>`,
        h,
      };
    }
    case 'uroko':
      return { svg: `<path d="M0 ${s} L${s / 2} 0 L${s} ${s} Z" fill="${cor}"/>`, h: s };
    case 'yagasuri':
      return {
        svg: `<path d="M0 0 L${s / 2} ${s / 2} L${s / 2} ${s} L0 ${s / 2} Z" fill="${cor}"/><path d="M${s / 2} ${s / 2} L${s} 0 L${s} ${s / 2} L${s / 2} ${s} Z" fill="${cor}"/>`,
        h: s,
      };
    case 'ichimatsu':
      return {
        svg: `<rect width="${s / 2}" height="${s / 2}" fill="${cor}"/><rect x="${s / 2}" y="${s / 2}" width="${s / 2}" height="${s / 2}" fill="${cor}"/>`,
        h: s,
      };
    case 'kanoko':
      return {
        svg: [[s / 4, s / 4], [(s * 3) / 4, (s * 3) / 4]]
          .map(
            ([x, y]) =>
              `<rect x="${x - s * 0.18}" y="${y - s * 0.18}" width="${s * 0.36}" height="${s * 0.36}" rx="${s * 0.08}" fill="none" stroke="${cor}" stroke-width="${larg}"/><circle cx="${x}" cy="${y}" r="${s * 0.04}" fill="${cor}"/>`,
          )
          .join(''),
        h: s,
      };
    case 'tatewaku': {
      const lin = (x0, sg) => {
        const pts = [];
        for (let k = 0; k <= 40; k++) {
          pts.push(`${(s * (x0 + sg * 0.13 * Math.sin((2 * Math.PI * k) / 40))).toFixed(1)} ${((s * 2 * k) / 40).toFixed(1)}`);
        }
        return 'M' + pts.join(' L');
      };
      return {
        svg: [[0.3, 1], [0.7, -1]]
          .map(([x0, sg]) => `<path d="${lin(x0, sg)}" fill="none" stroke="${cor}" stroke-width="${larg * 1.4}"/>`)
          .join(''),
        h: s * 2,
      };
    }
    case 'hishi':
      return {
        svg: `<path d="M${s / 2} 0 L${s} ${s * 0.35} L${s / 2} ${s * 0.7} L0 ${s * 0.35} Z" fill="none" stroke="${cor}" stroke-width="${larg}"/><path d="M${s / 2} ${s * 0.2} L${s * 0.68} ${s * 0.35} L${s / 2} ${s * 0.5} L${s * 0.32} ${s * 0.35} Z" fill="${cor}"/>`,
        h: s * 0.7,
      };
    case 'sazanami':
      return {
        svg: [s * 0.3, s * 0.7]
          .map((y) => `<path d="M0 ${y} Q ${s / 4} ${y - s * 0.16} ${s / 2} ${y} T ${s} ${y}" fill="none" stroke="${cor}" stroke-width="${larg}"/>`)
          .join(''),
        h: s * 0.8,
      };
    case 'mameshibori':
      return {
        svg: [[s / 4, s / 4], [(s * 3) / 4, (s * 3) / 4]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${s * 0.1}" fill="${cor}"/>`)
          .join(''),
        h: s,
      };
    case 'tokusa':
      return {
        svg:
          [0.1, 0.4, 0.55, 0.85].map((x) => `<rect x="${s * x}" y="0" width="${s * 0.08}" height="${s}" fill="${cor}"/>`).join('') +
          `<rect x="0" y="${s * 0.48}" width="${s}" height="${s * 0.04}" fill="${cor}"/>`,
        h: s,
      };
    default:
      return corpo('seigaiha', s, cor, larg);
  }
}

/** Os padrões e o que cada um diz (do banco da identidade). */
export const WAGARA = [
  { id: 'seigaiha', nome: 'Seigaiha', sentido: 'ondas do mar: o que vem e volta' },
  { id: 'asanoha', nome: 'Asanoha', sentido: 'folha de cânhamo: crescer reto e forte' },
  { id: 'shippo', nome: 'Shippō', sentido: 'sete tesouros: o que se liga sem fim' },
  { id: 'kikko', nome: 'Kikkō', sentido: 'casco de tartaruga: longevidade, estrutura' },
  { id: 'uroko', nome: 'Uroko', sentido: 'escamas: proteção, transformação' },
  { id: 'yagasuri', nome: 'Yagasuri', sentido: 'penas de flecha: decisão, o que não volta' },
  { id: 'ichimatsu', nome: 'Ichimatsu', sentido: 'xadrez: os opostos lado a lado' },
  { id: 'kanoko', nome: 'Kanoko', sentido: 'pintas de filhote de cervo: cuidado' },
  { id: 'tatewaku', nome: 'Tatewaku', sentido: 'vapor subindo: elevar-se, sublimar' },
  { id: 'hishi', nome: 'Hishi', sentido: 'losangos: ordem' },
  { id: 'sazanami', nome: 'Sazanami', sentido: 'ondinhas: o que se move por baixo' },
  { id: 'mameshibori', nome: 'Mameshibori', sentido: 'bolinhas tingidas: leveza' },
  { id: 'tokusa', nome: 'Tokusa', sentido: 'cavalinha: lapidar, polir' },
];

export function wagaraSvg(nome = 'seigaiha', cor = '#2E5240', opacidade = 0.14, tam = 48, larg = 1.6) {
  const { svg, h } = corpo(nome, tam, cor, larg);
  const w = tam;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g opacity="${opacidade}">${svg}</g></svg>`;
}

export function wagaraUrl(nome, cor, opacidade, tam, larg) {
  const svg = wagaraSvg(nome, cor, opacidade, tam, larg);
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Estilo pronto para um fundo com padronagem: tamanho do ladrilho incluído. */
export function wagaraStyle(nome, cor, opacidade = 0.14, tam = 48, larg = 1.6) {
  const { h } = corpo(nome, tam, cor, larg);
  return {
    backgroundImage: wagaraUrl(nome, cor, opacidade, tam, larg),
    backgroundSize: `${tam}px ${h}px`,
  };
}

/**
 * Tag → padrão e cor. O admin pode sobrescrever (raposa_admin_tag_estilos);
 * sem isso, cada tag ganha um padrão fixo pelo próprio nome, para a mesma tag
 * ter sempre a mesma cara.
 */
const CORES_TAG = ['#2E5240', '#962B24', '#2E4C7A', '#6B4A35', '#5C7D4E', '#9C3D5C', '#7A4A2E', '#1E3A2F'];
export function estiloDaTag(tag, mapa = {}) {
  const chave = String(tag || '').toLowerCase();
  if (mapa[chave]) return mapa[chave];
  let h = 0;
  for (const ch of chave) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { padrao: WAGARA[h % WAGARA.length].id, cor: CORES_TAG[h % CORES_TAG.length] };
}
