# Koda Reader Release v1.0.0

🎉 **Koda Reader v1.0.0** is here! A high-performance CBZ / ZIP comic & manga reader tailored for macOS.

---

### 🌟 What's New in v1.0.0

#### 🏷️ Official Rebranding
- Renamed project and package to **Koda Reader** (`koda-reader`).
- macOS bundle ID updated to `com.kodareader.mac`.

#### ⚡ Video Player-Style Stream Architecture (Zero RAM & Storage Waste)
- **Metadata-Only Scanning**: Scanning folders now only reads file path lists without pulling archive contents into memory.
- **On-Demand Page Streaming**: Extracts pages on-the-fly and garbage-collects old image URLs and ZIP buffer references.
- **Strict RAM Cap**: Capped image caching to 2-3 images via LRU cache.

#### 📖 Continuous Chapter Reading (Mihon & Tachiyomi Style)
- **Instant Seamless Transitions**: Removed auto-next countdown timers for uninterrupted reading.
- **Bidirectional Chapter Flow**: Easily swipe or key-navigate back and forth between adjacent chapters.
- **Chapter Badge Overlays**: Floating toast notification (`Chapter X of Y : Title`) appears when switching chapters.
- **Webtoon Navigation Banners**: Quick-switch buttons at the top and bottom of webtoon continuous scroll views.

---

### 📦 Artifacts
- **macOS Apple Silicon Installer**: `Koda Reader-1.0.0-arm64.dmg`
- **macOS Compressed Binary**: `Koda Reader-1.0.0-arm64-mac.zip`

---

### 🚀 Build & Install
```bash
git clone https://github.com/your-username/koda-reader.git
cd koda-reader
npm install
npm run electron:build
```
