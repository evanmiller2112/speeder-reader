import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'screenshots');

// App Store sizes
const SIZES = {
  '6.7': { w: 1290, h: 2796 },  // iPhone 15/16 Pro Max (required)
  '6.5': { w: 1284, h: 2778 },  // iPhone 14 Plus
};

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

const BG = '#18100A';
const GOLD = '#C8A951';
const CREAM = '#F4ECD8';
const BROWN_LIGHT = '#F4F1EA';
const BROWN_TEXT = '#382110';
const DIM = '#8B7D6B';

function spiralSvg(size, stroke, color = GOLD) {
  const pad = size * 0.05;
  const scale = (size - 2 * pad) / 100;
  return `<g transform="translate(${pad},${pad}) scale(${scale})">
    <polyline points="${SPIRAL_POINTS}" stroke="${color}" stroke-width="${stroke / scale}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

// ── Screenshot 1: Home Screen ────────────────────────────────────────────────
function homeScreenSvg(w, h) {
  const cx = w / 2;
  const logoSize = w * 0.12;
  const logoY = h * 0.08;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BROWN_LIGHT}"/>

  <!-- Logo -->
  <g transform="translate(${cx - logoSize/2},${logoY})">
    ${spiralSvg(logoSize, 3.5, BROWN_TEXT)}
  </g>

  <!-- Title -->
  <text x="${cx}" y="${logoY + logoSize + 60}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.055}" font-weight="bold" fill="${BROWN_TEXT}">SpeederReader</text>

  <!-- Reading Speed section -->
  <text x="${w*0.08}" y="${h*0.2}" font-family="Georgia, serif" font-size="${w*0.022}" fill="${DIM}" letter-spacing="2">READING SPEED</text>

  <!-- WPM row -->
  <circle cx="${w*0.12}" cy="${h*0.235}" r="${w*0.035}" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.12}" y="${h*0.24}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.04}" fill="${BROWN_TEXT}">−</text>
  <text x="${cx}" y="${h*0.245}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.05}" font-weight="bold" fill="${BROWN_TEXT}">250 wpm</text>
  <circle cx="${w*0.88}" cy="${h*0.235}" r="${w*0.035}" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.88}" y="${h*0.24}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.04}" fill="${BROWN_TEXT}">+</text>

  <!-- Speed track -->
  <rect x="${w*0.08}" y="${h*0.27}" width="${w*0.84}" height="4" rx="2" fill="#D5CFC5"/>
  <rect x="${w*0.08}" y="${h*0.27}" width="${w*0.84*0.286}" height="4" rx="2" fill="${GOLD}"/>
  <text x="${w*0.08}" y="${h*0.29}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">50</text>
  <text x="${w*0.92}" y="${h*0.29}" text-anchor="end" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">750</text>

  <!-- Divider -->
  <line x1="${w*0.08}" y1="${h*0.315}" x2="${w*0.92}" y2="${h*0.315}" stroke="#D5CFC5" stroke-width="1"/>

  <!-- Mode toggle -->
  <rect x="${w*0.08}" y="${h*0.34}" width="${w*0.84}" height="${h*0.04}" rx="8" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <rect x="${w*0.08}" y="${h*0.34}" width="${w*0.28}" height="${h*0.04}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${w*0.22}" y="${h*0.365}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${BROWN_LIGHT}">Upload</text>
  <text x="${cx}" y="${h*0.365}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${DIM}">URL</text>
  <text x="${w*0.78}" y="${h*0.365}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${DIM}">Browse</text>

  <!-- Formats note -->
  <text x="${cx}" y="${h*0.41}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">PDF · EPUB · HTML · Markdown · Plain text</text>

  <!-- Upload button (dashed) -->
  <rect x="${w*0.08}" y="${h*0.43}" width="${w*0.84}" height="${h*0.06}" rx="8" fill="none" stroke="${DIM}" stroke-width="2" stroke-dasharray="8,6"/>
  <text x="${cx}" y="${h*0.466}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.032}" fill="${BROWN_TEXT}">Choose file</text>

  <!-- File info card -->
  <rect x="${w*0.08}" y="${h*0.52}" width="${w*0.84}" height="${h*0.09}" rx="8" fill="white" stroke="#D5CFC5" stroke-width="1.5"/>
  <text x="${w*0.12}" y="${h*0.548}" font-family="Georgia, serif" font-size="${w*0.026}" font-weight="bold" fill="${BROWN_TEXT}">✓ The Great Gatsby</text>
  <text x="${w*0.12}" y="${h*0.572}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">EPUB · 9 pages · 47,094 words</text>
  <text x="${w*0.12}" y="${h*0.594}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${GOLD}">~3h 8m left</text>

  <!-- Start page row -->
  <text x="${w*0.08}" y="${h*0.66}" font-family="Georgia, serif" font-size="${w*0.026}" fill="${DIM}">Start from page</text>
  <circle cx="${w*0.72}" cy="${h*0.655}" r="${w*0.025}" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.72}" y="${h*0.66}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.035}" fill="${BROWN_TEXT}">−</text>
  <rect x="${w*0.77}" y="${h*0.64}" width="${w*0.07}" height="${h*0.028}" rx="4" fill="white" stroke="#D5CFC5" stroke-width="1"/>
  <text x="${w*0.805}" y="${h*0.66}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${BROWN_TEXT}">1</text>
  <circle cx="${w*0.88}" cy="${h*0.655}" r="${w*0.025}" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.88}" y="${h*0.661}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.035}" fill="${BROWN_TEXT}">+</text>

  <!-- Start reading button -->
  <rect x="${w*0.08}" y="${h*0.70}" width="${w*0.84}" height="${h*0.055}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${cx}" y="${h*0.734}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.034}" font-weight="bold" fill="${BROWN_LIGHT}" letter-spacing="0.5">Start reading</text>

  <!-- Marketing header -->
  <rect x="0" y="${h*0.82}" width="${w}" height="${h*0.18}" fill="${BG}"/>
  <text x="${cx}" y="${h*0.89}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.05}" font-weight="bold" fill="${CREAM}">Read More Books</text>
  <text x="${cx}" y="${h*0.935}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" fill="${GOLD}">PDF · EPUB · HTML · Markdown · TXT</text>
</svg>`;
}

