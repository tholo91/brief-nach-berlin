import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(process.env.POSTCARD_SHARP_MODULE || '../../../web/node_modules/sharp');
const dir = path.dirname(fileURLToPath(import.meta.url));
const uri = async name => `data:image/png;base64,${(await fs.readFile(path.join(dir, name))).toString('base64')}`;
const background = await uri('cover-illustration.png');
const artwork = await uri('marken-illustration.png');
const navy = '#1D3557';
const font = "'Courier New', Courier, monospace";

function svg(width, height, viewBox, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBox}">${body}</svg>`;
}

let perforations = '';
for (let x = 130; x < 154; x += 1.7) {
  perforations += `<circle cx="${x}" cy="10" r="0.4"/><circle cx="${x}" cy="40" r="0.4"/>`;
}
for (let y = 11; y < 40; y += 1.7) {
  perforations += `<circle cx="129" cy="${y}" r="0.4"/><circle cx="154" cy="${y}" r="0.4"/>`;
}

const cover = svg('162mm', '114mm', '0 0 162 114', `
  <title>Grüße von Brief-nach-Berlin — DIN C6</title>
  <desc>Luftpostkarte mit Berliner Aquarellskyline und einer ausdrücklich dekorativen Ziermarke.</desc>
  <defs><mask id="perforation"><rect x="129" y="10" width="25" height="30" fill="white"/><g fill="black">${perforations}</g></mask></defs>
  <image id="berlin-hintergrund" xlink:href="${background}" x="0" y="0" width="162" height="114" preserveAspectRatio="none"/>
  <g id="ziermarke" mask="url(#perforation)">
    <rect x="129" y="10" width="25" height="30" fill="#fffdf7"/>
    <rect x="130.4" y="11.4" width="22.2" height="27.2" fill="none" stroke="#b9c2b5" stroke-width="0.2"/>
    <image xlink:href="${artwork}" x="130.6" y="12.2" width="21.8" height="18.7" preserveAspectRatio="xMidYMid meet"/>
    <g fill="${navy}" text-anchor="middle" font-family="${font}">
      <text id="ziermarke-zeile-1" x="141.5" y="32.3" font-size="1.9" font-weight="bold">Für gute</text>
      <text id="ziermarke-zeile-2" x="141.5" y="34.7" font-size="1.9" font-weight="bold">Gespräche</text>
      <text id="ziermarke-kennzeichnung" x="141.5" y="37.3" font-size="1.3" letter-spacing="0.12">Ziermarke</text>
    </g>
  </g>
  <g id="fantasiestempel" transform="rotate(-13 128 30)" fill="none" stroke="#526B69" opacity="0.45">
    <circle cx="128" cy="30" r="8.1" stroke-width="0.25"/>
    <circle cx="128" cy="30" r="7.1" stroke-width="0.13"/>
    <path d="M108 27 Q111 25 114 27 T120 27 M107 30 Q110 28 113 30 T119 30 M108 33 Q111 31 114 33 T120 33" stroke-width="0.24"/>
    <text id="stempel-text" x="128" y="30.9" text-anchor="middle" fill="#526B69" stroke="none" font-family="${font}" font-size="2.4" letter-spacing="0.2">DANKE</text>
  </g>
  <g id="gruss" fill="${navy}" font-family="${font}" text-anchor="middle">
    <text id="gruss-zeile-1" x="75" y="46.5" font-size="4.3">Grüße von</text>
    <text id="projektname" x="75" y="59" font-size="8.1" font-weight="bold">Brief-nach-Berlin</text>
  </g>`);

