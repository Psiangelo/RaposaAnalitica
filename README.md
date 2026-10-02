# Raposa Analítica

Site da Raposa Analítica: ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, pesquisa sob encomenda para quem escreve com Jung, loja de materiais e as Cartas da Raposa (newsletter).

No ar em: https://psiangelo.github.io/RaposaAnalitica/ · painel em `/admin/`.

## Como funciona

- **Next.js 14 em exportação estática**, hospedado no GitHub Pages, com um banco na Supabase (projeto «Kitsune projeto»; tabelas e regras em `supabase/*.sql`).
- **O conteúdo mora no banco**, na tabela `conteudo` (uma linha por chave `raposa_admin_*`, com a data da última mudança e o histórico das versões anteriores em `conteudo_historico`). O build puxa o banco para `src/data/site-content.json` (`scripts/puxar-conteudo.mjs`, no `prebuild`) e gera uma página por ensaio, verbete e trilha.
- **O painel (`/admin/`) tem login de verdade** (e-mail e senha da Supabase; só quem está em `administradores` entra; cadastro fechado). O botão Publicar grava no banco só as partes editadas naquele navegador; imagens coladas sobem para o balde `imagens`. O visitante já vê a mudança na hora (o site baixa do banco o que for mais novo), e o workflow `deploy.yml`, que confere o banco de 15 em 15 minutos, reconstrói as páginas e guarda uma cópia do conteúdo no repositório.
- Mexeu no `site-content.json` à mão? Mande para o banco com `node scripts/empurrar-conteudo.mjs raposa_admin_blog` (ou `--todas`); precisa do token da Supabase em `~/.supabase/raposa_token.txt`. Sem isso, o próximo build desfaz a edição.
- No código só vai a chave pública da Supabase (`src/lib/supabaseConfig.js`); quem protege os dados são as regras do banco (RLS).
- **As Cartas (newsletter)** guardam o e-mail na tabela `cartas_inscritos`: qualquer um pode se inscrever, só o administrador lê (aba «Inscritos nas Cartas» do painel, com download da lista).
- A loja não processa pagamento: cada produto tem o link do checkout (Hotmart, Kiwify, Mercado Pago, Gumroad…).

## Identidade

- Cores por papel (`fundo`, `texto`, `acento`…) em `src/app/globals.css`; a classe `.noite` vira qualquer bloco na noite da mata, e `[data-theme="dark"]` já deixa pronto o modo escuro.
- Fontes: Fraunces (títulos), Literata (prosa), Barlow (interface), servidas pelo próprio site (`next/font`).
- Figuras: as linoleogravuras do banco da identidade, exportadas em WebP por `scripts/assets_raposa.py` para `public/raposa/` (medidas em `src/data/figuras.json`, por `scripts/_dims.py`).
- Ícones da interface: `src/components/raposa/Icone.jsx`. Padronagens japonesas (wagara) em `src/lib/wagara.js`.
- Capas dos ensaios, imagem de compartilhamento do site e ícones: `scripts/capas_raposa.py`. Imagem de compartilhamento de cada ensaio: `scripts/gen-og-posts.mjs` (roda no build).

## Rodar aqui

```bash
npm install
npm run dev          # http://localhost:3000/RaposaAnalitica/
npm run build        # gera out/
node scripts/servir-out.mjs   # serve out/ como o GitHub Pages
node scripts/capturas.cjs pasta / /blog/   # capturas em computador e celular
```

## Domínio próprio

Defina `NEXT_PUBLIC_SITE_ORIGIN` e `NEXT_PUBLIC_BASE_PATH` (vazio) no workflow e aponte o domínio no GitHub Pages. Ver `.env.example`.
