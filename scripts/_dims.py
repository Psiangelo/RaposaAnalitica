# Mede as figuras exportadas e grava src/data/figuras.json ({"grupo/nome": [w, h]}).
import json, os, glob
from PIL import Image
base = os.path.join(os.path.dirname(__file__), '..', 'public', 'raposa')
out = {}
for f in sorted(glob.glob(os.path.join(base, '*', '*.webp'))):
    g = os.path.basename(os.path.dirname(f)); n = os.path.splitext(os.path.basename(f))[0]
    out[f'{g}/{n}'] = list(Image.open(f).size)
json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'figuras.json'), 'w'), indent=0)
print(len(out))
