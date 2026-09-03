import React from 'react';
import { MapPin, Navigation, Compass, Trash2, AlertOctagon, ExternalLink } from 'lucide-react';
import { GpsData } from '../../types';

interface GpsLocationCardProps {
  gps: GpsData;
  onRemoveGps: () => void;
  isRemoved?: boolean;
}

export const GpsLocationCard: React.FC<GpsLocationCardProps> = ({
  gps,
  onRemoveGps,
  isRemoved = false,
}) => {
  const lat = gps.latitude;
  const lon = gps.longitude;

  // OpenStreetMap embed URL with pin
  const bboxPadding = 0.005;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - bboxPadding}%2C${lat - bboxPadding}%2C${lon + bboxPadding}%2C${lat + bboxPadding}&layer=mapnik&marker=${lat}%2C${lon}`;
  const osmExternalUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <MapPin className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Geographic Coordinates Detected</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                HIGH THREAT
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Extracted from EXIF GPS IFD tags. Exposes capture coordinates.
            </p>
          </div>
        </div>

        <div>
          {isRemoved ? (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg inline-block">
              ✓ GPS Stripped
            </span>
          ) : (
            <button
              id="btn-strip-gps-location"
              onClick={onRemoveGps}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold text-black bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Strip GPS Coordinates</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Coordinates & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Coordinate details */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-500" /> Latitude
            </span>
            <span className="text-white font-bold">{lat.toFixed(6)}° {gps.latitudeRef || (lat >= 0 ? 'N' : 'S')}</span>
          </div>

          <div className="p-3 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" /> Longitude
            </span>
            <span className="text-white font-bold">{lon.toFixed(6)}° {gps.longitudeRef || (lon >= 0 ? 'E' : 'W')}</span>
          </div>

          {gps.altitude !== undefined && (
            <div className="p-3 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between">
              <span className="text-zinc-400">Altitude (Elevation)</span>
              <span className="text-white font-bold">{gps.altitude} meters</span>
            </div>
          )}

          {gps.timestamp && (
            <div className="p-3 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-between">
              <span className="text-zinc-400">Satellite Lock Time</span>
              <span className="text-white font-bold">{gps.timestamp}</span>
            </div>
          )}

          {/* Warning box */}
          <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>
              Anyone who receives this file can look up your exact street, residence, or drone launch coordinates.
            </span>
          </div>
        </div>

        {/* Right: Map Embed */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-white/10 relative bg-[#080808]">
            <iframe
              title="Extracted File GPS Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapEmbedUrl}
              className="w-full h-full filter invert hue-rotate-180 brightness-95 contrast-125"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Rendered from extracted EXIF coordinates</span>
            <a
              href={osmExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              Open in OpenStreetMap <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

