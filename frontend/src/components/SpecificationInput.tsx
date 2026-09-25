import { useState } from 'react';
import { 
  Building, 
  FileEdit, 
  Hash, 
  Loader2, 
  RotateCcw, 
  Sparkles 
} from 'lucide-react';
import type { AnalyzeRequest } from '../api/isense';

interface Props {
  onAnalyze: (payload: AnalyzeRequest) => void;
  loading: boolean;
}

const OFFICIAL_TENDER_PRESETS = [
  {
    id: 'delhi-police',
    title: 'Delhi Police Traffic Div.',
    subtitle: 'Motorcycle Helmets (IS 4151:2015)',
    tenderId: 'GEM/2026/B/789104',
    department: 'Delhi Police (Traffic Headquarters)',
    domain: 'Motorcycle Helmet',
    badge: 'Road Safety',
    spec: `Supply of 5,000 protective helmets for two-wheeler motorcycle riders of Delhi Police Traffic Division. 
The helmets must strictly conform to IS 4151:2015 ("Protective Helmets for Motorcyclists"). 
Mandatory specifications:
1. All supplied helmets must bear the Bureau of Indian Standards (BIS) ISI Mark under a valid CM/L manufacturing license as per Helmets (Quality Control) Order 2020.
2. Shell construction: Rigid thermoplastic with EPS impact absorbing liner of minimum 20mm density.
3. Shock absorption: Peak deceleration shall not exceed 300g during drop tests from 1.5m height onto flat and hemispherical anvils.
4. Retention system: Chin strap with minimum 20mm width and quick-release buckle withstanding 25 kg dynamic load without displacement.
5. Visor: Optically clear polycarbonate with minimum 105 degrees horizontal peripheral vision.`
  },
  {
    id: 'nhai-industrial',
    title: 'NHAI Construction',
    subtitle: 'Safety Hard Hats (IS 2925:2019)',
    tenderId: 'GEM/2026/B/912384',
    department: 'National Highways Authority of India (NHAI)',
    domain: 'Industrial Safety Helmet',
    badge: 'Industrial PPE',
    spec: `Procurement of 12,000 Industrial Safety Helmets for expressway construction engineers and site workers. 
The helmets must comply with IS 2925:2019 and carry the mandatory ISI Certification Mark. 
Key requirements:
1. Impact protection: Transmitted peak force shall not exceed 5000 N under 5 kg drop mass.
2. Electrical insulation: Class E rated to withstand 2200 V AC for 1 minute with leakage under 3mA.
3. Penetration resistance: Conical 3kg steel striker dropped from 1 meter height shall not touch headform.
4. Flammability: Material shall be self-extinguishing within 5 seconds of flame removal.
5. Adjustable suspension harness with 30mm vertical clearance and chin strap.`
  },
  {
    id: 'delhi-fire',
    title: 'Delhi Fire Services',
    subtitle: 'Firefighter Helmets (IS 2745:1983)',
    tenderId: 'GEM/2026/B/445012',
    department: 'Delhi Fire Services (HQ Connaught Place)',
    domain: 'Firefighter Helmet',
    badge: 'Emergency Services',
    spec: `Procurement of 850 Non-metallic Protective Helmets for structural firefighting and emergency rescue operations.
Conformity to IS 2745:1983 (Reaffirmed 2018) is mandatory.
Stipulations:
1. Thermal insulation: Outer shell and liner shall not ignite, deform, or drip when exposed to 260°C radiant heat for 5 minutes.
2. Impact energy attenuation under high temperature conditioning.
3. Heat-resistant Kevlar neck shroud and anti-fog gold-coated polycarbonate face shield.
4. Heavy duty retention system with emergency quick-release mechanism.`
  },
  {
    id: 'crpf-riot',
    title: 'CRPF Tactical Police',
    subtitle: 'Riot Control Helmets (IS 14740:1999)',
    tenderId: 'GEM/2026/B/551209',
    department: 'Central Reserve Police Force (MHA)',
    domain: 'Tactical Riot Helmet',
    badge: 'Law Enforcement',
    spec: `Supply of 3,500 riot control protective helmets for law enforcement personnel conforming to IS 14740:1999.
Requirements:
1. High-impact polycarbonate shell covering crown, temporal, and occipital regions with extended nape protector.
2. Polycarbonate shatter-proof visor withstanding pellet impact at 120 m/s without cracking.
3. Chemical splash resistance against petrol, tear gas solvent, and corrosive agents.
4. Standard ISI marking and MHA technical committee verification.`
  },
  {
    id: 'defective-draft',
    title: '⚠️ Defective Tender Draft',
    subtitle: 'Gap Simulation (Missing Standards)',
    tenderId: 'GEM/2026/B/DRAFT-001',
    department: 'Public Works Department (PWD)',
    domain: 'Protective Headgear',
    badge: 'Audit Simulator',
    spec: `Procurement of 2,000 helmets for road construction survey teams.
Helmets should be lightweight, comfortable to wear in summer, durable, and white in colour.
The contractor must deliver within 30 days to the regional PWD depot.`
  }
];

