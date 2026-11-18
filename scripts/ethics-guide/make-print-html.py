"""Turn pandoc's HTML of the Ethical Conduct Guide into a print-ready, ^KC-styled page.

Step 2 of 3 in rebuilding public/Kunke-Consulting-Ethical-Conduct-Guide.pdf.
The text is kept verbatim apart from the typo fixes listed in FIXES. The
version and dates in the header below are typed in: update them, and the
footer in print-pdf.cjs, for a new version. Full steps: docs/how-we-work.md.

Usage: python3 -I make-print-html.py <body.html> <out.html>
"""
import re
import sys

src, out = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()

# The title block (first four paragraphs) is re-set as a designed header below.
paras = re.findall(r"<p>.*?</p>\n", html)
assert paras[0].startswith("<p><strong>^Kunke Consulting"), paras[0]
assert "Version 2.6" in paras[3], paras[3]
for p in paras[:4]:
    html = html.replace(p, "", 1)

# Empty headings left over from blank lines in the Google Doc.
html = re.sub(r'<h[12] id="section[^"]*">(?:\s|<br />|&nbsp;| )*</h[12]>\n?', "", html)

# Lists came through wrapped in blockquotes (an indentation artefact).
html = re.sub(r"<li><blockquote>\s*<p>(.*?)</p>\s*</blockquote></li>", r"<li>\1</li>", html, flags=re.S)
assert "<blockquote>" not in html

FIXES = [
    ("internationally when time is right.", "internationally when the time is right."),
    ("<li>Following all relevant regulation;</li>", "<li>following all relevant regulation.</li>"),
]
for old, new in FIXES:
    assert html.count(old) == 1, old
    html = html.replace(old, new)


page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>^Kunke Consulting Ethical Conduct Guide, version 2.6</title>
<meta name="author" content="^Kunke Consulting">
<style>
  @page {{ size: A4; }}
  :root {{
    --green: #0a4731; --ink: #12201b; --body: #2f3d37; --muted: #52625a;
    --rule: rgba(10, 71, 49, 0.18);
  }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  body {{
    margin: 0; color: var(--body);
    font-family: 'Liberation Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10.4pt; line-height: 1.55; letter-spacing: -0.003em;
  }}
  .mono {{ font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace; }}
  header {{ padding-bottom: 9mm; margin-bottom: 4mm; border-bottom: 1px solid var(--rule); }}
  .brand {{ margin: 0 0 16mm; color: var(--green); font-weight: 700; font-size: 12pt; letter-spacing: -0.01em; }}
  .eyebrow {{ margin: 0 0 4mm; color: var(--muted); font-size: 7.6pt; letter-spacing: 0.12em; text-transform: uppercase; }}
  .title {{ margin: 0; color: var(--ink); font-size: 30pt; line-height: 1.05; font-weight: 400; letter-spacing: -0.03em; }}
  .subtitle {{ margin: 3mm 0 7mm; color: var(--body); font-size: 13pt; }}
  .meta {{ margin: 0; color: var(--muted); font-size: 7.6pt; letter-spacing: 0.06em; }}
  .meta span + span::before {{ content: '|'; margin: 0 2.5mm; opacity: 0.6; }}
  h1, h2 {{ color: var(--green); break-after: avoid; page-break-after: avoid; letter-spacing: -0.015em; }}
  h1 {{ margin: 8mm 0 2.5mm; font-size: 14pt; line-height: 1.25; font-weight: 700; }}
  h2 {{ margin: 6mm 0 2mm; font-size: 11.5pt; line-height: 1.3; font-weight: 700; }}
  p {{ margin: 0 0 2.6mm; orphans: 3; widows: 3; }}
  strong {{ color: var(--ink); }}
  ul {{ margin: 0 0 3mm; padding-left: 5.5mm; }}
  li {{ margin: 0 0 1.4mm; padding-left: 1mm; break-inside: avoid; }}
  li::marker {{ color: var(--green); }}
  a {{ color: var(--green); text-decoration: none; }}
  #mission + p, #vision + p {{ font-size: 12pt; line-height: 1.5; color: var(--ink); }}
</style>
</head>
<body>
<header>
  <p class="brand">^Kunke Consulting</p>
  <p class="title">Ethical Conduct Guide</p>
  <p class="subtitle">Mission, Vision and Values</p>
  <p class="meta mono"><span>Created 15 November 2025</span><span>Last updated 18 November 2026</span><span>Version 2.6</span></p>
</header>
<main>
{html}
</main>
</body>
</html>
"""
open(out, "w", encoding="utf-8").write(page)
print("ok", len(page))
