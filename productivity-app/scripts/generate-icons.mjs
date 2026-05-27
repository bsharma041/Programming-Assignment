// Generates PNG icons for PWA from an SVG source using sharp
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/icons');

// Zenith "Z" icon — blue rounded square
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6390fa"/>
      <stop offset="100%" stop-color="#3b5ef4"/>
    </linearGradient>
  </defs>
  <!-- Rounded square background -->
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  <!-- Stylised Z: top bar, diagonal, bottom bar -->
  <line x1="148" y1="160" x2="364" y2="160" stroke="white" stroke-width="52" stroke-linecap="round"/>
  <line x1="364" y1="160" x2="148" y2="352" stroke="white" stroke-width="52" stroke-linecap="round"/>
  <line x1="148" y1="352" x2="364" y2="352" stroke="white" stroke-width="52" stroke-linecap="round"/>
</svg>`;

// Also a maskable icon (safe zone = inner 80%)
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6390fa"/>
      <stop offset="100%" stop-color="#3b5ef4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <line x1="168" y1="178" x2="344" y2="178" stroke="white" stroke-width="44" stroke-linecap="round"/>
  <line x1="344" y1="178" x2="168" y2="334" stroke="white" stroke-width="44" stroke-linecap="round"/>
  <line x1="168" y1="334" x2="344" y2="334" stroke="white" stroke-width="44" stroke-linecap="round"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
  for (const size of sizes) {
    const buf = Buffer.from(svg(size));
    await sharp(buf, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(join(OUT, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // apple-touch-icon (180x180)
  const atiBuf = Buffer.from(svg(180));
  await sharp(atiBuf, { density: 300 })
    .resize(180, 180)
    .png()
    .toFile(join(OUT, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // maskable 512x512
  const maskBuf = Buffer.from(maskable);
  await sharp(maskBuf, { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(join(OUT, 'icon-512x512-maskable.png'));
  console.log('✓ icon-512x512-maskable.png');

  // Also save source SVG for reference
  writeFileSync(join(OUT, 'icon.svg'), svg(512));
  console.log('✓ icon.svg');

  console.log('\nAll icons generated in public/icons/');
}

run().catch(console.error);