export function SpecificationInput({ onAnalyze, loading }: Props) {
  const [tenderId, setTenderId] = useState('GEM/2026/B/789104');
  const [department, setDepartment] = useState('Delhi Police (Traffic Headquarters)');
  const [domain, setDomain] = useState('Motorcycle Helmet');
  const [spec, setSpec] = useState(OFFICIAL_TENDER_PRESETS[0].spec);
  const [strictMode, setStrictMode] = useState(true);

  const handleSelectPreset = (preset: typeof OFFICIAL_TENDER_PRESETS[0]) => {
    setTenderId(preset.tenderId);
    setDepartment(preset.department);
    setDomain(preset.domain);
    setSpec(preset.spec);
  };

  const handleReset = () => {
    setTenderId('');
    setDepartment('');
    setSpec('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spec.trim().length >= 10) {
      onAnalyze({
        specification: spec.trim(),
        tender_id: tenderId.trim() || 'GEM/2026/B/MANUAL-EVAL',
        department: department.trim() || 'Public Procurement Division',
        domain: domain,
        strict_mode: strictMode,
      });
    }
  };

  return (
    <div className="gov-card">
      <div className="gov-card-header flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#003366]">
            <FileEdit size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Procurement Tender Specification Input
            </h2>
            <p className="text-xs text-gray-500">
              Government e-Marketplace (GeM) & Central Public Procurement Portal (CPPP) Verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-gray-100"
        >
          <RotateCcw size={12} />
          Reset Form
        </button>
      </div>

      <div className="gov-card-body space-y-6">
        {/* Real-World Public Sector Tender Presets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Load Official Department Tender Template:
            </span>
            <span className="text-[11px] text-gray-500">
              Click any template to auto-populate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {OFFICIAL_TENDER_PRESETS.map((preset) => {
              const isSelected = tenderId === preset.tenderId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-[#003366] bg-blue-50/70 font-semibold text-[#003366] shadow-xs ring-1 ring-[#003366]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-gray-700 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                    )}
                  </div>
                  <div className="font-bold text-gray-900 truncate">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">
                    {preset.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Metadata Row: Tender ID & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Hash size={13} className="text-slate-400" />
                <span>GeM Bid / Tender Ref. Number:</span>
              </label>
              <input
                type="text"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                placeholder="e.g. GEM/2026/B/891240"
                className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-gray-900 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Building size={13} className="text-slate-400" />
                <span>Procuring Ministry / Department:</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Delhi Police, NHAI, Railways, CPWD"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-gray-900 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Draft Specification Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
              <span>
                Technical Specification / Scope of Work Draft:
                <span className="text-red-500 ml-1">*</span>
              </span>
              <span className="text-gray-400 font-normal text-[11px]">
                {spec.length} characters
              </span>
            </label>
            <textarea
              id="specification-input"
              rows={7}
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Paste or type procurement specification, testing criteria, safety requirements, and certification standards here..."
              className="gov-textarea"
            />
          </div>

          {/* Controls & Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 rounded text-[#003366] border-slate-300 focus:ring-[#003366]"
              />
              <span>Strict Quality Control Order (QCO) Verification</span>
            </label>

            <button
              type="submit"
              disabled={loading || spec.trim().length < 10}
              className="btn-gov-primary w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Evaluating against BIS Registry...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300" />
                  <span>Evaluate Tender Specification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
