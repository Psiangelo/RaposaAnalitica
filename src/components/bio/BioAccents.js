/**
 * As cores das placas (ema) do /bio. Cada cor tem:
 *  flat   — a placa
 *  media1 — o disco do ícone (escuro)
 *  media2 — o ícone
 *  texto  — o texto sobre a placa
 * O painel (BioManager) mostra estas mesmas cores como amostras.
 */
export const BIO_ACCENTS = [
  { value: 'mata', label: 'Mata', description: 'o verde da floresta', flat: '#DCE4DA', media1: '#1E3A2F', media2: '#E9C85E', texto: '#13211F' },
  { value: 'torii', label: 'Torii', description: 'o vermelho do portão', flat: '#F2D9CF', media1: '#962B24', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'ai', label: 'Anil', description: 'o azul do inconsciente', flat: '#D7DFEC', media1: '#2E4C7A', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'musgo', label: 'Musgo', description: 'o verde claro do chão', flat: '#E6EBD6', media1: '#5C7D4E', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'ouro', label: 'Ouro', description: 'a lanterna acesa', flat: '#F4E6B5', media1: '#13211F', media2: '#E9C85E', texto: '#13211F' },
  { value: 'noite', label: 'Noite', description: 'a noite da mata (placa escura)', flat: '#1B2B33', media1: '#6DB5AE', media2: '#13211F', texto: '#EEEAE0' },
  { value: 'kaki', label: 'Caqui', description: 'o laranja do outono', flat: '#F6DCC6', media1: '#DE7A3C', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'ume', label: 'Ameixa', description: 'a flor de ume', flat: '#EFD9DF', media1: '#9C3D5C', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'fuji', label: 'Glicínia', description: 'o sonho e a anima', flat: '#E7E1F1', media1: '#7A64AE', media2: '#F2EBDC', texto: '#13211F' },
  { value: 'madeira', label: 'Madeira', description: 'a ema de verdade', flat: '#E8D3B6', media1: '#6B4A35', media2: '#F2EBDC', texto: '#13211F' },
];

export const BIO_ACCENT_VALUES = new Set(BIO_ACCENTS.map((a) => a.value));

/** Ciclo automático quando o link não escolheu cor. */
export const BIO_ACCENT_CYCLE = ['mata', 'torii', 'ai', 'ouro', 'musgo', 'noite', 'kaki', 'fuji'];

export function bioAccent(value, i = 0) {
  return BIO_ACCENTS.find((a) => a.value === value) || BIO_ACCENTS.find((a) => a.value === BIO_ACCENT_CYCLE[i % BIO_ACCENT_CYCLE.length]);
}
