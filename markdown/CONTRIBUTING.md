# Contributing to SpeederReader

SpeederReader is free, open-source software and welcomes contributions of all kinds — bug fixes, new features, documentation improvements, and design feedback.

## Getting Started

```bash
git clone https://github.com/your-username/speeder-reader.git
cd speeder-reader
npm install
npm start
```

## Project Structure

```
speeder-reader/
├── App.tsx                      # Root navigator (Home → Reader)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Native home (file picker, WPM, progress)
│   │   ├── HomeScreen.web.tsx   # Web home (Metro auto-resolves .web.tsx)
│   │   └── ReaderScreen.tsx     # RSVP reader (shared)
│   ├── components/
│   │   └── Logo.tsx             # SVG Archimedean spiral logo
│   └── utils/
│       ├── pdfParser.ts         # PDF/EPUB parsing + word list builder
│       ├── textParser.ts        # TXT/MD/HTML parsing
│       └── progress.ts          # AsyncStorage progress save/load
├── ampt-backend/                # Ampt project (static web hosting)
│   └── static/                  # Built web output (git-ignored)
└── docs/                        # Documentation
```

## Guidelines

- Keep changes focused — one feature or fix per PR
- Match the existing code style (TypeScript, functional components, hooks)
- Test on both web (`npm run web`) and native (`npm run ios` / `npm run android`) when relevant
- Do not introduce external analytics, telemetry, or tracking of any kind — user privacy is a core value of this project

## Building for Web

```bash
npm run build:web   # outputs to ampt-backend/static/
```

## Philosophy

SpeederReader exists to help people read more books. Every design and engineering decision should be evaluated against that goal. Fast to load, easy to use, no friction, no distractions.
