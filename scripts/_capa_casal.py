"""Capa do ensaio sobre terapia de casal: o casamento das raposas (a chuva com sol),
o casal sob o guarda-chuva vermelho e a kitsune de óculos espiando, como no carrossel.
Gera só esta capa, sem refazer as outras.  Uso: py scripts/_capa_casal.py"""
import os
import capas_raposa as C

SLUG = "e-possivel-fazer-terapia-de-casal-na-psicologia-analitica"


def capa_casal(W, H):
    b = C.nova(W, H, C.COR["mata"])
    C.textura(b, r"arvores e fundos\padronagens de folhas\momiji_clara.png", 0.22)
    vert = H > W
    cx = int(W * (0.5 if vert else 0.6))
    hc = int(H * (0.7 if vert else 0.86))          # altura do casal sob o wagasa
    topo = H + 4 - hc
    # o sol atrás do guarda-chuva (o casamento das raposas: chuva com sol)
    C.colar(b, C.fig(r"banco\png\casal_o_sol.png"), cx, topo + int(hc * (0.2 if vert else 0.3)), h=int(hc * (0.86 if vert else 0.7)), ancora="meio")
    # a chuva: só a parte de baixo do elemento, sem o sol dele, dos dois lados
    chuva = C.fig(r"banco\png\el_chuva_chuva_com_sol.png")
    chuva = chuva.crop((0, int(chuva.height * 0.64), chuva.width, chuva.height))
    gotas = ((0.14, 0.3), (0.16, 0.72), (0.88, 0.5), (0.9, 0.9)) if vert else ((0.12, 0.35), (0.2, 0.85), (0.92, 0.6))
    for fx, fy in gotas:
        C.colar(b, chuva, int(W * fx), int(H * fy), w=int(W * (0.34 if vert else 0.24)), ancora="meio")
    C.colar(b, C.fig(r"banco\png\casal_o_casal_sob_o_wagasa.png"), cx, H + 4, h=hc)
    # a kitsune de óculos espiando por cima do guarda-chuva
    C.colar(b, C.fig(r"banco\png\casal_kitsune_de_oculos_espiando_sem_cauda.png"), cx - int(hc * 0.2), topo + int(hc * 0.13),
            w=int(hc * 0.24))
    return b


def main():
    dst = os.path.join(C.PUB, "images", "ensaios")
    for W, H, lado in ((1600, 900, "horizontal"), (1080, 1350, "vertical")):
        im = C.grao(capa_casal(W, H)).convert("RGB")
        im.save(os.path.join(dst, f"{SLUG}-{lado}.webp"), "WEBP", quality=84, method=4)
        mini = im.copy()
        mini.thumbnail((900, 900))
        mini.save(os.path.join(dst, f"{SLUG}-{lado}.jpg"), "JPEG", quality=80, optimize=True)
    print("ok")


if __name__ == "__main__":
    main()
