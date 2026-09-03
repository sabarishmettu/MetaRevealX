# MetaRevealX 🛡️

**Zero-Server, Browser-Based Metadata Security & Privacy Platform**

> *Inspect what your files reveal. Surgically edit, sanitize, or strip hidden metadata in 100% memory.*

🌐 **Live Demo / Test Link**: [https://metareveal-x.vercel.app/](https://metareveal-x.vercel.app/)

---
<img width="287" height="101" alt="Screenshot 2026-09-03 131226" src="https://github.com/user-attachments/assets/f1ca4972-4e55-4a41-aa74-c9ebef53a6b8" />


## ⚡ Overview

**MetaRevealX** is a client-side cybersecurity utility designed to analyze, modify, and strip hidden file metadata—such as GPS coordinates, camera serials, author identities, software versions, and timestamp fingerprints—without uploading your data to any external server.

---

## 🔐 Core Privacy Philosophy

* **100% In-Browser Memory Processing**: All parsing, editing, and binary sanitization occurs strictly inside your browser session using typed `ArrayBuffer` and Web Worker pipelines.
* **0-Server Footprint**: No backend file storage, no logging, no external API uploads.
* **Lossless Binary Sanitization**: Strips `APP1` (EXIF/XMP), `APP2`, `APP13` (IPTC), and comments directly at the byte level without recompressing pixels or degrading image quality.
* **Non-Destructive**: Original files are never overwritten; cleaned files are generated as separate, sanitized downloads.

---

## ✨ Features

1. **Deep Metadata Inspection**: Scans EXIF, IPTC, XMP, ICC color profiles, and PDF structural metadata headers.
2. **Interactive In-Place Metadata Editor**: Modify extracted values (Author, Copyright, Title, Software, File Name) directly within editable textboxes with instant reset and save capabilities.
3. **GPS Coordinate Extraction & Map View**: Automatically extracts latitude, longitude, and elevation with interactive OpenStreetMap previews and 1-click GPS wiping.
4. **Transparent Risk Scoring**: 0–100 privacy threat index highlighting sensitive personal exposures (locations, usernames, hardware signatures).
5. **Multi-Format Support**: Full support for JPEG, PNG, WebP, PDF, TIFF, and HEIC files.
6. **Downloadable Audit Reports**: Export comprehensive markdown and printable PDF/text privacy inspection summaries.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS
* **Metadata Engines**: `exifreader`, `piexifjs`, `pdf-lib`
* **Icons**: `lucide-react`
* **Animations**: `canvas-confetti`, `motion`

---

## 🚀 Quick Start

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/metarevealx/metarevealx.git
   cd metarevealx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔗 Links

* **Live Deployment**: [https://metareveal-x.vercel.app/](https://metareveal-x.vercel.app/)

---

## 📄 License

Licensed under the Apache-2.0 License.
