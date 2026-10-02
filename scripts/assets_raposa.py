"""Exporta as figuras do banco da Raposa Analítica para o site, em WebP.

As figuras nascem no motor de linoleogravura (pasta da identidade visual) como
PNG de 1200 px com transparência. O SVG original pesa de 80 KB a 6 MB por causa
das goivas e do grão, então o site usa WebP do tamanho que cada uso pede.

Uso:  py scripts/assets_raposa.py            (exporta o que falta)
      py scripts/assets_raposa.py --tudo     (refaz tudo)
Saída: public/raposa/<grupo>/<nome>.webp
"""
import os
import sys
from PIL import Image

ID = r"C:\Users\gabri\OneDrive\Desktop\Raposa Analítica - identidade visual\figuras"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "raposa")
TUDO = "--tudo" in sys.argv

P, B, A = "png", r"banco\png", r"arvores e fundos\png"

# (grupo, nome no site, arquivo de origem, largura)
FIGURAS = [
    # as raposas
    ("fig", "perfil-raposa-oculos", rf"{P}\perfil_raposa_oculos.png", 560),
    ("fig", "perfil-kitsune-oculos", rf"{P}\perfil_kitsune_oculos.png", 560),
    ("fig", "raposa-oculos", rf"{P}\raposa_oculos.png", 720),
    ("fig", "raposa-anotando", rf"{P}\raposa_anotando.png", 720),
    ("fig", "raposa-por-cima", rf"{P}\raposa_por_cima.png", 720),
    ("fig", "raposa-retrato", rf"{P}\raposa_retrato.png", 560),
    ("fig", "raposa-sentada", rf"{P}\raposa.png", 560),
    ("fig", "raposa-dormindo", rf"{P}\raposa_dormindo.png", 560),
    ("fig", "raposa-pergaminho", rf"{P}\jp_raposa_com_pergaminho.png", 560),
    ("fig", "raposa-trotando", rf"{P}\raposa_trotando.png", 720),
    ("fig", "kitsune-espiando", rf"{B}\casal_kitsune_de_oculos_espiando_sem_cauda.png", 720),
    ("fig", "kitsune-dormindo", rf"{P}\kitsune_dormindo.png", 720),
    ("fig", "kitsune-fogo", rf"{P}\kitsune_fogo.png", 720),
    ("fig", "kitsune-pergaminho", rf"{P}\kitsune_pergaminho.png", 720),
    ("fig", "kitsune-sentada", rf"{P}\kitsune_sentada.png", 720),
    ("fig", "kitsune-tronco", rf"{P}\kitsune_tronco.png", 560),
    ("fig", "kitsune-e-gato", rf"{P}\kitsune_e_gato.png", 720),
    ("fig", "raposa-lanterna", rf"{B}\raposa_noite_lanterna_na_boca.png", 720),
    ("fig", "raposa-olhando-lua", rf"{B}\raposa_noite_olhando_a_lua.png", 720),
    ("fig", "raposa-dormindo-lua", rf"{B}\raposa_noite_dormindo_na_lua.png", 640),
    ("fig", "raposa-so-a-cauda", rf"{B}\raposa_borda_so_a_cauda.png", 480),
    ("fig", "raposa-noren", rf"{B}\raposa_casa_atras_da_noren.png", 720),
    ("fig", "raposa-pescando", rf"{B}\raposa_agua_pescando_com_a_cauda.png", 900),
    # a mesma cena emoldurada, com a raposa inteira (scripts/quadro_pescando.mjs)
    ("fig", "raposa-pescando-quadro", rf"{B}\raposa_agua_pescando_quadro.png", 900),
    ("fig", "raposa-daruma", rf"{B}\raposa_casa_com_o_daruma.png", 720),
    ("fig", "raposa-tigela", rf"{B}\raposa_casa_dentro_da_tigela.png", 640),
    ("fig", "raposa-aburaage", rf"{B}\raposa_santuario_ganhou_aburaage.png", 560),
    ("fig", "raposa-wagasa", rf"{B}\raposa_chuva_sob_o_wagasa.png", 640),
    ("fig", "raposa-capim", rf"{B}\raposa_floresta_no_capim.png", 720),
    ("fig", "raposa-folha", rf"{B}\raposa_floresta_a_folha_na_cabeca.png", 560),
    ("fig", "raposa-sapo", rf"{B}\raposa_agua_o_sapo_na_cabeca.png", 560),
    ("fig", "raposa-shoji", rf"{B}\raposa_casa_o_furo_no_shoji.png", 640),
    ("fig", "raposa-lotus", rf"{B}\raposa_agua_na_folha_de_lotus.png", 640),
    ("fig", "raposa-reflexo", rf"{B}\raposa_agua_o_reflexo_e_a_kitsune.png", 640),
    ("fig", "raposa-inari", rf"{B}\raposa_santuario_a_estatua_de_inari.png", 560),
    ("fig", "casamento-das-raposas", rf"{B}\raposa_noite_o_casamento_das_raposas.png", 900),
    ("fig", "coruja", rf"{P}\coruja.png", 480),
    # objetos do santuário e da casa
    ("obj", "torii", rf"{P}\mata_torii.png", 560),
    ("obj", "tunel-de-torii", rf"{B}\el_santuario_tunel_de_torii.png", 900),
    ("obj", "lanterna", rf"{P}\mata_lanterna.png", 360),
    ("obj", "chochin", rf"{B}\el_noite_chochin.png", 360),
    ("obj", "toro", rf"{P}\toro.png", 360),
    ("obj", "makimono", rf"{P}\modulo_makimono.png", 900),
    ("obj", "ema", rf"{P}\modulo_ema.png", 640),
    ("obj", "omikuji", rf"{P}\modulo_omikuji.png", 480),
    ("obj", "tanzaku", rf"{P}\modulo_tanzaku.png", 300),
    ("obj", "sensu", rf"{P}\modulo_sensu.png", 560),
    ("obj", "shoji", rf"{P}\modulo_shoji.png", 640),
    ("obj", "suzu", rf"{P}\suzu.png", 300),
    ("obj", "omamori", rf"{P}\omamori.png", 300),
    ("obj", "shimenawa", rf"{P}\shimenawa.png", 900),
    ("obj", "livro", rf"{P}\livro.png", 360),
    ("obj", "pincel", rf"{P}\pincel.png", 240),
    ("obj", "ponte", rf"{P}\ponte.png", 720),
    ("obj", "montanha", rf"{P}\montanha.png", 720),
    ("obj", "noren", rf"{B}\el_casa_noren.png", 560),
    ("obj", "daruma", rf"{B}\el_casa_daruma_de_um_olho_so.png", 360),
    ("obj", "chawan", rf"{B}\el_casa_chawan.png", 360),
    ("obj", "tetsubin", rf"{B}\el_casa_tetsubin.png", 360),
    ("obj", "tsuru", rf"{B}\el_casa_tsuru_de_origami.png", 360),
    ("obj", "wagasa", rf"{B}\el_chuva_wagasa_aberto.png", 480),
    ("obj", "teru-teru", rf"{B}\el_chuva_teru_teru_bozu.png", 240),
    ("obj", "furin", rf"{B}\el_santuario_furin.png", 240),
    ("obj", "aburaage", rf"{B}\el_santuario_aburaage.png", 360),
    ("obj", "dango", rf"{B}\el_noite_tsukimi_dango.png", 300),
    # a mata
    ("mata", "bambu", rf"{P}\mata_bambu.png", 480),
    ("mata", "bordo", rf"{P}\mata_bordo.png", 240),
    ("mata", "ginkgo", rf"{P}\mata_ginkgo.png", 240),
    ("mata", "cogumelo", rf"{P}\mata_cogumelo.png", 240),
    ("mata", "samambaia", rf"{P}\mata_samambaia.png", 360),
    ("mata", "fogo-azul", rf"{P}\mata_fogo_azul.png", 240),
    ("mata", "fogo-ouro", rf"{P}\mata_fogo_ouro.png", 240),
    ("mata", "lua", rf"{P}\mata_lua.png", 480),
    ("mata", "tronco", rf"{P}\mata_tronco.png", 360),
    ("mata", "sakura", rf"{P}\sakura.png", 200),
    ("mata", "kumo", rf"{P}\kumo.png", 560),
    ("mata", "vaga-lumes", rf"{B}\el_noite_vaga_lumes_hotaru.png", 900),
    ("mata", "estrelas", rf"{B}\el_noite_estrelas.png", 900),
    ("mata", "lua-nuvem", rf"{B}\el_noite_lua_com_nuvem.png", 640),
    ("mata", "susuki", rf"{B}\el_noite_susuki.png", 560),
    ("mata", "folhas-caindo", rf"{B}\el_floresta_folhas_caindo.png", 640),
    ("mata", "pinheiro", rf"{B}\el_floresta_pinheiro_matsu.png", 640),
    ("mata", "broto-de-bambu", rf"{B}\el_floresta_broto_de_bambu.png", 360),
    ("mata", "bolotas", rf"{B}\el_floresta_bolotas.png", 300),
    ("mata", "galho-sakura", rf"{B}\el_estac_es_galho_de_sakura.png", 720),
    ("mata", "glicinia", rf"{B}\el_estac_es_glicinia.png", 640),
    ("mata", "ume", rf"{B}\el_estac_es_ume.png", 640),
    ("mata", "iris", rf"{B}\el_estac_es_iris.png", 360),
    ("mata", "onda", rf"{B}\el_agua_a_onda.png", 720),
    ("mata", "lotus", rf"{B}\el_agua_lotus.png", 360),
    ("mata", "koi", rf"{B}\el_agua_carpa_koi.png", 300),
    ("mata", "sapo", rf"{B}\el_agua_sapo_kaeru.png", 300),
    ("mata", "ondinhas", rf"{B}\el_agua_ondinhas.png", 640),
    # árvores e cenários
    ("arvore", "bambuzal", rf"{A}\bambuzal.png", 1000),
    ("arvore", "glicinia-pergolado", rf"{A}\glicinia.png", 1400),
    ("arvore", "verde", rf"{A}\arvore_verde.png", 900),
    ("arvore", "ginkgo", rf"{A}\arvore_ginkgo.png", 900),
    ("arvore", "momiji", rf"{A}\arvore_momiji.png", 900),
    ("arvore", "momiji-esq", rf"{A}\arvore_momiji_esq.png", 900),
    ("arvore", "sakura", rf"{A}\arvore_sakura.png", 900),
    ("arvore", "sakura-dir", rf"{A}\arvore_sakura_dir.png", 900),
    ("arvore", "ume", rf"{A}\arvore_ume.png", 900),
    ("arvore", "ramagem-sakura", rf"{A}\ramagem_sakura.png", 900),
    ("arvore", "ramagem-sakura-dir", rf"{A}\ramagem_sakura_dir.png", 900),
    # a mesma ramagem com as flores rosadas, para o papel washi (as creme somem nele)
    ("arvore", "ramagem-sakura-dir-rosa", rf"{A}\ramagem_sakura_dir_rosa.png", 900),
    ("arvore", "ramagem-momiji", rf"{A}\ramagem_momiji.png", 900),
    ("arvore", "ramagem-ume", rf"{A}\ramagem_ume.png", 900),
    ("arvore", "pinheiro-neve", rf"{A}\pinheiro_neve.png", 800),
    ("arvore", "galhos-neve", rf"{A}\galhos_neve.png", 800),
    ("cenario", "primavera", r"arvores e fundos\cenarios\primavera.png", 900),
    ("cenario", "verao", r"arvores e fundos\cenarios\verao.png", 900),
    ("cenario", "outono", r"arvores e fundos\cenarios\outono.png", 900),
    ("cenario", "inverno", r"arvores e fundos\cenarios\inverno.png", 900),
]
MASCARAS = ["shiro", "kuro", "aka", "ai", "kin", "koke", "fuji", "sakura"]
KAMONS = ["raposa", "ginkgo", "bordo", "lua_nuvem", "ondas", "bambu", "sakura", "glicinia", "tomoe", "suzu"]
FOLHAS = ["bambu", "ginkgo", "kiku", "matsuba", "momiji", "petalas", "sakura", "susuki", "ume"]

