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
            <p className="text-slate-300 text-[11.5px] leading-relaxed">
              Based on Indian Standards published by the Bureau of Indian Standards (BIS), established under the Bureau of Indian Standards Act, 2016.
            </p>
            <p className="text-[11.5px] text-amber-300 font-semibold">
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

          {/* Column 3: SIH Project Notice */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              SIH Hackathon Prototype
            </h4>
            <p className="text-[11.5px] leading-relaxed text-slate-300">
              Developed for <strong>Smart India Hackathon (SIH 2024-25)</strong>, Problem Statement 2: AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications.
            </p>
            <div className="pt-1 text-[11px] text-emerald-400 font-mono">
              Engine Version: v2.4.0 (SIH Evaluation Prototype)
            </div>
          </div>

          {/* Column 4: Compliance Reference Framework */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Regulatory Framework References
            </h4>
            <ul className="space-y-1 text-[11.5px]">
              <li>Rule 144 of General Financial Rules (GFR), 2017</li>
              <li>CVC Guidelines on Technical Specifications (2021)</li>
              <li>Bureau of Indian Standards Act, 2016</li>
              <li>Helmets (Quality Control) Order, 2020</li>
            </ul>
          </div>
        </div>

        {/* ── Prominent Mandatory SIH Prototype Disclaimer ── */}
        <div className="mt-8 pt-5 border-t border-slate-700/80">
          <div className="bg-slate-800/80 border border-slate-600/60 rounded-lg p-3.5 text-center text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400">Notice:</strong> ISense is a Smart India Hackathon prototype and is not an official BIS, GeM, CVC or Government of India system. Standards and regulatory information should be verified against current official publications before procurement decisions.
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            ISense — Decision-Support Prototype for Smart India Hackathon (PS-2). Standards data derived from curated BIS publications.
          </p>
          <p className="font-mono">
            Build: SIH-2024-PS2-DEMO · Demonstration Knowledge Base (11 Curated Standards)
          </p>
        </div>
      </div>
    </footer>
  );
}