// ── Screenshot 2: Reader Screen ──────────────────────────────────────────────
function readerScreenSvg(w, h) {
  const cx = w / 2;
  const word = 'Chapter';
  const mid = 3; // 'p' highlighted

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>

  <!-- Progress bar at top -->
  <rect x="0" y="0" width="${w*0.35}" height="3" fill="${GOLD}"/>

  <!-- Paragraph context (dimmed) -->
  <text x="${cx}" y="${h*0.08}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" fill="#5A4B3A" opacity="0.6">In my younger and more vulnerable years my</text>
  <text x="${cx}" y="${h*0.11}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" fill="#5A4B3A" opacity="0.6">father gave me some advice that I've been</text>
  <text x="${cx}" y="${h*0.14}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" fill="#5A4B3A" opacity="0.6">turning over in my mind ever since.</text>

  <!-- Main word display -->
  <!-- "Cha" -->
  <text x="${cx - w*0.02}" y="${h*0.38}" text-anchor="end" font-family="Georgia, serif" font-size="${w*0.14}" font-weight="bold" fill="${CREAM}">Cha</text>
  <!-- "p" highlighted -->
  <text x="${cx - w*0.02}" y="${h*0.38}" text-anchor="start" font-family="Georgia, serif" font-size="${w*0.14}" font-weight="bold" fill="${GOLD}">p</text>
  <!-- "ter" -->
  <text x="${cx + w*0.06}" y="${h*0.38}" text-anchor="start" font-family="Georgia, serif" font-size="${w*0.14}" font-weight="bold" fill="${CREAM}">ter</text>

  <!-- Focus line -->
  <line x1="${cx - w*0.01}" y1="${h*0.34 - w*0.005}" x2="${cx - w*0.01}" y2="${h*0.285}" stroke="${GOLD}" stroke-width="1.5" opacity="0.5"/>

  <!-- Nav arrows -->
  <circle cx="${w*0.08}" cy="${h*0.36}" r="${w*0.04}" fill="none" stroke="#5A4B3A" stroke-width="1.5"/>
  <text x="${w*0.08}" y="${h*0.368}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.035}" fill="${CREAM}">←</text>
  <circle cx="${w*0.92}" cy="${h*0.36}" r="${w*0.04}" fill="none" stroke="#5A4B3A" stroke-width="1.5"/>
  <text x="${w*0.92}" y="${h*0.368}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.035}" fill="${CREAM}">→</text>

  <!-- Page nav arrows (smaller) -->
  <circle cx="${w*0.08}" cy="${h*0.44}" r="${w*0.032}" fill="none" stroke="#5A4B3A" stroke-width="1"/>
  <text x="${w*0.08}" y="${h*0.447}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${CREAM}">«</text>
  <circle cx="${w*0.92}" cy="${h*0.44}" r="${w*0.032}" fill="none" stroke="#5A4B3A" stroke-width="1"/>
  <text x="${w*0.92}" y="${h*0.447}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${CREAM}">»</text>

  <!-- Time to next page -->
  <text x="${cx}" y="${h*0.49}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${DIM}">1.1 min to next page</text>

  <!-- Tap to pause -->
  <text x="${cx}" y="${h*0.525}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.022}" fill="#5A4B3A">tap to pause</text>

  <!-- WPM controls -->
  <rect x="${w*0.15}" y="${h*0.62}" width="${w*0.7}" height="${h*0.04}" rx="20" fill="none" stroke="#5A4B3A" stroke-width="1.5"/>
  <text x="${w*0.25}" y="${h*0.645}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${CREAM}">−25</text>
  <text x="${cx}" y="${h*0.645}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" font-weight="bold" fill="${CREAM}">250 wpm</text>
  <text x="${w*0.75}" y="${h*0.645}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${CREAM}">+25</text>

  <!-- Flow toggle + dictionary -->
  <rect x="${w*0.3}" y="${h*0.685}" width="${w*0.17}" height="${h*0.03}" rx="15" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <text x="${w*0.385}" y="${h*0.705}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.02}" fill="${GOLD}">flow on</text>

  <!-- Back + page indicator -->
  <text x="${w*0.08}" y="${h*0.95}" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">← back</text>
  <text x="${cx}" y="${h*0.95}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" font-weight="bold" fill="${GOLD}">1 / 9</text>
  <text x="${w*0.92}" y="${h*0.95}" text-anchor="end" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">250</text>

  <!-- Marketing header at bottom (overlaid) -->
  <!-- None for reader - it looks great as-is -->
</svg>`;
}

// ── Screenshot 3: Browse / Gutenberg ─────────────────────────────────────────
function browseScreenSvg(w, h) {
  const cx = w / 2;
  const logoSize = w * 0.09;
  const logoY = h * 0.06;

  const books = [
    { title: 'Romeo and Juliet', author: 'William Shakespeare', downloads: '75,812', fmt: 'EPUB' },
    { title: 'Moby Dick; Or, The Whale', author: 'Herman Melville', downloads: '68,430', fmt: 'EPUB' },
    { title: 'A Tale of Two Cities', author: 'Charles Dickens', downloads: '55,918', fmt: 'EPUB' },
    { title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', downloads: '52,107', fmt: 'EPUB' },
  ];

  let bookCards = '';
  const cardTop = h * 0.38;
  const cardH = h * 0.085;
  const cardGap = h * 0.01;

  books.forEach((b, i) => {
    const y = cardTop + i * (cardH + cardGap);
    bookCards += `
    <rect x="${w*0.08}" y="${y}" width="${w*0.84}" height="${cardH}" rx="8" fill="white" stroke="#D5CFC5" stroke-width="1.5"/>
    <text x="${w*0.12}" y="${y + cardH*0.32}" font-family="Georgia, serif" font-size="${w*0.026}" font-weight="bold" fill="${BROWN_TEXT}">${b.title}</text>
    <text x="${w*0.12}" y="${y + cardH*0.58}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">${b.author}</text>
    <text x="${w*0.12}" y="${y + cardH*0.82}" font-family="Georgia, serif" font-size="${w*0.017}" fill="#A09080">${b.downloads} downloads · ${b.fmt}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BROWN_LIGHT}"/>

  <!-- Logo + title -->
  <g transform="translate(${cx - logoSize/2},${logoY})">
    ${spiralSvg(logoSize, 3, BROWN_TEXT)}
  </g>
  <text x="${cx}" y="${logoY + logoSize + 45}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.045}" font-weight="bold" fill="${BROWN_TEXT}">SpeederReader</text>

  <!-- Mode toggle (Browse active) -->
  <rect x="${w*0.08}" y="${h*0.2}" width="${w*0.84}" height="${h*0.035}" rx="8" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.22}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">Upload</text>
  <text x="${cx}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">URL</text>
  <rect x="${w*0.64}" y="${h*0.2}" width="${w*0.28}" height="${h*0.035}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${w*0.78}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${BROWN_LIGHT}">Browse</text>

  <!-- Search row -->
  <rect x="${w*0.08}" y="${h*0.26}" width="${w*0.62}" height="${h*0.038}" rx="8" fill="white" stroke="#D5CFC5" stroke-width="1.5"/>
  <text x="${w*0.12}" y="${h*0.284}" font-family="Georgia, serif" font-size="${w*0.023}" fill="#A09080">classic literature</text>
  <rect x="${w*0.72}" y="${h*0.26}" width="${w*0.2}" height="${h*0.038}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${w*0.82}" y="${h*0.284}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" font-weight="600" fill="${BROWN_LIGHT}">Search</text>

  <!-- Formats note -->
  <text x="${cx}" y="${h*0.33}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.018}" fill="${DIM}">60,000+ free books from Project Gutenberg</text>

  <!-- Book results -->
  ${bookCards}

  <!-- Marketing footer -->
  <rect x="0" y="${h*0.82}" width="${w}" height="${h*0.18}" fill="${BG}"/>
  <text x="${cx}" y="${h*0.89}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.045}" font-weight="bold" fill="${CREAM}">60,000+ Free Books</text>
  <text x="${cx}" y="${h*0.935}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.026}" fill="${GOLD}">Project Gutenberg Library Built In</text>
