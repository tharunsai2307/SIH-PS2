import { BookOpen, CheckSquare, Scale, ShieldCheck } from 'lucide-react';

export function GuidelinesView() {
  const faqs = [
    {
      q: 'Why does ISense evaluate normative references beyond the primary standard?',
      a: 'In Indian Standards, a product standard (such as IS 4151 for motorcycle helmets) explicitly mandates procedures and apparatus defined in normative companion standards (such as IS 7692 for wooden testing headforms or IS 9944 for elastomeric materials). If a tender fails to reference these companion requirements, testing laboratories and suppliers may dispute acceptance parameters during lot inspection.'
    },
    {
      q: 'Is it illegal to procure non-ISI marked helmets in India?',
      a: 'Yes. Under Section 16 and 29 of the Bureau of Indian Standards Act, 2016 and the Helmets for Two-Wheeler Motor Vehicles (Quality Control) Order, 2020, manufacturing, importing, selling, or procuring non-ISI marked helmets is a punishable criminal offense. Government procurement tenders that omit the mandatory ISI mark requirement violate CVC rules and General Financial Rules (GFR Rule 144).'
    },
    {
      q: 'How does ISense calculate the Specification Compliance Rating?',
      a: 'ISense analyzes whether core mandatory requirements (Primary IS specification, BIS ISI Mark, Impact Attenuation, Retention System, Multi-Temperature Pre-conditioning, and Normative References) are specified. Gaps are categorized by severity (High, Medium, Low), and high-severity omissions reduce the compliance rating to alert the procurement officer.'
    },
    {
      q: 'How should a procurement officer use the GeM Tender Clause template?',
      a: 'Copy the generated Special Terms and Conditions (STC) paragraph and paste it directly into the "Buyer Added Specific Terms and Conditions" section of your GeM tender bid before publishing.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="gov-card">
        <div className="gov-card-header">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <BookOpen size={16} className="text-[#003366]" />
            <span>Public Procurement Guidelines & Vigilance Compliance</span>
          </h2>
          <p className="text-xs text-gray-500">
            Rules governing standards specification in Government e-Marketplace (GeM) & CPPP tenders
          </p>
        </div>

        <div className="gov-card-body space-y-6">
          {/* Regulatory Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-[#003366] font-bold text-sm mb-2">
                <Scale size={16} />
                <span>GFR 2017 — Rule 144(i)</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Fundamental principles of public procurement mandate that technical specifications shall, to the extent possible, be in accordance with the national standards approved by the Bureau of Indian Standards (BIS).
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-[#003366] font-bold text-sm mb-2">
                <ShieldCheck size={16} />
                <span>CVC Guidelines on Tenders</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Central Vigilance Commission mandates that specifications must not be tailored to favour a particular brand or vendor. National standards (IS codes) provide the neutral benchmark guaranteeing fair competitive bidding.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 text-[#003366] font-bold text-sm mb-2">
                <CheckSquare size={16} />
                <span>BIS Act 2016 — Section 16</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Whenever the Central Government issues a Quality Control Order (QCO), conformity to the specified Indian Standard and bearing of the Standard Mark (ISI) is mandatory by law across all central and state jurisdictions.
              </p>
            </div>
          </div>

          {/* SIH PS-2 Innovation Architecture */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-2">
            <h3 className="font-bold text-sm text-[#003366]">
              ISense Architecture for Smart India Hackathon (SIH 2024-25) — Problem Statement 2
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Core Innovation:</strong> Traditional search engines only tell an officer which standard applies. ISense's dual-engine architecture:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-800">
              <li><strong>Extracts & Classifies:</strong> Analyzes raw procurement text into technical parameters (shock absorption, retention, conditioning).</li>
              <li><strong>Normative Graph Expansion:</strong> Identifies unstated companion standards (e.g. IS 7692 headforms) through relationship links.</li>
              <li><strong>Clause-by-Clause Gap Detection:</strong> Pinpoints missing legal and technical clauses before tender release to prevent disqualified bids.</li>
              <li><strong>Automated GeM Drafting:</strong> Generates ready-to-use Special Terms & Conditions (STC) text.</li>
            </ol>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Frequently Asked Questions (FAQ) for Procurement Officers
            </h3>

            {faqs.map((f, i) => (
              <div key={i} className="p-3.5 border border-gray-200 rounded-md bg-white">
                <h4 className="font-bold text-xs text-[#003366] mb-1">
                  Q: {f.q}
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
