import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, ServerOff } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>PRIVACY & DATA GOVERNANCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          MetaRevealX Privacy Guarantee
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Effective Date: 2026. Plain-language disclosure of our client-side architecture and zero-data retention model.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
        <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
            <ServerOff className="w-4 h-4 text-amber-500" />
            <span>No Server File Storage</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Your files are never transmitted to or saved on any remote server. File processing occurs in your browser's local sandbox memory.
          </p>
        </div>

        <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
            <EyeOff className="w-4 h-4 text-amber-500" />
            <span>No User Account or Login</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            MetaRevealX requires no registration, email, or credentials. You can use all metadata scanning and cleaning tools anonymously.
          </p>
        </div>

        <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Original Files Left Untouched</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            We never overwrite or modify your original file on disk. Clean copies are generated as new downloadable files (`_clean.ext`).
          </p>
        </div>

        <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Zero Tracking Cookies</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            No marketing trackers, third-party analytics, or session logging cookies are placed on your machine.
          </p>
        </div>
      </div>

      {/* Detailed Articles */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 text-xs text-zinc-400 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            1. Scope of File Processing
          </h3>
          <p>
            When you select or drop a file onto MetaRevealX, the browser reads the binary content into a temporary `ArrayBuffer` in Web Worker or main thread RAM. Our client-side algorithms inspect and strip EXIF, IPTC, XMP, and ICC segments locally. Once you navigate away or close the tab, the in-memory buffer is automatically garbage-collected by your browser.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            2. Network Communications
          </h3>
          <p>
            No metadata, file names, GPS coordinates, or image thumbnails are ever transmitted across external network sockets. Map previews for detected GPS coordinates utilize embedded OpenStreetMap rendering based strictly on the coordinate values contained in your local file.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            3. Disclaimer & Verification
          </h3>
          <p>
            While MetaRevealX implements strict byte-level metadata stripping for supported file types, automated analysis cannot account for unstandardized proprietary metadata or steganographic payloads embedded in file bitstreams. Users handling critical intelligence or confidential legal documents should verify outputs prior to public release.
          </p>
        </section>
      </div>
    </div>
  );
};

