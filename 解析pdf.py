#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, glob, sys
from pdfminer.high_level import extract_text

FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "报告格式")
OUT = os.path.join(FOLDER, "解析")
os.makedirs(OUT, exist_ok=True)

pdfs = sorted(glob.glob(os.path.join(FOLDER, "*.pdf")))
print(f"找到 {len(pdfs)} 个 PDF:\n")
for p in pdfs:
    name = os.path.splitext(os.path.basename(p))[0]
    try:
        text = extract_text(p)
    except Exception as e:
        text = f"[解析失败] {e}"
    lines = [l.rstrip() for l in text.splitlines()]
    lines = [l for l in lines if l.strip() != ""]
    out = os.path.join(OUT, name + ".txt")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"- {name}: {len(lines)} 行文本 -> 解析/{name}.txt")

print("\n完成。")
