export function Footer() {
  return (
    <footer className="mt-16 bg-[#002147] text-white no-print border-t-2 border-[#f37021]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-300">
          {/* Column 1: Organization */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">
              Bureau of Indian Standards
            </h4>
            <p className="text-slate-300 text-[11.5px] leading-relaxed">
              Manak Bhavan, 9 Bahadur Shah Zafar Marg, New Delhi 110002.
              The National Standards Body of India established under the BIS Act, 2016.
            </p>
            <p className="text-[11.5px] text-amber-300 font-semibold">
              National Consumer Helpline: 1915 / 1800-11-4000
            </p>
          </div>

          {/* Column 2: Government Links */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              National Portals
            </h4>
            <ul className="space-y-1 text-[11.5px]">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  National Portal of India (india.gov.in)
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
                <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">
                  Official BIS Standards Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: SIH Project Notice */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              SIH Flagship Prototype
            </h4>
            <p className="text-[11.5px] leading-relaxed text-slate-300">
              Developed for <strong>Smart India Hackathon (SIH 2024-25)</strong>, Problem Statement 2: AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications.
            </p>
            <div className="pt-1 text-[11px] text-emerald-400 font-mono">
              Engine Version: v2.4.0 (Production Pilot)
            </div>
          </div>

          {/* Column 4: Compliance & RTI */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Compliance & Legal
            </h4>
            <ul className="space-y-1 text-[11.5px]">
              <li>Guidelines for Indian Government Websites (GIGW 3.0)</li>
              <li>Central Vigilance Commission (CVC) Tender Directives</li>
              <li>Right to Information Act, 2005</li>
              <li>Bureau of Indian Standards Act, 2016</li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-8 pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © 2026 Bureau of Indian Standards (BIS), Ministry of Consumer Affairs, Government of India. All rights reserved.
          </p>
          <p className="font-mono">
            Portal ID: BIS-ISENSE-PROD-DELHI-01 · Server: Active
          </p>
        </div>
      </div>
    </footer>
  );
}
