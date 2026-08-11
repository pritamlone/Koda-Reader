<img width="320" height="320" alt="kodologo Small" src="https://github.com/user-attachments/assets/80249c37-2666-45e2-928f-a42989434b37" />

# Koda Reader 📚

A sleek, high-performance **CBZ / ZIP Comic & Manga Reader** crafted with **React, TypeScript, Tailwind CSS, Vite, and Electron**, tailored specifically for macOS.

![Koda Reader Banner](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg)

---

## 🌟 Key Features

- 📂 **Directory & Continuous Reading**: Automatically scans and playlists all `.cbz` / `.zip` archives in the opened folder. When you finish reading an episode, the app automatically transitions to the next chapter.
- 📖 **Flexible Layout Modes**:
  - **Paged Mode**: Single page or dual-page spread with optional cover page isolation (`First page is Cover`).
  - **Webtoon Mode**: Smooth, continuous vertical scrolling optimized for digital webcomics.
  - **Auto-Spread**: Dynamically enables side-by-side spreads on wide screens (>1100px).
- 🔄 **Manga & Comic Directions**: Instant toggling between **Left-to-Right (LTR)** and **Right-to-Left (RTL)** reading directions.
- ⚡ **Memory Efficient**: Integrated LRU (Least Recently Used) image memory caching to keep memory usage minimal even with high-resolution 4K comic archives.
- 📦 **Built-in CBZ Packager**: Convert image folders directly into optimized `.cbz` comic archives from within the app.
- 🙈 **Zen Auto-Hide UI**: Clean, distraction-free reading mode that smoothly hides toolbars while reading and reveals them on mouse movement.
- ⌨️ **Native Hotkeys**: Complete keyboard navigation (Arrow keys, `J`/`K`, Space, `Cmd+O`, `Cmd+\`, `M` for Manga mode, `F` for Fullscreen).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/koda-reader.git
cd koda-reader

# Install dependencies
npm install
```

### Running in Development

```bash
# Start Vite development server
npm run dev

# Launch Electron app in dev mode
npm run electron:dev
```

---

## 📦 Building for macOS

To package the application into a native Apple Silicon (`arm64`) macOS DMG and `.app` bundle:

```bash
npm run electron:build
```

The output installers and binaries will be generated inside the `dist_electron/` directory:
- `dist_electron/Koda Reader-1.0.0-arm64.dmg`
- `dist_electron/Koda Reader-1.0.0-arm64-mac.zip`

---

## 🏷️ Releases & Version History

### 🚀 **v1.0.0 (Koda Reader Official Release)**
- 🏷️ **Official Name & Branding**: Rebranded application to **Koda Reader** (`koda-reader`).
- ⚡ **Stream-Based Memory Architecture**:
  - Implemented lightweight metadata directory indexing (video player style streaming).
  - Reduced RAM consumption by eliminating duplicate archive buffers and unzipping files directly on-demand.
  - Automatic Garbage Collection (GC) for revoked image URLs and memory buffers.
- 📖 **Continuous Chapter Reading (Mihon/Tachiyomi Style)**:
  - Eliminated delay countdown timers for continuous, instant chapter transitions.
  - Added floating chapter toast notifications (`Chapter X of Y : Title`).
  - Added top/bottom chapter quick-switch banners in Webtoon scroll view.
- 🎨 **Layout & Performance Enhancements**:
  - Webtoon mode, double-page spread with optional cover page isolation, RTL/LTR manga direction toggling.
  - Native macOS toolbar integration with shortcuts and Zen mode auto-hide UI.

---

## 🎨 Setting up App Icons

Place your custom application icons inside the `build/` directory before building:

```
build/
├── icon.icns    <-- Primary macOS Application Icon
└── icon.png     <-- PNG Fallback Icon (512x512 or 1024x1024)
```

### Generating `.icns` on macOS

If you have a high-res PNG image (`icon.png`), convert it to `.icns` using macOS native terminal tools:

```bash
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o build/icon.icns
rm -rf icon.iconset
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Next Page | `→` / `J` / `Space` |
| Previous Page | `←` / `K` |
| First Page | `Home` |
| Last Page | `End` |
| Open File / Folder | `Cmd + O` |
| Toggle Sidebar | `Cmd + \` |
| Toggle Manga Direction (LTR/RTL) | `M` |
| Toggle Double Page Spread | `S` |
| Toggle Fullscreen | `F` |
| Open Shortcuts Help | `?` |

---

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Desktop Runtime**: Electron 29
- **Bundler / Builder**: electron-builder
- **Archive Engine**: JSZip
- **Icons**: Lucide React

---

## 📄 License

MIT License. Open source and free to use.
