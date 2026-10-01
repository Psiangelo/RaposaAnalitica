# Raposa Analítica

Site da Raposa Analítica: ensaios, verbetes e trilhas de leitura sobre a obra de Carl Gustav Jung, pesquisa sob encomenda para quem escreve com Jung, loja de materiais e as Cartas da Raposa (newsletter).

No ar em: https://psiangelo.github.io/RaposaAnalitica/ · painel em `/admin/`.

## Como funciona

- **Next.js 14 em exportação estática**, hospedado no GitHub Pages. Não há servidor nem banco.
- **O conteúdo mora em `src/data/site-content.json`.** O build lê esse arquivo e gera uma página por ensaio, verbete e trilha.
- **O painel (`/admin/`) edita no navegador e publica no GitHub:** o botão Publicar grava o `site-content.json` (e as imagens novas em `public/uploads/`) num commit, pela API do GitHub, com um token pessoal guardado só no navegador de quem publica. O push dispara o workflow `deploy.yml`, que reconstrói o site em uns 2 minutos.
- Só as chaves de conteúdo (`SITEDATA_KEYS` em `src/lib/sitedata.js`) são publicadas. Senha, token e registro de atividade nunca saem do navegador.
- A newsletter não guarda e-mail aqui: o formulário manda para o serviço escolhido no painel (Buttondown, Substack ou qualquer formulário: MailerLite, Kit, Brevo, Google Forms).
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