</svg>`;
}

// ── Screenshot 4: Speed Reading Focus ────────────────────────────────────────
function focusScreenSvg(w, h) {
  const cx = w / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>

  <!-- Progress bar -->
  <rect x="0" y="0" width="${w*0.6}" height="3" fill="${GOLD}"/>

  <!-- The word, huge and centered -->
  <text x="${cx - w*0.07}" y="${h*0.42}" text-anchor="end" font-family="Georgia, serif" font-size="${w*0.22}" font-weight="bold" fill="${CREAM}">im</text>
  <text x="${cx - w*0.07}" y="${h*0.42}" text-anchor="start" font-family="Georgia, serif" font-size="${w*0.22}" font-weight="bold" fill="${GOLD}">a</text>
  <text x="${cx + w*0.06}" y="${h*0.42}" text-anchor="start" font-family="Georgia, serif" font-size="${w*0.22}" font-weight="bold" fill="${CREAM}">gine</text>

  <!-- Focus tick mark -->
  <line x1="${cx - w*0.06}" y1="${h*0.32}" x2="${cx - w*0.06}" y2="${h*0.29}" stroke="${GOLD}" stroke-width="2" opacity="0.6"/>

  <!-- Marketing text -->
  <text x="${cx}" y="${h*0.58}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.04}" fill="${CREAM}">Optimal Recognition Point</text>
  <text x="${cx}" y="${h*0.625}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.026}" fill="${DIM}">Gold-highlighted letter guides your eye</text>
  <text x="${cx}" y="${h*0.66}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.026}" fill="${DIM}">for faster word recognition</text>

  <!-- Speed badge -->
  <rect x="${cx - w*0.18}" y="${h*0.72}" width="${w*0.36}" height="${h*0.06}" rx="30" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <text x="${cx}" y="${h*0.758}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.04}" font-weight="bold" fill="${GOLD}">Up to 750 wpm</text>

  <!-- Spiral logo -->
  <g transform="translate(${cx - w*0.06},${h*0.84})">
    ${spiralSvg(w*0.12, 3, GOLD)}
  </g>
  <text x="${cx}" y="${h*0.96}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.028}" fill="${CREAM}">SpeederReader</text>
</svg>`;
}