for m in MASCARAS:
    FIGURAS.append(("mascara", m, rf"{P}\mascara_{m}.png", 420))
for k in KAMONS:
    nome = k.replace("_", "-")
    FIGURAS.append(("kamon", nome, rf"{B}\kamon_{k}_escuro.png", 240))
    FIGURAS.append(("kamon", nome + "-claro", rf"{B}\kamon_{k}_claro.png", 240))
for f in FOLHAS:
    FIGURAS.append(("folhas", f + "-escura", rf"arvores e fundos\padronagens de folhas\{f}_escura.png", 900))
    FIGURAS.append(("folhas", f + "-clara", rf"arvores e fundos\padronagens de folhas\{f}_clara.png", 900))


def recorta(im):
    """Corta a margem transparente, deixando 2% de respiro."""
    if im.mode != "RGBA":
        return im
    bb = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if not bb:
        return im
    pad = int(max(im.size) * 0.02)
    x0, y0, x1, y1 = bb
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def main():
    total = 0
    feitos = 0
    faltando = []
    for grupo, nome, rel, larg in FIGURAS:
        src = os.path.join(ID, rel)
        dst_dir = os.path.join(OUT, grupo)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, nome + ".webp")
        if not os.path.exists(src):
            faltando.append(rel)
            continue
        if os.path.exists(dst) and not TUDO:
            total += os.path.getsize(dst)
            continue
        im = Image.open(src).convert("RGBA")
        if grupo not in ("folhas", "cenario"):
            im = recorta(im)
        if im.width > larg:
            im = im.resize((larg, round(im.height * larg / im.width)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=82, method=6)
        total += os.path.getsize(dst)
        feitos += 1
    print(f"{feitos} exportadas, {len(FIGURAS)} no total, {total / 1024 / 1024:.2f} MB")
    for f in faltando:
        print("FALTA:", f)


if __name__ == "__main__":
    main()
