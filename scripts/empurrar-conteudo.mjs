// Manda para o banco da Raposa as partes do conteúdo que foram mudadas
// direto no src/data/site-content.json (por script, fora do painel). O banco
// é a fonte da verdade: sem isto, a próxima publicação do painel ou a
// próxima rodada do GitHub traria de volta a versão antiga.
//
//   node scripts/empurrar-conteudo.mjs raposa_admin_blog raposa_admin_bio
//   node scripts/empurrar-conteudo.mjs --todas
//
// Usa a chave de acesso pessoal do dono (C:\Users\gabri\.supabase\raposa_token.txt,
// nunca no repositório) para rodar o SQL pela API de gerenciamento.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REF = 'kqpdoyidalucsiqksjtr';
const tokenArq = path.join(os.homedir(), '.supabase', 'raposa_token.txt');
const PAT = fs.readFileSync(tokenArq, 'utf8').trim();
const snap = JSON.parse(fs.readFileSync('src/data/site-content.json', 'utf8'));
const args = process.argv.slice(2);
const chaves = args.includes('--todas') ? Object.keys(snap.data) : args;
if (!chaves.length) {
  console.log('diga quais partes (ex.: raposa_admin_blog) ou --todas');
  process.exit(1);
}
const pacote = {};
for (const k of chaves) {
  if (!/^raposa_admin_[a-z_]+$/.test(k) || !(k in snap.data)) throw new Error(`parte desconhecida: ${k}`);
  pacote[k] = snap.data[k];
}
const json = JSON.stringify(pacote);
if (json.includes('$raposa$')) throw new Error('o conteúdo tem o marcador $raposa$; troque o marcador do SQL');
const query = `insert into public.conteudo (chave, valor)
select key, value from jsonb_each($raposa$${json}$raposa$::jsonb)
on conflict (chave) do update set valor = excluded.valor
returning chave, atualizado_em`;
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
const corpo = await r.text();
if (!r.ok) throw new Error(`banco respondeu ${r.status}: ${corpo.slice(0, 300)}`);
const enviadas = JSON.parse(corpo).map((l) => l.chave);
// a data guardada é a do jeito que o site lê (a API pública), para as
// comparações baterem
const config = fs.readFileSync('src/lib/supabaseConfig.js', 'utf8');
const URL_BANCO = config.match(/SUPABASE_URL = '([^']+)'/)[1];
const CHAVE = config.match(/SUPABASE_CHAVE = '([^']+)'/)[1];
const r2 = await fetch(`${URL_BANCO}/rest/v1/conteudo?select=chave,atualizado_em&chave=in.(${enviadas.join(',')})`, { headers: { apikey: CHAVE } });
const linhas = await r2.json();
snap.versoes = snap.versoes || {};
for (const l of linhas) snap.versoes[l.chave] = l.atualizado_em;
fs.writeFileSync('src/data/site-content.json', JSON.stringify(snap, null, 2) + '\n');
console.log(`enviado ao banco: ${linhas.map((l) => l.chave).join(', ')}`);
