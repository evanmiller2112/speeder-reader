# SpeederReader — App Store Submission Guide

## EAS Pricing

**Yes, Expo EAS has a free tier.** It includes:

- **15 iOS builds** and **15 Android builds** per month
- Builds run in a **low-priority queue** (slower, but free)
- **1,000 monthly active users** for EAS Update
- **100 GiB** global edge bandwidth

That's enough to build and submit. If you need faster/more builds, the Starter plan is **$19/month**.

> Credits reset each billing period and do not roll over.

---

## Prerequisites

1. **Apple Developer Account** — $99/year at [developer.apple.com](https://developer.apple.com)
2. **Expo account** — Free at [expo.dev](https://expo.dev)
3. **Node.js** and **EAS CLI** installed

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

## Step 2: Configure EAS

From the project root:

```bash
eas build:configure
```

This creates `eas.json`. A good starting config:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

## Step 3: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: SpeederReader
   - **Primary Language**: English
   - **Bundle ID**: `com.speederreader.app` (must match `app.json`)
   - **SKU**: `speederreader` (any unique string)

## Step 4: Build for Production

```bash
eas build --platform ios --profile production
```

- First time: EAS will prompt you to log in to your Apple account and set up certificates/provisioning profiles automatically.
- Build runs in the cloud (free tier: low-priority queue, ~20-40 min).
- You'll get a URL to the build when done.

### Local Build (alternative, no EAS quota used)

```bash
eas build --platform ios --profile production --local
```

Requires Xcode installed. Outputs an `.ipa` file.

## Step 5: Upload Screenshots

In App Store Connect, go to your app → **App Store** tab → **Screenshots**:

Required sizes:
- **6.7" display** (1290 x 2796) — iPhone 15/16 Pro Max
- **6.5" display** (1284 x 2778) — iPhone 14 Plus (optional but recommended)

Pre-generated screenshots are in `assets/screenshots/`:

| Screenshot | Description |
|---|---|
| `01_home_6_7.png` | Home screen with file loaded |
| `02_reader_6_7.png` | Speed reading view |
| `03_browse_6_7.png` | Gutenberg library search |
| `04_focus_6_7.png` | ORP feature highlight |
| `05_url_6_7.png` | URL loading mode |

Upload 5-10 screenshots per size. You can use the `6_5` variants for the 6.5" slot.

## Step 6: Fill in App Store Metadata

In App Store Connect → **App Information**:

| Field | Value |
|---|---|
| **Name** | SpeederReader |
| **Subtitle** | Speed Read Books, PDFs & Articles |
| **Category** | Books |
| **Description** | (see below) |
| **Keywords** | speed reading, RSVP, PDF reader, EPUB, ebook, Gutenberg, reading speed, books, articles |
| **Support URL** | https://speederreader.org |
| **Privacy Policy URL** | https://speederreader.org/privacy (you must host this) |
| **Age Rating** | 4+ (no objectionable content) |

### Suggested Description

```
Read faster. Read more. SpeederReader uses RSVP (Rapid Serial Visual Presentation) to display one word at a time at your chosen speed — up to 750 words per minute.

FEATURES:
• Speed read PDFs, EPUBs, HTML, Markdown, and plain text files
• Browse 60,000+ free books from Project Gutenberg
• Load any URL — articles, blog posts, web pages
• Adjustable speed from 50 to 750 wpm
• Gold-highlighted Optimal Recognition Point for faster word processing
• Save and resume reading progress
• Dark mode reader with paragraph context
• Flow mode for continuous uninterrupted reading

Upload a file, paste a URL, or search the built-in library. SpeederReader handles the rest.
```

## Step 7: Submit

```bash
eas submit --platform ios
```

- Select the build from the list (pick the latest production build)
- EAS will prompt for an **App Store Connect API Key** — follow the prompts to generate one
- The binary uploads to App Store Connect automatically

Then in App Store Connect:
1. Go to your app → **App Store** tab
2. Select the uploaded build under **Build**
3. Fill in **What's New** (e.g., "Initial release")
4. Click **Submit for Review**

## Step 8: Wait for Review

Apple review typically takes **24-48 hours**. You'll get an email when approved (or if changes are requested).

---

## Privacy Policy

Apple requires a privacy policy URL. SpeederReader doesn't collect user data, so a simple one works. Host this at your support URL:

```
Privacy Policy for SpeederReader

Last updated: [DATE]

SpeederReader does not collect, store, or transmit any personal data.

- All files are processed locally on your device.
- Reading progress is stored only on your device.
- No analytics, tracking, or third-party services are used.
- No account or sign-up is required.

Contact: [YOUR EMAIL]
```

---

## Quick Reference Commands

```bash
# Login
eas login

# Configure project
eas build:configure

# Build iOS production
eas build --platform ios --profile production

# Build Android production
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android

# Regenerate app icons and splash
node assets/generate-assets.mjs

# Regenerate App Store screenshots
node assets/generate-screenshots.mjs
```

---

## Sources

- [Expo EAS Pricing](https://expo.dev/pricing)
- [Expo Plans & Billing](https://docs.expo.dev/billing/plans/)
- [Submit to Apple App Store — Expo Docs](https://docs.expo.dev/submit/ios/)
- [Build Your Project — Expo Docs](https://docs.expo.dev/deploy/build-project/)
- [Create Your First Build — Expo Docs](https://docs.expo.dev/build/setup/)
- [Submit to App Stores — Expo Docs](https://docs.expo.dev/deploy/submit-to-app-stores/)
