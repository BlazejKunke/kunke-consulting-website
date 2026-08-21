// Regenerates public/images/talent-og.png, the share card for /talent.
// Not part of the build — run it by hand after changing the page's hero:
//   node scripts/build-talent-og.mjs public/images/talent-og.png
// Draws the page's own hero at 1200x630 so a shared link previews the
// talent page instead of a workshop photo from the homepage.

import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf9f6"/>
  <rect x="0" y="0" width="1200" height="10" fill="#0a4731"/>

  <text x="80" y="120" font-family="Menlo, monospace" font-size="24" letter-spacing="3.4" fill="#0a4731">TALENT · POZNAŃ · POLAND</text>

  <text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="72" font-weight="500" letter-spacing="-2.5" fill="#12201b">
    <tspan x="80" y="240">We are looking for</tspan>
    <tspan x="80" y="322">exceptional talent that will</tspan>
  </text>

  <text x="80" y="424" font-family="Menlo, monospace" font-size="44" letter-spacing="-0.8" fill="#52625a">&gt;</text>
  <text x="128" y="424" font-family="Menlo, monospace" font-size="44" letter-spacing="-0.8" fill="#0a4731">bring AI to Polish SMEs</text>
  <rect x="728" y="392" width="22" height="42" fill="#0a4731"/>

  <line x1="80" y1="500" x2="1120" y2="500" stroke="#0a4731" stroke-opacity="0.14" stroke-width="1"/>

  <text x="80" y="556" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="27" font-weight="600" letter-spacing="-0.6" fill="#0a4731">^Kunke Consulting</text>
  <text x="1120" y="556" text-anchor="end" font-family="Menlo, monospace" font-size="22" fill="#52625a">kunkeconsulting.pl/talent</text>
</svg>`;

await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(process.argv[2]);
console.log('written');
