// Step 3 of 3 in rebuilding public/Kunke-Consulting-Ethical-Conduct-Guide.pdf:
// prints the page from make-print-html.py to an A4 PDF with Chromium, adding
// the page-number footer. Usage: node print-pdf.cjs <absolute path to html> <out.pdf>
// See docs/how-we-work.md.
const { chromium } = require('playwright');
(async () => {
  const [,, input, output] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + input, { waitUntil: 'load' });
  await p.pdf({
    path: output, format: 'A4', printBackground: true,
    margin: { top: '22mm', bottom: '24mm', left: '22mm', right: '22mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;padding:0 22mm;font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:.06em;color:#52625a;display:flex;justify-content:space-between;">
      <span>^Kunke Consulting &middot; Ethical Conduct Guide &middot; Version 2.6</span>
      <span>kunkeconsulting.pl &middot; <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await b.close();
})();