const stamp = svg('1500', '900', '0 0 1500 900', `
  <title>Brief-nach-Berlin — Motiv für die echte individuelle Briefmarke</title>
  <desc>Nur Motiv und Projektname. Die Frankierelemente ergänzt der Post-Konfigurator. Das Seitenverhältnis 5:3 ist eine Arbeitsvorlage.</desc>
  <rect width="1500" height="900" fill="#FAF8F5"/>
  <image id="umschlag-und-kuppel" xlink:href="${artwork}" x="0" y="0" width="1500" height="900" preserveAspectRatio="none"/>
  <g id="projektname" fill="${navy}" font-family="${font}" font-weight="bold" text-anchor="middle">
    <text id="marke-zeile-1" x="750" y="811" font-size="56">Brief-nach-</text>
    <text id="marke-zeile-2" x="750" y="865" font-size="56">Berlin</text>
  </g>`);

if (!process.argv.includes('--render-only')) {
  await fs.writeFile(path.join(dir, 'cover-layout.svg'), cover);
  await fs.writeFile(path.join(dir, 'briefmarken-layout.svg'), stamp);
}

async function render(source, file, width, height) {
  await sharp(Buffer.from(source), { density: 300 }).resize(width, height)
    .flatten({ background: '#FAF8F5' }).jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .withMetadata({ density: 300 }).toFile(path.join(dir, file));
}
await render(await fs.readFile(path.join(dir, 'cover-layout.svg'), 'utf8'), 'cover-din-c6.jpg', 1914, 1346);
await render(await fs.readFile(path.join(dir, 'briefmarken-layout.svg'), 'utf8'), 'briefmarkenmotiv.jpg', 1500, 900);

const coverPreview = `data:image/jpeg;base64,${(await fs.readFile(path.join(dir, 'cover-din-c6.jpg'))).toString('base64')}`;
const stampPreview = `data:image/jpeg;base64,${(await fs.readFile(path.join(dir, 'briefmarkenmotiv.jpg'))).toString('base64')}`;
const preview = svg('1900', '1150', '0 0 1900 1150', `
  <rect width="1900" height="1150" fill="#EDECE7"/>
  <g font-family="${font}" fill="${navy}"><text x="70" y="90" font-size="28">Bildseite · DIN C6</text><text x="1370" y="90" font-size="26">Briefmarkenmotiv</text></g>
  <image xlink:href="${coverPreview}" x="70" y="140" width="1230" height="865"/>
  <image xlink:href="${stampPreview}" x="1370" y="140" width="460" height="276"/>
  <g font-family="${font}" fill="#66716B" font-size="20"><text x="1370" y="460">Separate Upload-Datei</text><text x="1370" y="495">Arbeitsformat 5:3</text><text x="1370" y="530">Ausschnitt noch prüfen</text></g>`);
await sharp(Buffer.from(preview)).jpeg({ quality: 93 }).toFile(path.join(dir, 'vorschau.jpg'));

await fs.writeFile(path.join(dir, 'druckprobe.html'), `<!doctype html><html lang="de"><meta charset="utf-8"><title>Druckprobe Brief-nach-Berlin</title><style>body{font:14px monospace;color:${navy};margin:20mm}img.cover{display:block;width:162mm;height:114mm}img.stamp{display:block;width:40mm;height:24mm}p{max-width:162mm}@page{size:A4;margin:0}@media print{.hint{display:none}}</style><p class="hint">Bei 100 % / tatsächlicher Größe drucken, ohne Seitenanpassung. Das Cover misst 162 × 114 mm. Die Marke unten ist eine beispielhafte 40 × 24-mm-Probe, keine bestätigte Shop-Motivfläche.</p><img class="cover" src="cover-din-c6.jpg" alt="Cover"><p>Briefmarkenmotiv: Größenprobe 40 × 24 mm, Shopformat noch offen.</p><img class="stamp" src="briefmarkenmotiv.jpg" alt="Briefmarkenmotiv"></html>`);

for (const name of ['cover-din-c6.jpg', 'briefmarkenmotiv.jpg', 'vorschau.jpg']) {
  const meta = await sharp(path.join(dir, name)).metadata();
  const stat = await fs.stat(path.join(dir, name));
  console.log(JSON.stringify({ file: name, width: meta.width, height: meta.height, density: meta.density, bytes: stat.size, below5MB: stat.size < 5_000_000 }));
}
