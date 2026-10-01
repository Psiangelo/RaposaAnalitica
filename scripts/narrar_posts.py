# -*- coding: utf-8 -*-
"""Narra os posts do blog com a voz clonada. Um clique, zero IA, zero token.

O site fala com `window.speechSynthesis` (a voz do navegador do leitor). Este script
gera o áudio ANTES, com a voz dele, e o player passa a preferir o arquivo quando existe.

O que ele faz, sozinho:
  1. lê os posts publicados de `src/data/site-content.json`
  2. converte o `content_html` em texto NARRÁVEL (as regras estão em REGRAS, abaixo)
  3. pula o post cujo texto não mudou desde a última narração (hash no manifesto)
  4. narra com o Pocket TTS local, iguala o volume e grava `public/audio/<slug>.mp3`

⚠️ Precisa do venv do reels_vida (é lá que mora o modelo). O caminho está em POCKET.

Uso:
  narrar_posts.py                    todos os posts publicados que faltam
  narrar_posts.py --slug meu-post    só um
  narrar_posts.py --tudo             refaz mesmo o que já existe
  narrar_posts.py --rapido           modelo destilado (~1,6x mais rápido, voz um pouco pior)
  narrar_posts.py --persona publica  outra voz (padrão: privada)
"""
import argparse, hashlib, html, json, os, re, shutil, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(AQUI)
REELS = r"C:\Users\gabri\Desktop\reels_vida"
POCKET = os.path.join(REELS, ".venv_pocket", "Scripts", "python.exe")
CONTENT = os.path.join(SITE, "src", "data", "site-content.json")
AUDIO_DIR = os.path.join(SITE, "public", "audio")
MANIFESTO = os.path.join(AUDIO_DIR, "_manifesto.json")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────────────────────────────────────
# REGRAS — o que cada elemento do post vira no áudio.
# Levantadas do "Guia de Formatação - Blog Psiângelo" e medidas nos 4 posts no ar.
#
#   <blockquote class="pullquote">  PULA. É uma frase que já está no corpo, repetida
#                                   em destaque visual; narrada, o ouvinte escuta duas vezes.
#   <details>…</details>            PULA. É o bloco "Referências": bibliografia falada é ruído.
#   <blockquote>                    NARRA com moldura falada. Sem aspas visíveis, o ouvinte
#                                   atribui a citação ao narrador.
#   (JUNG, 2017e, p. 15) · §245     SAI do áudio. Bloco de numerais quebra a prosódia.
#   [...]                           SAI. Ninguém fala "colchetes reticências".
#   <h1>–<h4>                       NARRA, com pausa antes: é o que orienta quem só ouve.
#   <strong> <em> <mark> <u> <s>    a tag sai, o texto fica. Realce não existe no áudio.
#   <ul> <ol> <li>                  NARRA cada item como uma frase.
#   <hr>                            vira pausa.
#   <img> <iframe> <code>           PULA. Imagem, vídeo e código não se leem em voz alta.
#   <a href>                        narra o TEXTO do link, descarta a URL.
# ─────────────────────────────────────────────────────────────────────────────

MOLDURA_CITACAO = "A citação é dele:"      # entra antes de todo blockquote
PAUSA_TITULO = "[PAUSA 0.8]"
PAUSA_CITACAO = "[PAUSA 0.5]"
PAUSA_HR = "[PAUSA 1.0]"
TOM = "CORPO"                               # um tom só: post longo não pede relevo de reel
# ⭐ O VERBATIM DE JUNG NÃO PODE SOAR COMO O AUTOR. No papel as aspas fazem esse trabalho;
# no áudio, nada faz. Então a citação recebe moldura falada + tom próprio (VIRADA: mais
# grave e mais lento que o CORPO nas duas personas), e a pausa antes e depois isola o bloco.
TOM_CITACAO = "VIRADA"
TOM_TITULO = "GANCHO"                       # subtítulo entra com ataque, para orientar quem só ouve
MAX_PALAVRAS = 18                           # acima disso o clone come o fim da fala
MIN_CONTEUDO = 4                            # abaixo disso ele come as pontas

UNIDADES = "zero um dois três quatro cinco seis sete oito nove dez onze doze treze catorze quinze dezesseis dezessete dezoito dezenove".split()
DEZENAS = "vinte trinta quarenta cinquenta sessenta setenta oitenta noventa".split()


def numero_extenso(n):
    """Só o que aparece em post: até 9999. Fora disso, devolve os dígitos (raro)."""
    n = int(n)
    if n < 20:
        return UNIDADES[n]
    if n < 100:
        d, r = divmod(n, 10)
        return DEZENAS[d - 2] + (f" e {UNIDADES[r]}" if r else "")
    if n < 1000:
        c, r = divmod(n, 100)
        base = "cem" if n == 100 else ("cento" if c == 1 else
               ["duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos",
                "setecentos", "oitocentos", "novecentos"][c - 2])
        return base + (f" e {numero_extenso(r)}" if r else "")
    if n < 10000:
        m, r = divmod(n, 1000)
        base = "mil" if m == 1 else f"{UNIDADES[m]} mil"
        if not r:
            return base
        lig = " e " if r < 100 or r % 100 == 0 else " "
        return base + lig + numero_extenso(r)
    return str(n)