// ── Screenshot 5: URL Mode ───────────────────────────────────────────────────
function urlScreenSvg(w, h) {
  const cx = w / 2;
  const logoSize = w * 0.09;
  const logoY = h * 0.06;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BROWN_LIGHT}"/>

  <!-- Logo + title -->
  <g transform="translate(${cx - logoSize/2},${logoY})">
    ${spiralSvg(logoSize, 3, BROWN_TEXT)}
  </g>
  <text x="${cx}" y="${logoY + logoSize + 45}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.045}" font-weight="bold" fill="${BROWN_TEXT}">SpeederReader</text>

  <!-- Mode toggle (URL active) -->
  <rect x="${w*0.08}" y="${h*0.2}" width="${w*0.84}" height="${h*0.035}" rx="8" fill="none" stroke="${DIM}" stroke-width="1.5"/>
  <text x="${w*0.22}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">Upload</text>
  <rect x="${w*0.36}" y="${h*0.2}" width="${w*0.28}" height="${h*0.035}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${cx}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${BROWN_LIGHT}">URL</text>
  <text x="${w*0.78}" y="${h*0.222}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.023}" fill="${DIM}">Browse</text>

  <!-- URL input row -->
  <rect x="${w*0.08}" y="${h*0.27}" width="${w*0.62}" height="${h*0.038}" rx="8" fill="white" stroke="#D5CFC5" stroke-width="1.5"/>
  <text x="${w*0.12}" y="${h*0.294}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${BROWN_TEXT}">https://example.com/article</text>
  <rect x="${w*0.72}" y="${h*0.27}" width="${w*0.2}" height="${h*0.038}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${w*0.82}" y="${h*0.294}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" font-weight="600" fill="${BROWN_LIGHT}">Load</text>

  <!-- File info card -->
  <rect x="${w*0.08}" y="${h*0.35}" width="${w*0.84}" height="${h*0.09}" rx="8" fill="white" stroke="#D5CFC5" stroke-width="1.5"/>
  <text x="${w*0.12}" y="${h*0.38}" font-family="Georgia, serif" font-size="${w*0.026}" font-weight="bold" fill="${BROWN_TEXT}">✓ article</text>
  <text x="${w*0.12}" y="${h*0.405}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${DIM}">HTML · 5 pages · 1,247 words</text>
  <text x="${w*0.12}" y="${h*0.425}" font-family="Georgia, serif" font-size="${w*0.02}" fill="${GOLD}">~5m left</text>

  <!-- Start reading button -->
  <rect x="${w*0.08}" y="${h*0.48}" width="${w*0.84}" height="${h*0.05}" rx="8" fill="${BROWN_TEXT}"/>
  <text x="${cx}" y="${h*0.512}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.032}" font-weight="bold" fill="${BROWN_LIGHT}">Start reading</text>

  <!-- Marketing footer -->
  <rect x="0" y="${h*0.82}" width="${w}" height="${h*0.18}" fill="${BG}"/>
  <text x="${cx}" y="${h*0.885}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.042}" font-weight="bold" fill="${CREAM}">Speed Read Any URL</text>
  <text x="${cx}" y="${h*0.93}" text-anchor="middle" font-family="Georgia, serif" font-size="${w*0.025}" fill="${GOLD}">Paste a link, extract content, read fast</text>
</svg>`;
}

// ── Generate all ─────────────────────────────────────────────────────────────
const screens = [
  { name: '01_home', fn: homeScreenSvg },
  { name: '02_reader', fn: readerScreenSvg },
  { name: '03_browse', fn: browseScreenSvg },
  { name: '04_focus', fn: focusScreenSvg },
  { name: '05_url', fn: urlScreenSvg },
];

async function generate() {
  for (const size of Object.keys(SIZES)) {
    const { w, h } = SIZES[size];
    for (const screen of screens) {
      const svg = screen.fn(w, h);
      const file = join(OUT, `${screen.name}_${size.replace('.', '_')}.png`);
      await sharp(Buffer.from(svg)).png().toFile(file);
      console.log(`${file.split('/').pop()}`);
    }
  }
}

generate().catch(console.error);
