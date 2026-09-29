import { useState } from 'react';
import { 
  ExternalLink, 
  Globe, 
  Laptop, 
  Code2
} from 'lucide-react';

export function PortalDemoView() {
  const [copiedCurl, setCopiedCurl] = useState(false);

  const curlCode = `curl -X POST http://localhost:8000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Supply of protective motorcycle helmets with impact attenuation and ISI mark."}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCode);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="bg-[#003366] text-white text-xs font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              Portal Integration & Extension
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Procurement Portal Integration & Lightweight Chrome Extension
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-normal leading-snug">
            Zero-Footprint Integration with GeM & CPPP
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
            The core architecture of ISense is designed to sit directly on top of existing government e-marketplaces (such as GeM and CPPP) without requiring changes to their backend databases or complex enterprise modifications.
          </p>
        </div>
      </div>

      {/* Two cards: Chrome Extension and Clean API */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Chrome Extension */}
        <div className="gov-card">
          <div className="gov-card-header flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
              <Globe size={16} className="text-[#003366]" />
              <span>Browser Overlay Extension</span>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              Manifest V3
            </span>
          </div>

          <div className="gov-card-body space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              A lightweight Manifest V3 browser extension is packaged in the repository at <code>chrome_extension/</code>.
              It allows any procurement officer on GeM to select specification text and get instant standards decision support in an overlay.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">How to load in Google Chrome / Edge:</h4>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-xs sm:text-sm">
                <li>Go to <code>chrome://extensions/</code></li>
                <li>Turn on <strong>Developer mode</strong> (top-right).</li>
                <li>Click <strong>Load unpacked</strong> and select folder: <code className="font-mono text-slate-800">chrome_extension</code>.</li>
                <li>Open the procurement portal simulation below and select any text!</li>
              </ol>
            </div>

            <div className="pt-2">
              <a
                href="/mock_procurement_portal.html"
                target="_blank"
                rel="noreferrer"
                className="btn-gov-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold"
              >
                <Laptop size={15} />
                <span>Open Procurement Portal Simulation ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Clean FastAPI /api/analyze Endpoint */}
        <div className="gov-card">
          <div className="gov-card-header flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
              <Code2 size={16} className="text-[#003366]" />
              <span>Open Procurement API (/api/analyze)</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              REST JSON
            </span>
          </div>

          <div className="gov-card-body space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Any portal, ERP, or bidding system can integrate via a single JSON contract:
            </p>

            <div className="relative">
              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto">
                {curlCode}
              </pre>
              <button
                onClick={handleCopyCurl}
                className="absolute right-2 top-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold transition-colors"
              >
                {copiedCurl ? 'Copied!' : 'Copy cURL'}
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
              <strong>Response Schema:</strong>
              <p className="font-mono text-[11px]">
                {`{ standards: [...], related_standards: [...], coverage: [...], gaps: [...] }`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Preview of the Mock Procurement Webpage */}
      <div className="gov-card">
        <div className="gov-card-header flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
            <Laptop size={16} className="text-[#003366]" />
            <span>Interactive GeM Portal Simulation</span>
          </div>
          <a
            href="/mock_procurement_portal.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#003366] font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Open in Full Tab</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="p-0 border-t border-slate-200">
          <iframe
            src="/mock_procurement_portal.html"
            title="Mock GeM Procurement Portal"
            className="w-full h-[620px] border-none"
          />
        </div>
      </div>
    </div>
  );
}
