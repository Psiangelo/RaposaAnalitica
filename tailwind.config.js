/** @type {import('tailwindcss').Config} */
// As cores apontam para os PAPÉIS definidos em globals.css (:root e .noite),
// então `bg-bg`, `text-accent` etc. mudam sozinhas dentro de uma faixa .noite.
const papel = (v) => `rgb(var(--${v}-rgb) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: papel('fundo'),
          warm: papel('fundo-2'),
          deep: papel('fundo-3'),
          card: papel('cartao'),
          'card-hover': papel('cartao-hover'),
        },
        border: {
          subtle: 'rgb(var(--acento-rgb) / 0.14)',
          hover: 'rgb(var(--acento-rgb) / 0.3)',
        },
        text: {
          DEFAULT: papel('texto'),
          dim: papel('texto-dim'),
          bright: papel('texto-forte'),
          faint: papel('texto-sutil'),
        },
        accent: {
          DEFAULT: papel('acento'),
          soft: papel('acento-forte'),
          bright: papel('acento-vivo'),
        },
        linha: papel('linha'),
        nigredo: papel('fundo-2'),
        albedo: papel('texto-forte'),
        citrinit: papel('acento-vivo'),
        rubedo: papel('rubedo'),
        // a floresta (desenho, faixas, selos)
        mata: papel('mata'),
        musgo: papel('musgo'),
        bambu: papel('bambu'),
        nevoa: papel('nevoa'),
        noite: papel('noite'),
        kitsunebi: papel('kitsunebi'),
        torii: papel('torii'),
        ouro: papel('ouro'),
        ai: papel('ai'),
        fuji: papel('fuji'),
      },
      fontFamily: {
        serif: ['var(--f-serif)'],
        body: ['var(--f-prosa)'],
        sans: ['var(--f-ui)'],
        mono: ['var(--f-mono)'],
      },
    },
  },
  plugins: [],
};
