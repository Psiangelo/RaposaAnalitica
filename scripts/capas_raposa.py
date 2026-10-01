"""Capas dos ensaios, imagem de compartilhamento e ícones do site, no estilo da Raposa.

Cada capa é uma composição com as figuras do banco: campo de cor, padronagem
de folhas tom sobre tom, um disco grande atrás (o sol, a lua) e a figura.
Sem texto: o título quem põe é o site (e a imagem de compartilhamento).

Uso: py scripts/capas_raposa.py
"""
import os
import random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ID = r"C:\Users\gabri\OneDrive\Desktop\Raposa Analítica - identidade visual\figuras"
RAIZ = os.path.join(os.path.dirname(__file__), "..")
PUB = os.path.join(RAIZ, "public")
APP = os.path.join(RAIZ, "src", "app")

BAMBUZAL = os.path.join("arvores e fundos", "png", "bambuzal.png")

COR = dict(
    washi="#F2EBDC", papel="#E6D6B4", nevoa="#DCE4DA", mata="#1E3A2F", cedro="#2E5240", musgo="#5C7D4E",
    noite="#1B2B33", tinta="#13211F", torii="#CF432F", urushi="#962B24", ouro="#D7A441", ginkgo="#E9C85E",
    kitsunebi="#6DB5AE", ai="#2E4C7A", fuji="#9B89C2", lua="#EEEAE0", kaki="#DE7A3C", sakura="#EDB7AC",
)


