# YathraFlow (യാത്രാഫ്ലോ)
> **Kerala-First Multimodal Journey Visualiser**  
> Turn complex, disjointed travel directions into step-by-step visual storyboards with honest fare estimates and instant Google Maps navigation.

---

## 🌟 Overview

When organising events in Kerala (hackathons, conferences, weddings, college fests), attendees often struggle to reach venues because local transit combines train, private/KSRTC buses, auto-rickshaws, and walking segments.

**YathraFlow** solves this problem by providing an interactive, zero-backend visual journey editor and storyboard.

## ✨ Key Features

- **Multimodal Leg Sequencing**: Independent per-leg vehicle selection (`Train`, `Bus`, `Auto-Rickshaw`, `Taxi / Car`, `Walking`, and `Ferry / Water Metro`).
- **Google Maps Navigation Deep-Links**:
  - Direct 1-click **"Navigate Leg"** button opening transit/driving/walking directions in Google Maps.
  - Quick **"Test Pin"** search anchors for boarding and alighting stops.
  - **"Full Route on Maps"** button generating an end-to-end journey with intermediate transfer waypoints.
  - Optional custom GPS coordinates and direct Google Maps shortlinks.
- **Honest Pricing & Duration Guarantee**:
  - Doesn't silently collapse unpriced or variable local bus fares to ₹0.
  - Displays verified known subtotals alongside provenance callouts (`Organiser Estimate`, `Verified Data`, `User Entered`).
  - Distinguishes free walking legs and breaks down walking vs vehicle travel time.
- **Alternative Routes**: Manage multiple travel options (e.g. Route A via Chest Hospital vs Route B via Medical College).
- **Zero-Backend Sharing**:
  - Full journey state is compressed directly into the URL query parameters (`jdata` / `embedData`).
  - Shareable link generator.
  - `<iframe>` embed snippet generator for conference / event websites.
  - One-click plain-text email & WhatsApp summary formatter.
  - Dedicated `@media print` optimized view for physical event posters and printable PDFs.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run Oxlint linter
npm run lint

# Build production bundle
npm run build
```

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Linter**: Oxlint
