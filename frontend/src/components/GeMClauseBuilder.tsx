import { useState } from 'react';
import { Check, Clipboard, FileText } from 'lucide-react';

const CLAUSE_TEMPLATES = {
  'IS 4151': {
    title: 'Protective Helmets for Motorcyclists (IS 4151:2015)',
    clauses: `SPECIAL TERMS AND CONDITIONS (STC) FOR GeM BID:

1. COMPLIANCE WITH INDIAN STANDARDS:
   The offered motorcycle protective helmets must strictly conform to Indian Standard IS 4151:2015 ("Protective Helmets for Motorcyclists — Specification") incorporating all published amendments.

2. COMPULSORY BIS CERTIFICATION MARK (ISI MARK):
   As per the Helmets for Two-Wheeler Motor Vehicles (Quality Control) Order, 2020 issued by the Ministry of Road Transport and Highways (MoRTH), each helmet must compulsorily bear the Standard Mark (ISI Mark) of the Bureau of Indian Standards.
   - The bidder must submit a valid BIS License (CM/L Number) in the name of the original equipment manufacturer (OEM) along with the bid.
   - The BIS license must be valid on the date of bid submission and throughout the contract execution period.
   - Bids offering products without a valid BIS license shall be rejected during technical evaluation.

3. MANDATORY PERFORMANCE CRITERIA:
   (a) Shock Absorption: Peak acceleration shall not exceed 300g during drop impact tests from 1.5m height onto flat and hemispherical steel anvils.
   (b) Penetration Resistance: 3 kg conical steel striker dropped from 1 meter height shall not make electrical contact with the headform.
   (c) Retention System: Chin strap width shall be minimum 20mm, equipped with a quick-release buckle, capable of withstanding a dynamic test load of 25 kg without failure or displacement exceeding 25mm.
   (d) Environmental Conditioning: Pre-conditioning shall be conducted under ambient (+25°C), cold (-20°C), heat (+50°C), and water-immersion conditions.

4. ACCEPTANCE & LOT TESTING PROTOCOL:
   Consignee reserves the right to draw 2 random samples per lot of 500 units for independent third-party destructive testing at a BIS-recognized or NABL-accredited laboratory. In the event of sample failure, the entire lot shall stand rejected at the supplier's cost.`
  },
  'IS 2925': {
    title: 'Industrial Safety Helmets — Hard Hats (IS 2925:2019)',
    clauses: `SPECIAL TERMS AND CONDITIONS (STC) FOR GeM BID:

1. MANDATORY CONFORMITY TO IS 2925:2019:
   The industrial safety helmets must comply with IS 2925:2019 ("Industrial Safety Helmets — Specification") and bear the mandatory Bureau of Indian Standards (BIS) ISI Mark as per the Personal Protective Equipment (Quality Control) Order, 2021.

2. TECHNICAL PERFORMANCE REQUIREMENTS:
   (a) Force Attenuation: Peak force transmitted to headform shall not exceed 5.0 kN under 5 kg impact drop test from 1m height.
   (b) Electrical Insulation (Class E): The shell shall withstand 2200 V AC at 50 Hz for 1 minute with leakage current less than 3 mA.
   (c) Penetration Resistance: Conical striker dropped from 1 meter shall not touch the headform.
   (d) Flammability: Material must self-extinguish within 5 seconds of open flame removal.

3. TRACEABILITY & MARKING:
   Each unit shall permanently emboss the IS 2925 Mark, OEM Name, Batch Number, and Month/Year of Manufacture.`
  },
  'IS 2745': {
    title: 'Non-metallic Firefighting Helmets (IS 2745:1983)',
    clauses: `SPECIAL TERMS AND CONDITIONS (STC) FOR GeM BID:

1. FIRE SERVICE APPLICABLE STANDARD:
   Protective helmets must conform to IS 2745:1983 (Reaffirmed 2018) for non-metallic helmets for firefighters.
   
2. THERMAL & IMPACT PERFORMANCE:
   (a) Radiant Heat Resistance: Outer shell and liner shall withstand 260°C radiant heat for 5 minutes without igniting, dripping, or permanent deformation.
   (b) Multi-Impact Energy Attenuation under high temperature conditioning.
   (c) Aluminised or Kevlar flame-retardant neck curtain meeting flame exposure protocols.
   (d) Quick-release chin strap operable with firefighter structural gloves.`
  },
  'IS 14740': {
    title: 'Tactical Police & Riot Control Helmets (IS 14740:1999)',
    clauses: `SPECIAL TERMS AND CONDITIONS (STC) FOR GeM BID:

1. LAW ENFORCEMENT STANDARD COMPLIANCE:
   Helmets must conform to IS 14740:1999 for riot control and tactical law enforcement headgear.

2. BALLISTIC VISOR & CHEMICAL RESISTANCE:
   (a) Polycarbonate optical visor withstanding 12-gauge pellet impact at 120 m/s without shatter or detachment.
   (b) Shell and visor resistant to chemical splashes of petrol, tear gas solvent, acids, and alkalis.
   (c) Extended nape protector covering cervical vertebrae.`
  }
};

export function GeMClauseBuilder() {
  const [selectedStandard, setSelectedStandard] = useState<keyof typeof CLAUSE_TEMPLATES>('IS 4151');
  const [tenderRef, setTenderRef] = useState('GEM/2026/B/');
  const [department, setDepartment] = useState('Central Public Procurement Division');
  const [copied, setCopied] = useState(false);

  const activeTemplate = CLAUSE_TEMPLATES[selectedStandard];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.clauses);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="gov-card">
      <div className="gov-card-header flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <FileText size={16} className="text-[#003366]" />
            <span>GeM Tender Clause Assistant & Specification Helper</span>
          </h2>
          <p className="text-xs text-gray-500">
            Generate standards-aligned Special Terms and Conditions (STC) clauses ready to paste into GeM bidding documents
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="btn-gov-primary text-xs"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Clipboard size={14} />
              <span>Copy GeM Clause</span>
            </>
          )}
        </button>
      </div>

      <div className="gov-card-body space-y-6">
        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Select Product Domain & Standard:
            </label>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value as keyof typeof CLAUSE_TEMPLATES)}
              className="w-full text-xs font-bold p-2 border border-gray-300 rounded bg-white text-[#003366] focus:outline-none"
            >
              {Object.entries(CLAUSE_TEMPLATES).map(([code, t]) => (
                <option key={code} value={code}>
                  {code} — {t.title.split('—')[0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              GeM Bid / Tender Number Prefix:
            </label>
            <input
              type="text"
              value={tenderRef}
              onChange={(e) => setTenderRef(e.target.value)}
              className="w-full text-xs font-mono p-2 border border-gray-300 rounded bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Procuring Department / Consignee:
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 rounded bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Clause Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Vetted Clause for GeM Portal Special Terms & Conditions:
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">
              Format: Plain Text / PDF Attachment
            </span>
          </div>

          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-gray-700">
            {activeTemplate.clauses}
          </pre>
        </div>
      </div>
    </div>
  );
}