def hexrgb(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def fig(rel):
    im = Image.open(os.path.join(ID, rel)).convert("RGBA")
    bb = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    return im.crop(bb) if bb else im


def por_altura(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def por_largura(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def colar(base, im, cx, base_y, h=None, w=None, ancora="baixo"):
    if h:
        im = por_altura(im, h)
    elif w:
        im = por_largura(im, w)
    x = round(cx - im.width / 2)
    y = round(base_y - im.height) if ancora == "baixo" else round(base_y - im.height / 2)
    base.alpha_composite(im, (x, y))
    return (x, y, x + im.width, y + im.height)


def textura(base, rel, opac=0.5):
    """Padronagem de folhas tom sobre tom, cobrindo a peça."""
    t = Image.open(os.path.join(ID, rel)).convert("RGBA")
    W, H = base.size
    esc = max(W / t.width, H / t.height)
    t = t.resize((round(t.width * esc), round(t.height * esc)), Image.LANCZOS).crop((0, 0, W, H))
    a = t.getchannel("A").point(lambda v: round(v * opac))
    t.putalpha(a)
    base.alpha_composite(t)


def disco(base, cx, cy, r, cor):
    d = ImageDraw.Draw(base)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=hexrgb(cor))


def grao(base, forca=10, semente=3):
    random.seed(semente)
    W, H = base.size
    ruido = Image.effect_noise((W, H), 40).convert("L")
    ruido = ruido.point(lambda v: 128 + (v - 128) * forca // 40)
    camada = Image.merge("RGBA", (ruido, ruido, ruido, Image.new("L", (W, H), 18)))
    return Image.alpha_composite(base, camada.filter(ImageFilter.GaussianBlur(0.4)))


def nova(W, H, fundo):
    return Image.new("RGBA", (W, H), hexrgb(fundo))


# ----------------------------------------------------------------- as capas
def capa_relacao(W, H):
    """Como Jung se relaciona com a sua psicologia? A equação pessoal: a raposa anotando."""
    b = nova(W, H, COR["nevoa"])
    textura(b, r"arvores e fundos\padronagens de folhas\bambu_escura.png", 0.55)
    vert = H > W
    disco(b, int(W * (0.5 if vert else 0.64)), int(H * (0.52 if vert else 0.5)), int(min(W, H) * (0.4 if vert else 0.42)), COR["kaki"])
    colar(b, fig(r"arvores e fundos\png\ramagem_sakura.png"), int(W * 0.2), int(H * 0.42), w=int(W * (0.62 if vert else 0.42)))
    colar(b, fig(r"png\raposa_anotando.png"), int(W * (0.5 if vert else 0.64)), H + 4, h=int(H * (0.66 if vert else 0.86)))
    return b


def capa_consciencia(W, H):
    """O que é consciência em Jung? A lanterna acesa na noite da mata."""
    b = nova(W, H, COR["noite"])
    textura(b, r"arvores e fundos\padronagens de folhas\matsuba_clara.png", 0.35)
    vert = H > W
    colar(b, fig(r"banco\png\el_noite_estrelas.png"), W // 2, int(H * 0.5), w=W)
    colar(b, fig(BAMBUZAL), int(W * (0.12 if vert else 0.1)), H + 10, h=int(H * (0.95 if vert else 1.05)))
    disco(b, int(W * (0.5 if vert else 0.62)), int(H * 0.46), int(min(W, H) * 0.36), "#24404A")
    disco(b, int(W * (0.5 if vert else 0.62)), int(H * 0.46), int(min(W, H) * 0.25), "#2C4E58")
    colar(b, fig(r"banco\png\el_noite_vaga_lumes_hotaru.png"), int(W * 0.3), int(H * 0.86), w=int(W * 0.5))
    colar(b, fig(r"banco\png\el_noite_chochin.png"), int(W * (0.5 if vert else 0.62)), int(H * 0.46), h=int(H * (0.42 if vert else 0.58)), ancora="meio")
    return b


def capa_ciencia(W, H):
    """Psicologia NÃO É CIÊNCIA! A raposa olhando por cima dos óculos, e a coruja."""
    b = nova(W, H, COR["papel"])
    textura(b, r"arvores e fundos\padronagens de folhas\ginkgo_escura.png", 0.5)
    vert = H > W
    d = ImageDraw.Draw(b)
    # campo partindo a peça: uma faixa diagonal da mata
    d.polygon([(0, int(H * 0.72)), (W, int(H * 0.52)), (W, H), (0, H)], fill=hexrgb(COR["cedro"]))
    disco(b, int(W * (0.5 if vert else 0.36)), int(H * 0.44), int(min(W, H) * 0.34), COR["ginkgo"])
    colar(b, fig(r"png\raposa_por_cima.png"), int(W * (0.5 if vert else 0.36)), H + 4, h=int(H * (0.62 if vert else 0.84)))
    colar(b, fig(r"png\coruja.png"), int(W * (0.8 if vert else 0.78)), int(H * (0.5 if vert else 0.62)), h=int(H * (0.22 if vert else 0.36)))
    return b


def capa_inconsciente(W, H):
    """O que é inconsciente em Jung? A floresta (OC 13 §241) e a kitsune espiando."""
    b = nova(W, H, COR["mata"])
    textura(b, r"arvores e fundos\padronagens de folhas\momiji_clara.png", 0.3)
    vert = H > W
    disco(b, int(W * 0.7), int(H * 0.28), int(min(W, H) * 0.2), COR["lua"])
    colar(b, fig(r"arvores e fundos\png\bambuzal.png"), int(W * 0.22), H + 10, h=int(H * 1.08))
    colar(b, fig(r"arvores e fundos\png\bambuzal.png"), int(W * 0.86), H + 10, h=int(H * 0.95))
    colar(b, fig(r"banco\png\casal_kitsune_de_oculos_espiando_sem_cauda.png"), int(W * 0.52), H + 4, w=int(W * (0.78 if vert else 0.44)))
    for fx, fy, fh in ((0.3, 0.52, 0.11), (0.74, 0.6, 0.09), (0.62, 0.36, 0.07)):
        colar(b, fig(r"png\mata_fogo_azul.png"), int(W * fx), int(H * fy), h=int(H * fh), ancora="meio")
    return b


CAPAS = {
    "como-jung-se-relaciona-com-a-sua-psicologia": capa_relacao,
    "o-que-e-consciencia-em-jung": capa_consciencia,
    "psicologia-nao-e-ciencia": capa_ciencia,
    "o-que-e-inconsciente-em-jung": capa_inconsciente,
}


def og_site():
    """Imagem de compartilhamento do site (1200×630) e a quadrada."""
    for W, H, nome in ((1200, 630, "og.png"), (1200, 1200, "og-square.png")):
        b = nova(W, H, COR["mata"])
        textura(b, r"arvores e fundos\padronagens de folhas\bambu_clara.png", 0.25)
        disco(b, int(W * 0.5), int(H * 0.46), int(min(W, H) * 0.36), COR["cedro"])
        colar(b, fig(r"png\perfil_raposa_oculos.png"), W // 2, H + 4, h=int(H * 0.8))
        grao(b).convert("RGB").save(os.path.join(PUB, nome), "PNG", optimize=True)


def icones():
    """Favicon e ícone de atalho: a máscara de três quartos num disco da mata."""
    masc = Image.open(os.path.join(PUB, "raposa", "mascara-34-512.webp")).convert("RGBA")
    for tam, nome in ((512, "icon.png"), (180, "apple-icon.png")):
        b = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
        d = ImageDraw.Draw(b)
        d.ellipse((0, 0, tam - 1, tam - 1), fill=hexrgb(COR["mata"]))
        m = por_altura(masc, int(tam * 0.8)).rotate(6, resample=Image.BICUBIC, expand=True)
        b.alpha_composite(m, ((tam - m.width) // 2 + int(tam * 0.03), (tam - m.height) // 2 + int(tam * 0.05)))
        b.save(os.path.join(APP, nome), "PNG", optimize=True)


def main():
    dst = os.path.join(PUB, "images", "ensaios")
    os.makedirs(dst, exist_ok=True)
    for slug, fn in CAPAS.items():
        for W, H, lado in ((1600, 900, "horizontal"), (1080, 1350, "vertical")):
            im = grao(fn(W, H)).convert("RGB")
            im.save(os.path.join(dst, f"{slug}-{lado}.webp"), "WEBP", quality=84, method=4)
            # irmã em JPG: o gerador da imagem de compartilhamento (resvg) não lê WebP
            mini = im.copy()
            mini.thumbnail((900, 900))
            mini.save(os.path.join(dst, f"{slug}-{lado}.jpg"), "JPEG", quality=80, optimize=True)
    og_site()
    icones()
    print("ok")


if __name__ == "__main__":
    main()