def limpa_texto(t):
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t)
    # localizador acadêmico e parágrafo: saem do áudio, ficam no texto escrito
    t = re.sub(r"\((?:[A-ZÀ-Ú]{2,}[^)]{0,60})?\d{4}[a-z]?(?:,\s*[pP]\.\s*\d+[^)]*)?\)", "", t)
    t = re.sub(r"\(\s*(?:CW|OC)\s*[^)]*\)", "", t)
    t = re.sub(r"§+\s*\d+[\d\s,\-–]*", "", t)
    t = re.sub(r"\[\s*\.\.\.\s*\]|\[…\]", ",", t)          # corte de citação vira respiração
    # o aposto duplo (20 dos 33 travessões do post no ar) vira vírgula: no áudio o
    # travessão não se ouve, e como vírgula ele passa a servir de ponto de quebra
    t = re.sub(r"\s*[—–]\s*", ", ", t)
    t = re.sub(r"\bp\.\s*\d+\b", "", t)
    t = re.sub(r"\b(\d{1,4})\b", lambda m: numero_extenso(m.group(1)), t)
    t = t.replace("  ", " ").replace(" ,", ",").replace(" .", ".")
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return t.strip(" ,;")


def _junta(pedacos):
    """Agrupa pedaços até o teto de palavras, sem estourar."""
    saida, atual = [], ""
    for pedaco in pedacos:
        if atual and len((atual + " " + pedaco).split()) > MAX_PALAVRAS:
            saida.append(atual.strip())
            atual = pedaco
        else:
            atual = (atual + " " + pedaco).strip()
    if atual:
        saida.append(atual.strip())
    return [p for p in saida if p]


def parte_fala(frase):
    """Fala longa demais o clone come o FIM; parte por pontuação, nunca no meio do sintagma.

    Três degraus, do melhor para o pior corte:
      1. pontuação forte (vírgula, ponto e vírgula, dois pontos)
      2. antes de conectivo (e, que, porque…) — a fala nova abre em palavra descartável,
         que é justamente o que o clone pode comer sem estragar a frase
      3. desiste e deixa longa (raro; melhor uma fala longa que uma quebrada no meio)
    """
    if len(frase.split()) <= MAX_PALAVRAS:
        return [frase]
    partes = _junta(re.split(r"(?<=[,;:])\s+", frase))
    if all(len(p.split()) <= MAX_PALAVRAS for p in partes):
        return partes
    saida = []
    for p in partes:
        if len(p.split()) <= MAX_PALAVRAS:
            saida.append(p)
            continue
        saida.extend(_junta(re.split(
            r"\s+(?=(?:e|que|porque|mas|quando|onde|para|como|se|pois|embora|enquanto)\s)", p)))
    return saida


def html_para_falas(conteudo):
    """content_html -> lista de linhas no formato do montar_audio ([TOM] texto)."""
    h = conteudo
    h = re.sub(r"<details.*?</details>", "", h, flags=re.S | re.I)        # Referências
    h = re.sub(r'<blockquote[^>]*class="[^"]*pullquote[^"]*".*?</blockquote>', "", h, flags=re.S | re.I)
    h = re.sub(r"<(script|style|iframe|img|figure|code|pre).*?</\1>", "", h, flags=re.S | re.I)
    h = re.sub(r"<(img|iframe|br)[^>]*/?>", " ", h, flags=re.I)

    falas = []
    # cada bloco de topo vira um "evento"; a ordem do documento é preservada
    for m in re.finditer(r"<(h[1-4]|p|blockquote|li|hr)[^>]*>(.*?)</\1>|<hr\s*/?>",
                         h, flags=re.S | re.I):
        tag = (m.group(1) or "hr").lower()
        bruto = m.group(2) or ""
        texto = limpa_texto(re.sub(r"<[^>]+>", "", bruto))
        if tag == "hr":
            falas.append(PAUSA_HR)
            continue
        if not texto:
            continue
        if tag.startswith("h"):
            falas.append(PAUSA_TITULO)
            falas.append(f"[{TOM_TITULO}] {texto}")
            continue
        tom = TOM_CITACAO if tag == "blockquote" else TOM
        if tag == "blockquote":
            falas.append(PAUSA_CITACAO)
            falas.append(f"[{TOM}] {MOLDURA_CITACAO}")
        for frase in re.split(r"(?<=[.!?])\s+", texto):
            frase = frase.strip()
            if not frase:
                continue
            for parte in parte_fala(frase):
                if len([p for p in parte.split() if len(p) > 2]) < MIN_CONTEUDO and falas \
                        and falas[-1].startswith(f"[{tom}]"):
                    falas[-1] = falas[-1] + " " + parte      # junta a curta na anterior
                else:
                    falas.append(f"[{tom}] {parte}")
        if tag == "blockquote":
            falas.append(PAUSA_CITACAO)
    return falas


