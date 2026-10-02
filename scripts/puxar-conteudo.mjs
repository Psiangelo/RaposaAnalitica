// Puxa do banco da Raposa (Supabase) o conteúdo publicado pelo painel e grava
// em src/data/site-content.json, que é de onde o build monta as páginas.
//
//   node scripts/puxar-conteudo.mjs           grava o arquivo
//   node scripts/puxar-conteudo.mjs --checar  só diz se o banco tem novidade
//                                             (escreve mudou=true|false no
//                                             GITHUB_OUTPUT, para o GitHub)
//
// Usa só a chave publicável (a mesma do site): o conteúdo é público. Se o
// banco não responder, o arquivo fica como está e o build segue com ele.
import fs from 'node:fs';

// o endereço e a chave publicável vêm do mesmo arquivo que o site usa
const config = fs.readFileSync('src/lib/supabaseConfig.js', 'utf8');
const SUPABASE_URL = config.match(/SUPABASE_URL = '([^']+)'/)[1];
const SUPABASE_CHAVE = config.match(/SUPABASE_CHAVE = '([^']+)'/)[1];

const FILE = 'src/data/site-content.json';
const checar = process.argv.includes('--checar');
const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const headers = { apikey: SUPABASE_CHAVE };

function saida(mudou) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `mudou=${mudou}\n`);
}

async function main() {
  const datas = await fetch(`${SUPABASE_URL}/rest/v1/conteudo?select=chave,atualizado_em`, { headers });
  if (!datas.ok) throw new Error(`banco respondeu ${datas.status}`);
  const lista = await datas.json();
  const locais = snap.versoes || {};
  const novas = lista.filter((l) => locais[l.chave] !== l.atualizado_em);

  if (checar) {
    console.log(novas.length ? `novidades no banco: ${novas.map((l) => l.chave).join(', ')}` : 'banco igual ao arquivo');
    saida(novas.length > 0);
    return;
  }
  if (!novas.length) {
    console.log('conteúdo: o arquivo já está igual ao banco');
    return;
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/conteudo?select=chave,valor,atualizado_em`, { headers });
  if (!r.ok) throw new Error(`banco respondeu ${r.status}`);
  const linhas = await r.json();
  snap.data = snap.data || {};
  snap.versoes = {};
  for (const l of linhas) {
    snap.data[l.chave] = l.valor;
    snap.versoes[l.chave] = l.atualizado_em;
  }
  fs.writeFileSync(FILE, JSON.stringify(snap, null, 2) + '\n');
  console.log(`conteúdo: ${linhas.length} partes vindas do banco (${novas.length} com novidade)`);
}

await main().catch((e) => {
  console.log(`conteúdo: não deu para ler o banco (${e.message}); fica o arquivo do repositório`);
  if (checar) saida(false);
});
