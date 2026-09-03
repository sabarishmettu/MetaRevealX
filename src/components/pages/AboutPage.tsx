import React from 'react';
import { Shield, Eye, Lock, Cpu, Globe, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onScanClick: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onScanClick }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>CYBERSECURITY & THREAT MODEL</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Why Metadata Matters.
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Files carry an invisible digital footprint. MetaRevealX was built to give creators, researchers, and everyday individuals full visibility and control over what they share.
        </p>
      </div>

      {/* The Danger of Hidden Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Physical Geolocation Leaks</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every smartphone photo can encode precise latitude, longitude, and altitude down to meters. When posted online or sent via email, it reveals homes, offices, travel habits, or sensitive meeting spots.
          </p>
        </div>

        <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Hardware Fingerprinting</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Embedded camera body serial numbers and unique device IDs allow state actors and threat intelligence systems to correlate multiple seemingly unrelated images to the exact same physical sensor.
          </p>
        </div>

        <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Author & Workspace Traces</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            PDFs and documents silently register corporate user accounts, internal file server paths, software versions, and editing timelines—exposing internal organization structures to outside observers.
          </p>
        </div>
      </div>

      {/* Client-Side Architecture Breakdown */}
      <div className="p-8 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-6 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">100% Client-Side Architecture</h3>
            <p className="text-xs text-zinc-500 font-sans">Zero server storage • In-memory parsing • No telemetric tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#080808] border border-white/5 rounded-xl space-y-1">
            <strong className="text-white block font-bold">1. In-Browser ArrayBuffer Processing</strong>
            <p className="leading-relaxed text-zinc-400 font-sans">
              Files loaded into MetaRevealX are read directly into browser memory (RAM) as ArrayBuffers. Byte inspection occurs without any network POST requests.
            </p>
          </div>
          <div className="p-4 bg-[#080808] border border-white/5 rounded-xl space-y-1">
            <strong className="text-white block font-bold">2. Lossless Binary Byte Stripping</strong>
            <p className="leading-relaxed text-zinc-400 font-sans">
              JPEG files undergo lossless chunk extraction, excising APP1/APP2/APP13/COM metadata segments without touching pixel matrices.
            </p>
          </div>
          <div className="p-4 bg-[#080808] border border-white/5 rounded-xl space-y-1">
            <strong className="text-white block font-bold">3. Zero File Overwrite</strong>
            <p className="leading-relaxed text-zinc-400 font-sans">
              MetaRevealX generates an independent clean copy (`filename_clean.ext`). Your original file remains untouched on your disk.
            </p>
          </div>
          <div className="p-4 bg-[#080808] border border-white/5 rounded-xl space-y-1">
            <strong className="text-white block font-bold">4. Zero Analytics / Cookies</strong>
            <p className="leading-relaxed text-zinc-400 font-sans">
              No cookies, tracking scripts, or profiling databases exist on this platform. MetaRevealX operates as a stateless client application.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 bg-[#080808] border border-amber-500/30 rounded-2xl text-center space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <h3 className="text-2xl font-bold text-white">See what your files reveal today.</h3>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
          Take control of your privacy before sharing photos, resumes, or documents on public networks.
        </p>
        <button
          onClick={onScanClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold font-mono rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
        >
          <span>Launch File Scanner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

