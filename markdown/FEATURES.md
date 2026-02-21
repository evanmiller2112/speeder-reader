@image https://raw.githubusercontent.com/jottenlips/speeder-reader/refs/heads/main/social-image.png

# SpeederReader — Features

## Speed Reading (RSVP)

Rapid Serial Visual Presentation flashes words one at a time at a fixed position on screen. Your eyes stay still, eliminating the back-and-forth saccades that slow traditional reading. Most people can comfortably reach 2–3× their normal pace within a few sessions.

**Speed range:** 50–750 WPM
**Default:** 250 WPM
**Controls:** −25 / +25 WPM buttons, always visible while reading

---

## Optimal Recognition Point (ORP)

Each word is split at its optimal recognition point — the letter your brain uses as an anchor when reading. For odd-length words this is the exact middle letter; for even-length words it is the left-of-center letter. That letter is highlighted in gold and aligned to the horizontal screen center so your gaze never shifts.

---

## Flow Mode

Natural reading is not metronomic — your brain needs extra time at punctuation boundaries and for long, complex words. Flow mode adjusts each word's display duration dynamically. Toggle on/off from the speed controls bar. On by default.

**Algorithm**

Every word starts from a `baseDelay` derived from your WPM setting:

```
baseDelay = round(60,000 ms / wpm)
```

Two factors can extend that delay:

1. **Punctuation pause** — if the word contains any of `. , ! ? ; : - – —`, the minimum multiplier is raised to **2.0×** (a full extra base-duration pause).
2. **Length bonus** — words longer than 8 characters add **+10% per extra character**: `lengthBonus = max(0, length − 8) × 0.1`.

These are combined and capped at **2.5×**:

```
multiplier = min(2.5, max(punctMultiplier, 1 + lengthBonus))
delay      = round(baseDelay × multiplier)
```

Where `punctMultiplier` is `2` if the word contains punctuation, otherwise `1`.

**Examples at 250 WPM** (baseDelay = 240 ms)

| Word               | Punctuation | Length bonus     | Multiplier        | Delay  |
| ------------------ | ----------- | ---------------- | ----------------- | ------ |
| `the`              | —           | 0                | 1.0×              | 240 ms |
| `reading,`         | ✓           | 0                | 2.0×              | 480 ms |
| `extraordinary`    | —           | (14−8)×0.1 = 0.6 | 1.6×              | 384 ms |
| `unfortunately,`   | ✓           | (15−8)×0.1 = 0.7 | 2.0× (punct wins) | 480 ms |
| `internationally,` | ✓           | (17−8)×0.1 = 0.9 | 2.5× (capped)     | 600 ms |

---

## Context Strip

A paragraph-level view sits above the RSVP word display, showing the surrounding text with the current word highlighted. This keeps you oriented in the narrative and helps comprehension — you always know where you are in the sentence.

---

## Word Navigation

When paused, left `←` and right `→` arrow buttons appear below the context strip so you can step forward or backward one word at a time. Useful for re-reading a confusing phrase or reviewing what you just read.

---

## Dictionary Lookup

Tap **look up word** when paused to look up the current word on Dictionary.com:

- **Web:** opens in a new browser tab
- **iOS / Android:** opens an in-app WebView so you never leave the reader

---

## Progress Saving

Your reading position is saved automatically whenever you turn a page, pause, or jump. When you reopen a file, SpeederReader offers to resume from where you left off. Progress is stored locally on-device — no account required.

---

## Page Jumping

Tap the page indicator in the bottom bar to jump to any page. Jumping saves progress and auto-resumes reading.

---

## Project Gutenberg Browser

Search and load any of the 70,000+ free books from Project Gutenberg directly inside the app — no file download required. Results show title, author, download count, and available format. Books open in the best available format (EPUB preferred, falling back to plain text).

- **Native (iOS / Android):** downloads the file to device cache, then parses on-device
- **Web:** EPUB/PDF open via a new tab for download, then drag-and-drop into Upload; plain-text-only titles open directly in a new tab

---

## Light & Dark Mode

SpeederReader supports both a light and a dark theme, optimized for different reading environments.

| Theme                                              | Best for                                                   |
| -------------------------------------------------- | ---------------------------------------------------------- |
| **Light** — warm cream background, dark brown text | Daytime, bright rooms, outdoor reading                     |
| **Dark** — near-black background, soft cream text  | Night reading, low-light environments, reducing eye strain |

Toggle the theme at any time with the **☾ / ☀** button:

- **Home screen:** top-right corner, next to the language toggle
- **Reader:** speed controls bar, next to the Flow Mode toggle

Your preference is saved locally and persists across sessions. On first launch, SpeederReader matches your device or browser system theme (dark or light).

The gold ORP highlight (`#C8A951`) and accent color remain consistent in both modes for visual continuity.

---

## Localization (English & Spanish)

The full UI is available in English and Spanish. Language is detected automatically from your device or browser settings on first launch. You can switch languages at any time with the **EN / ES** toggle in the top-right corner of the home screen. Your preference is saved locally and persists across sessions.

Localized strings cover all screens: home screen controls, progress indicators, reader overlays, modal dialogs, and the finished screen.

---

## Supported Formats

| Format     | Notes                                     |
| ---------- | ----------------------------------------- |
| PDF        | Parsed via PDF.js (on-device)             |
| EPUB       | Parsed via JSZip; each chapter = one page |
| HTML       | Parsed directly in JS                     |
| Markdown   | Parsed directly in JS                     |
| Plain text | Parsed directly in JS                     |

All parsing is 100% on-device. Your files are never uploaded anywhere.
