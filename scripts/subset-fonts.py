"""Genera los subsets WOFF2 de las fuentes Atomy usados por el sitio.

Los TTF originales son fuentes coreanas de ~8 MB (11k Hangul + 4.6k CJK). El sitio
solo necesita la parte latina/cirílica; los idiomas CJK, tailandés y jemer caen al
font stack del sistema. Uso: python scripts/subset-fonts.py
"""

import subprocess
import sys
from pathlib import Path

FONTS = Path(__file__).resolve().parent.parent / "src" / "assets" / "fonts"

UNICODES = ",".join([
    "U+0000-00FF",  # Latin basico + suplemento
    "U+0100-024F",  # Latin extendido A y B
    "U+0259",
    "U+02B0-02FF",
    "U+0300-036F",
    "U+0370-03FF",  # Griego
    "U+0400-052F",  # Cirilico
    "U+1E00-1EFF",
    "U+2000-206F",  # Puntuacion general (incluye …)
    "U+20A0-20CF",  # Simbolos de moneda
    "U+2100-214F",
    "U+2190-21BB",
    "U+2212",
    "U+2215",
    "U+25A0-25FF",
])

for source in sorted(FONTS.glob("*.ttf")):
    target = source.with_suffix(".woff2")
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.subset", str(source),
            f"--unicodes={UNICODES}",
            "--layout-features=*",
            "--flavor=woff2",
            "--desubroutinize",
            f"--output-file={target}",
        ],
        check=True,
    )
    print(f"{target.name}: {source.stat().st_size / 1024 / 1024:.2f} MB -> {target.stat().st_size / 1024:.1f} KB")
