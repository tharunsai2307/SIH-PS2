export function Footer() {
  return (
    <footer className="mt-16 bg-[#002147] text-white no-print border-t-2 border-[#f37021]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-300">
          {/* Column 1: Organization & Domain Context */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">
              Standards Reference Domain
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Based on Indian Standards published by the Bureau of Indian Standards (BIS), established under the Bureau of Indian Standards Act, 2016.
            </p>
            <p className="text-xs text-amber-300 font-semibold">
              Official BIS Portal: bis.gov.in
            </p>
          </div>

          {/* Column 2: Official Portals Reference */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Official Reference Portals
            </h4>
            <ul className="space-y-1 text-[11.5px]">
              <li>
                <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  Bureau of Indian Standards (bis.gov.in)
                </a>
              </li>
              <li>
                <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  Government e-Marketplace (GeM)
                </a>
              </li>
              <li>
                <a href="https://eprocure.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  Central Public Procurement Portal (CPPP)
                </a>
              </li>
              <li>
                <a href="https://www.cvc.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  Central Vigilance Commission (CVC)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Standards Framework Notice */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Bureau of Indian Standards
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              National Decision-Support Platform: AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications.
            </p>
            <div className="pt-1 text-xs text-emerald-400 font-mono">
              Engine Version: v2.4.0 (Active Release)
            </div>
          </div>

          {/* Column 4: Compliance Reference Framework */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Regulatory Framework References
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>Rule 144 of General Financial Rules (GFR), 2017</li>
              <li>CVC Guidelines on Technical Specifications (2021)</li>
              <li>Bureau of Indian Standards Act, 2016</li>
              <li>Helmets (Quality Control) Order, 2020</li>
            </ul>
          </div>
        </div>

        {/* ── Official Advisory Notice ── */}
        <div className="mt-8 pt-5 border-t border-slate-700/80">
          <div className="bg-slate-800/80 border border-slate-600/60 rounded-lg p-3.5 text-center text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400">Notice:</strong> ISense provides automated decision support for procurement and tendering officers. Final procurement qualification and standards conformity should be verified with active gazette notifications before contract award.
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            ISense — Decision-Support Platform for Public Procurement. Standards data derived from curated BIS publications.
          </p>
          <p className="font-mono">
            Build: BIS-PROD-2026 · Bureau of Indian Standards Knowledge Base (11 Curated Standards)
          </p>
        </div>
      </div>
    </footer>
  );
}
