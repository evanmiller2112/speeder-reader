# SpeederReader

### _Read more books._

Read them faster, understand them better, and never lose your place.

SpeederReader is a free, open-source speed reading app built on the RSVP (Rapid Serial Visual Presentation) technique — one word at a time, right at the optimal recognition point, so your eyes never move and your reading speed skyrockets.

[![Web App](https://img.shields.io/badge/Open_Web_App-▶_Start_Reading-C8A951?style=for-the-badge&logoColor=white)](https://app.speederreader.org/)

---

## Download

<a href="https://app.speederreader.org/">
  <img src="https://img.shields.io/badge/App_Store-Coming_Soon-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download on the App Store" height="48"/>
</a>
&nbsp;&nbsp;
<a href="https://app.speederreader.org/">
  <img src="https://img.shields.io/badge/Google_Play-Coming_Soon-000000?style=for-the-badge&logo=google-play&logoColor=white" alt="Get it on Google Play" height="48"/>
</a>

_iOS and Android apps coming soon. In the meantime, the full app is available at [https://app.speederreader.org/](https://app.speederreader.org//)._

---

## Mission

Most people want to read more — more books, more long-form writing, more of the things that matter. But life gets in the way. SpeederReader exists to close that gap.

By training your brain to read at 2–3× your natural pace, a 300-page book that once took two weeks can be finished in a weekend. We believe reading deeply and reading quickly are not opposites — and that everyone deserves access to tools that help them do both.

**SpeederReader is and always will be:**

- **Free** — no subscription, no paywall, no ads
- **Open source** — MIT licensed, built in the open
- **Private** — your books never leave your device
- **Universal** — PDF, EPUB, HTML, Markdown, and plain text on any platform
- **Multilingual** — English and Spanish, auto-detected from your device settings

---

## Features

- **RSVP reading** — words flash one at a time at your chosen speed (50–750 WPM)
- **ORP highlighting** — the optimal recognition point letter is highlighted in gold so your brain locks on instantly
- **Flow mode** — automatically slows on punctuation to mirror natural reading rhythm
- **Context strip** — a paragraph view above the word keeps you oriented in the text
- **Word navigation** — step forward/backward word by word when paused
- **Dictionary lookup** — tap "look up word" when paused to open any word in Dictionary.com
- **Progress saving** — your place is saved automatically so you can pick up where you left off
- **Page jumping** — jump to any page instantly
- **Project Gutenberg browser** — search and load any of 70,000+ free books directly in-app
- **Multiple formats** — PDF, EPUB, HTML, Markdown, plain text
- **Works offline** — all parsing happens on-device; no server, no cloud
- **English & Spanish** — full UI localization, auto-detected from device/browser settings

---

## Getting Started

### Use the web app

No install needed → [https://app.speederreader.org/](https://app.speederreader.org/)

### Run locally

```bash
git clone https://github.com/your-username/speeder-reader.git
cd speeder-reader
npm install
npm start          # opens Expo dev server
npm run web        # web browser
npm run ios        # iOS simulator
npm run android    # Android emulator
```

### Build for web

```bash
npm run build:web  # outputs to ampt-backend/static/
```

---

## Tech Stack

- **Expo SDK 52** / React Native 0.76
- **TypeScript**
- **PDF.js v3** (in-browser PDF parsing via WebView/iframe)
- **JSZip v3** (EPUB unzipping)
- **expo-localization** (device/browser locale detection)
- **Project Gutenberg API** (free book catalog)
- **Ampt** (web hosting + CDN)

---

## Contributing

SpeederReader is open source and welcomes contributions. See [markdown/CONTRIBUTING.md](markdown/CONTRIBUTING.md) for guidelines.

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

_Read more books._
