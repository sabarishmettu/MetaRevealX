import React, { useState } from 'react';
import { Shield, ShieldAlert, FileText, Info, Lock, Menu, X, Cpu } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onScanClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onScanClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Overview', icon: Shield },
    { id: 'scanner', label: 'Inspector', icon: Cpu },
    { id: 'supported-files', label: 'Format Matrix', icon: FileText },
    { id: 'about', label: 'Architecture', icon: Info },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Compact Sandbox Status */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            id="nav-brand-btn"
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none rounded-lg py-1 cursor-pointer"
          >
            {/* Diamond Amber Accent */}
            <div className="w-6 h-6 bg-amber-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.45)] transition-transform group-hover:scale-110">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
                META<span className="text-amber-500">REVEALX</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                PRO
              </span>
            </div>
          </button>

          {/* Clean, Non-wrapping Sandbox Badge */}
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-white/10 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Local Sandbox (RAM Only)
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNav(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Quick Security Status */}
          <div className="hidden lg:flex xl:hidden items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-mono text-zinc-300 whitespace-nowrap">
            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
            <span>0-Server RAM</span>
          </div>

          <button
            id="nav-scan-cta-btn"
            onClick={onScanClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Scan File</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="nav-mobile-scan-btn"
            onClick={onScanClick}
            className="px-3 py-1.5 text-xs font-bold text-black bg-amber-500 rounded-lg whitespace-nowrap cursor-pointer"
          >
            Scan
          </button>
          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#080808] px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          <div className="py-2 px-3 mb-2 flex items-center justify-between text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span>100% In-Browser Memory Sandbox</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                id={`mobile-nav-link-${link.id}`}
                onClick={() => handleNav(link.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white bg-amber-500/10 border border-amber-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

