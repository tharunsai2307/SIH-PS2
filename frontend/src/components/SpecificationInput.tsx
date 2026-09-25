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
    subtitle: 'Motorcycle Helmets (IS 4151)',
    tenderId: 'GEM/2026/B/789104',
    department: 'Delhi Police (Traffic Headquarters)',
    domain: 'Motorcycle Helmet',
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
    subtitle: 'Safety Hard Hats (IS 2925)',
    tenderId: 'GEM/2026/B/912384',
    department: 'National Highways Authority of India (NHAI)',
    domain: 'Industrial Safety Helmet',
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
    subtitle: 'Firefighter Helmets (IS 2745)',
    tenderId: 'GEM/2026/B/445012',
    department: 'Delhi Fire Services (HQ Connaught Place)',
    domain: 'Firefighter Helmet',
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
    subtitle: 'Riot Control Helmets (IS 14740)',
    tenderId: 'GEM/2026/B/551209',
    department: 'Central Reserve Police Force (MHA)',
    domain: 'Tactical Riot Helmet',
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
    subtitle: 'Simulate Gap Detection',
    tenderId: 'GEM/2026/B/DRAFT-001',
    department: 'Public Works Department (PWD)',
    domain: 'Protective Headgear',
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
      <div className="gov-card-header flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <FileEdit size={18} className="text-[#003366]" />
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Procurement Tender Specification Input
            </h2>
            <p className="text-xs text-gray-500">
              Government e-Marketplace (GeM) / Central Public Procurement Portal (CPPP)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} />
          Reset Form
        </button>
      </div>

      <div className="gov-card-body">
        {/* Real-World Public Sector Tender Presets */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Load Official Department Tender Template:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {OFFICIAL_TENDER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2 rounded border text-xs transition-all ${
                  tenderId === preset.tenderId
                    ? 'border-[#003366] bg-blue-50/70 font-semibold text-[#003366]'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-bold truncate">{preset.title}</div>
                <div className="text-[10px] text-gray-500 truncate">{preset.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metadata Row: Tender ID & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                <Hash size={12} className="text-gray-500" />
                <span>GeM Bid / Tender Ref. Number:</span>
              </label>
              <input
                type="text"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                placeholder="e.g. GEM/2026/B/891240"
                className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded bg-white focus:border-[#003366] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                <Building size={12} className="text-gray-500" />
                <span>Procuring Ministry / Department:</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Delhi Police, NHAI, Railways, CPWD"
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded bg-white focus:border-[#003366] focus:outline-none"
              />
            </div>
          </div>

          {/* Draft Specification Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              <span>Technical Specification / Scope of Work Draft:</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="specification-input"
              rows={8}
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Paste or type procurement specification, testing criteria, safety requirements, and certification standards here..."
              className="gov-textarea"
            />
          </div>

          {/* Controls & Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="rounded text-[#003366] focus:ring-[#003366]"
                />
                <span>Strict Quality Control Order (QCO) Verification</span>
              </label>

              <span className="text-xs text-gray-500">
                {spec.length} characters
              </span>
            </div>

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
                  <Sparkles size={16} className="text-amber-400" />
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
