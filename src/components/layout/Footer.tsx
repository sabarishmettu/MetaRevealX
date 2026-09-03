import React from 'react';
import { Shield, Lock, EyeOff, FileCheck, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/5 bg-[#080808] mt-20 text-zinc-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-amber-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
              <span className="text-base font-bold text-white font-mono tracking-wider">
                META<span className="text-amber-500">REVEALX</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              Open-source privacy platform engineered for in-browser client-side file metadata inspection, EXIF sanitization, and automated risk scoring.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                <Lock className="w-3 h-3" /> In-Browser Sandbox
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                <EyeOff className="w-3 h-3 text-amber-500" /> Zero Storage
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                <FileCheck className="w-3 h-3" /> Lossless Sanitization
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  File Inspector
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('supported-files')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Format Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Cybersecurity Architecture
                </button>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Privacy */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 font-mono mb-4">
              Security & Policy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Threat Model & Scope
                </button>
              </li>
              <li>
                <span className="text-zinc-500 text-[11px] block pt-1 font-mono">
                  Stateless Execution • No Cookies
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>© 2026 MetaRevealX Pro. Zero telemetry architecture.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-dot-green"></span>
              CORE_ENGINE_ACTIVE
            </span>
            <span>v1.0.4 PRO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

