import { resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'src', 'assets', 'og-preview.jpg');

const NBSP = ' ';
const NAME = 'Paul Rachapong';
const ROLE = 'Forward Deployed Engineer';
const VERBS = `Consults${NBSP}${NBSP}•${NBSP}${NBSP}Architects${NBSP}${NBSP}•${NBSP}${NBSP}Leads${NBSP}${NBSP}•${NBSP}${NBSP}Prototypes`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8ecf3"/>
      <stop offset="100%" stop-color="#fbfcfe"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text
    x="600" y="280"
    text-anchor="middle"
    font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
    font-size="60"
    font-weight="700"
    fill="#0a0a0a"
  >${NAME}</text>
  <text
    x="600" y="345"
    text-anchor="middle"
    font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
    font-size="36"
    font-weight="700"
    fill="#1f2a3d"
  >${ROLE}</text>
  <text
    x="600" y="395"
    text-anchor="middle"
    font-family="DejaVu Sans, Helvetica, Arial, sans-serif"
    font-size="28"
    font-weight="400"
    fill="#3a4a63"
  >${VERBS}</text>
</svg>`.trim();

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92 })
  .toFile(OUT);

console.log(`Wrote ${OUT}`);