def roda(cmd, titulo):
    print(f"    {titulo}...", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        print(r.stdout[-1500:])
        print(r.stderr[-800:])
        raise SystemExit(f"  [x] falhou: {titulo}")
    return r.stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug")
    ap.add_argument("--tudo", action="store_true", help="refaz mesmo o que já tem áudio")
    ap.add_argument("--rapido", action="store_true", help="modelo destilado, ~1,6x mais rápido")
    ap.add_argument("--persona", default="privada")
    a = ap.parse_args()

    if not os.path.exists(POCKET):
        raise SystemExit(f"[x] não achei o Python do reels_vida em {POCKET}")

    os.makedirs(AUDIO_DIR, exist_ok=True)
    manifesto = {}
    if os.path.exists(MANIFESTO):
        manifesto = json.load(open(MANIFESTO, encoding="utf-8"))

    dados = json.load(open(CONTENT, encoding="utf-8"))
    posts = dados["data"]["raposa_admin_blog"]
    alvo = [p for p in posts
            if (p.get("status") or "").lower() == "published"
            and (not a.slug or p.get("slug") == a.slug)]
    if not alvo:
        print("[i] nenhum post publicado para narrar")
        return

    print(f"[i] {len(alvo)} post(s) publicado(s) · voz '{a.persona}'\n")
    feitos, pulados = 0, 0
    for p in alvo:
        slug = p.get("slug") or str(p.get("id"))
        falas = html_para_falas(p.get("content_html") or "")
        if not falas:
            print(f"  [!] {slug}: sem texto narrável"); continue
        corpo = "\n".join(falas)
        digest = hashlib.sha1(corpo.encode("utf-8")).hexdigest()[:12]
        destino = os.path.join(AUDIO_DIR, f"{slug}.mp3")
        if not a.tudo and manifesto.get(slug, {}).get("hash") == digest and os.path.exists(destino):
            print(f"  [=] {slug}: sem mudança, pulando")
            pulados += 1
            continue

        n_fala = len([f for f in falas if f.startswith("[")and not f.startswith("[PAUSA")])
        palavras = len(corpo.split())
        print(f"  [>] {slug}: {n_fala} falas, ~{palavras/3.2/60:.0f} min de áudio")

        trabalho = tempfile.mkdtemp(prefix=f"narrar_{slug}_")
        roteiro = os.path.join(trabalho, "roteiro_TONS.txt")
        # o título entra como primeira fala: quem ouve não vê o <h1> da página
        titulo = limpa_texto(re.sub(r"<[^>]+>", "", p.get("title") or ""))
        open(roteiro, "w", encoding="utf-8").write(
            (f"[{TOM}] {titulo}.\n{PAUSA_TITULO}\n" if titulo else "") + corpo + "\n")

        saida = os.path.join(trabalho, "saida")
        roda([POCKET, os.path.join(REELS, "scripts", "montar_audio.py"), roteiro,
              "--engine", "pocket",
              "--pocket-lang", "portuguese" if a.rapido else "portuguese_24l",
              "--persona", a.persona, "--retries", "3", "--fx", "esc99_locucao",
              "--out", saida], "narrando")
        roda([POCKET, os.path.join(REELS, "scripts", "normalizar_narracao.py"), saida,
              "--aplicar", "--k", "1.0", "--max-st", "0", "--fx", "esc99_locucao"],
             "igualando o volume")

        pronto = None
        for pasta in (saida + "_norm", saida + "_vol", saida):
            cand = os.path.join(pasta, "narracao.mp3")
            if os.path.exists(cand):
                pronto = cand
                break
        if not pronto:
            print(f"  [x] {slug}: a narração não apareceu"); continue

        # recodifica para voz falada: mono, 22 kHz, 64 kbps. O master sai com ~1,4 MB/min,
        # o que num site é peso morto — aqui cai para ~0,5 MB/min sem diferença audível.
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", pronto,
                        "-ac", "1", "-ar", "22050", "-b:a", "64k", destino], check=True)
        dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                              "-of", "csv=p=0", destino], capture_output=True, text=True).stdout.strip()
        manifesto[slug] = {"hash": digest, "segundos": round(float(dur or 0), 1),
                           "persona": a.persona, "falas": n_fala}
        json.dump(manifesto, open(MANIFESTO, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        print(f"  [+] {slug}.mp3 · {float(dur or 0)/60:.1f} min")
        shutil.rmtree(trabalho, ignore_errors=True)
        feitos += 1

    print(f"\n[OK] {feitos} narrado(s), {pulados} sem mudança.")
    if feitos:
        print("     os mp3 estão em public/audio/ e sobem no próximo publish.")


if __name__ == "__main__":
    main()
