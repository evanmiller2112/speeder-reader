import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SPIRAL_POINTS =
  '96.0,50.0 92.14,67.45 81.97,81.97 67.15,91.41 50.0,94.43 33.15,90.68 19.14,80.86 10.04,66.55 ' +
  '7.14,50.0 10.77,33.75 20.25,20.25 34.05,11.49 50.0,8.71 65.65,12.22 78.64,21.36 87.05,34.65 ' +
  '89.71,50.0 86.33,65.05 77.53,77.53 64.75,85.6 50.0,88.14 35.55,84.88 23.58,76.42 15.85,64.15 ' +
  '13.43,50.0 16.58,36.16 24.7,24.7 36.46,17.3 50.0,15.0 63.24,18.03 74.19,25.81 81.25,37.06 ' +
  '83.43,50.0 80.52,62.64 73.08,73.08 62.34,79.8 50.0,81.86 37.96,79.07 28.03,71.97 21.66,61.74 ' +
  '19.71,50.0 22.38,38.56 29.14,29.14 38.86,23.11 50.0,21.29 60.84,23.83 69.75,30.25 75.44,39.46 ' +
  '77.14,50.0 74.71,60.24 68.64,68.64 59.94,73.99 50.0,75.57 40.36,73.26 32.47,67.53 27.46,59.33 ' +
  '26.0,50.0 28.19,40.97 33.59,33.59 41.27,28.92 50.0,27.57 58.43,29.64 65.3,34.7 69.63,41.87 ' +
  '70.86,50.0 68.91,57.83 64.19,64.19 57.53,68.18 50.0,69.29 42.77,67.45 36.92,63.08 33.27,56.93 ' +
  '32.29,50.0 34.0,43.37 38.03,38.03 43.67,34.72 50.0,33.86 56.03,35.45 60.86,39.14 63.83,44.27 ' +
  '64.57,50.0 63.1,55.43 59.75,59.75 55.13,62.37 50.0,63.0 45.18,61.65 41.36,58.64 39.08,54.52 ' +
  '38.57,50.0 39.8,45.78 42.47,42.47 46.08,40.53 50.0,40.14 53.62,41.26 56.41,43.59 58.02,46.68 ' +
  '58.29,50.0 57.29,53.02 55.3,55.3 52.72,56.57 50.0,56.71 47.58,55.84 45.81,54.19 44.89,52.12 ' +
  '44.86,50.0 45.61,48.18 46.92,46.92 48.48,46.34 50.0,46.43 51.22,47.06 51.97,48.03 52.21,49.08 52.0,50.0';

const BG_COLOR = '#18100A';
const STROKE_COLOR = '#C8A951';
const TEXT_COLOR = '#F4ECD8';

function makeSpiralSvg(size, strokeWidth, showText = false, padding = 0.15) {
  // padding as fraction of size
  const pad = size * padding;
  const viewSize = size;
  // Scale spiral (original 0-100 viewBox) to fit within padded area
  const scale = (viewSize - 2 * pad) / 100;
  const tx = pad;
  const ty = pad;

  let textEl = '';
  if (showText) {
    const fontSize = size * 0.065;
    const textY = viewSize - pad * 0.35;
    textEl = `<text x="${viewSize / 2}" y="${textY}" text-anchor="middle" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="${TEXT_COLOR}" letter-spacing="${fontSize * 0.15}">SPEEDER READER</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewSize} ${viewSize}">
  <rect width="${viewSize}" height="${viewSize}" fill="${BG_COLOR}" rx="${size * 0.18}"/>
  <g transform="translate(${tx},${ty}) scale(${scale})">
    <polyline points="${SPIRAL_POINTS}" stroke="${STROKE_COLOR}" stroke-width="${strokeWidth / scale}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  ${textEl}
</svg>`;
}

function makeAdaptiveIconSvg(size) {
  // Android adaptive icon: foreground only, no background, extra padding (safe zone is inner 66%)
  const pad = size * 0.22;
  const scale = (size - 2 * pad) / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <polyline points="${SPIRAL_POINTS}" stroke="${STROKE_COLOR}" stroke-width="${3.5 / scale * 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

function makeSplashSvg(width, height) {
  // Spiral centered, about 25% of width
  const spiralSize = width * 0.25;
  const scale = spiralSize / 100;
  const sx = (width - spiralSize) / 2;
  const sy = (height / 2) - spiralSize * 0.6;

  const fontSize = width * 0.055;
  const textY = sy + spiralSize + fontSize * 1.8;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>
  <g transform="translate(${sx},${sy}) scale(${scale})">
    <polyline points="${SPIRAL_POINTS}" stroke="${STROKE_COLOR}" stroke-width="${3.5 / scale * 2.5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="${TEXT_COLOR}" letter-spacing="${fontSize * 0.12}">SPEEDER READER</text>
</svg>`;
}

function makeFaviconSvg(size) {
  const pad = size * 0.08;
  const scale = (size - 2 * pad) / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG_COLOR}" rx="${size * 0.15}"/>
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <polyline points="${SPIRAL_POINTS}" stroke="${STROKE_COLOR}" stroke-width="${3.5 / scale * 1.5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function generate() {
  const dir = __dirname;

  // App icon (1024x1024)
  const iconSvg = makeSpiralSvg(1024, 3.5);
  await sharp(Buffer.from(iconSvg)).png().toFile(join(dir, 'icon.png'));
  console.log('icon.png created (1024x1024)');

  // Android adaptive icon foreground (1024x1024, transparent bg)
  const adaptiveSvg = makeAdaptiveIconSvg(1024);
  await sharp(Buffer.from(adaptiveSvg)).png().toFile(join(dir, 'adaptive-icon.png'));
  console.log('adaptive-icon.png created (1024x1024)');

  // Splash screen (1284x2778 - iPhone 14 Pro Max)
  const splashSvg = makeSplashSvg(1284, 2778);
  await sharp(Buffer.from(splashSvg)).png().toFile(join(dir, 'splash.png'));
  console.log('splash.png created (1284x2778)');

  // Favicon (48x48)
  const faviconSvg = makeFaviconSvg(48);
  await sharp(Buffer.from(faviconSvg)).png().toFile(join(dir, 'favicon.png'));
  console.log('favicon.png created (48x48)');
}

generate().catch(console.error);
