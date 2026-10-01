// Níveis da Pesquisa refeitos a pedido do Gabriel (01/10/2026): cada um com
// uma promessa só e clara («um bom ok, um bom pra caramba e um ultra foda»),
// e sem mencionar IA. Rodou uma vez; depois disso vale o painel.
import fs from 'node:fs';

const FILE = 'src/data/site-content.json';
const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const s = snap.data.raposa_admin_servicos;

s.pecas = [
  {
    id: 'essencial', nome: 'Essencial', pergunta: 'Para TCC e artigo',
    descricao: 'Onde Jung fala do seu tema, livro por livro, com a obra e o parágrafo de cada passagem.',
    entrega: 'Lista em PDF', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lupa', destaque: false, oculto: false,
  },
  {
    id: 'aprofundado', nome: 'Aprofundado', pergunta: 'Para mestrado',
    descricao: 'As passagens que importam, explicadas e ligadas entre si: como a ideia aparece e muda ao longo da obra.',
    entrega: 'Pesquisa comentada em PDF', prazo: 'a combinar', preco: 'sob orçamento', icone: 'pergaminho', destaque: false, oculto: false,
  },
  {
    id: 'completo', nome: 'Completo', pergunta: 'Para doutorado',
    descricao: 'Uma pesquisa de fôlego, feita em cima do seu projeto, e uma conversa comigo depois da entrega.',
    entrega: 'Pesquisa completa em PDF e conversa', prazo: 'a combinar', preco: 'sob orçamento', icone: 'lanterna', destaque: true, oculto: false,
  },
];
s.limites = s.limites.filter((l) => !/intelig[êe]ncia artificial|\bIA\b/i.test(l));

fs.writeFileSync(FILE, JSON.stringify(snap, null, 2) + '\n');
console.log(s.pecas.length, 'níveis ·', s.limites.length, 'limites');
