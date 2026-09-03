# MetaShield 🛡️

**Privacy-First File Metadata Security & Analysis Platform**

> *See what your files reveal. Take back control.*

MetaShield is an open, modern, privacy-focused browser application that analyzes hidden metadata, detects geolocation tags (GPS), identifies device serials and author footprints, and losslessly cleans your files before you share them.

---

## 🔐 Core Privacy Philosophy

* **100% Client-Side Processing**: Files are processed in your browser memory via Web Workers and typed `ArrayBuffer` pipelines.
* **Zero Server Storage**: Your files are never uploaded, logged, or permanently stored on any server.
* **No Account Required**: Completely stateless and anonymous.
* **Non-Destructive Sanitization**: Your original file is never overwritten. MetaShield generates a separate cleaned copy (`_clean.ext`).

---

## ⚡ Features

1. **EXIF & Metadata Scanner**: Deep inspection of EXIF, IPTC, XMP, ICC, and chunk headers.
2. **Transparent Privacy Risk Scoring**: Algorithmic 0–100 threat assessment categorized into LOW, MODERATE, ELEVATED, HIGH, and CRITICAL risk tiers.
3. **GPS Coordinate Extraction**: Pinpoint extraction of latitude, longitude, and elevation with interactive OpenStreetMap preview and 1-click removal.
4. **Lossless JPEG & PNG Sanitization**: Removes `APP1` (EXIF/XMP), `APP2`, `APP13` (IPTC), and `COM` chunks at the binary level without recompressing pixels or degrading optical quality.
5. **PDF Metadata Cleaner**: Clears Author, Creator, Producer, and document timestamps.
6. **Interactive Metadata Editor**: Surgically edit or retain specific fields like Titles, Authors, or Copyrights.
7. **Comprehensive Audit Reports**: Downloadable and printable privacy assessment reports.

---

## 🛠️ Technology Stack

* **Framework**: React 19 + Vite + TypeScript
* **Styling**: Tailwind CSS (Dark Cybersecurity Theme)
* **Metadata Parsers**: `exifreader`, `piexifjs`, `pdf-lib`
* **Icons**: `lucide-react`
* **Animations**: `canvas-confetti`, `motion`

---

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/metashield/metashield.git
cd metashield
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 📄 License

Apache-2.0 License.
