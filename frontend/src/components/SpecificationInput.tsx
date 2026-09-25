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

const DEMONSTRATION_SPECIFICATIONS = [
  {
    id: 'demo-1',
    title: 'Demo 1: Motorcycle Helmet',
    subtitle: 'Impact, Retention & ISI Mark',
    tenderId: 'GEM/2026/DEMO-01',
    department: 'Delhi Traffic Division',
    domain: 'Motorcycle Helmet',
    badge: 'Complete Spec',
    spec: 'Procure protective motorcycle helmets for two-wheeler riders with impact resistance, retention system and BIS certification.'
  },
  {
    id: 'demo-2',
    title: 'Demo 2: Industrial Safety',
    subtitle: 'Construction & Testing Protocols',
    tenderId: 'GEM/2026/DEMO-02',
    department: 'NHAI Infrastructure Division',
    domain: 'Industrial Safety Helmet',
    badge: 'Industrial PPE',
    spec: 'Procure industrial safety helmets for construction workers with protective headgear requirements and testing requirements.'
  },
  {
    id: 'demo-3',
    title: 'Demo 3: Explicit IS 4151',
    subtitle: 'Direct Standard Citation Boost',
    tenderId: 'GEM/2026/DEMO-03',
    department: 'State Transport Department',
    domain: 'Motorcycle Helmet',
    badge: 'Explicit IS Match',
    spec: 'Motorcycle helmets complying with IS 4151 and requiring BIS certification.'
  },
  {
    id: 'demo-4',
    title: 'Demo 4: Vague / Ambiguous',
    subtitle: 'Clarification Engine Trigger',
    tenderId: 'GEM/2026/DEMO-04',
    department: 'Public Works Division',
    domain: 'General Headgear',
    badge: 'Ambiguity Test',
    spec: 'Helmet for general use.'
  },
  {
    id: 'demo-5',
    title: 'Demo 5: Unknown Standard',
    subtitle: 'IS 999999 Non-Hallucination',
    tenderId: 'GEM/2026/DEMO-05',
    department: 'Testing Laboratory Division',
    domain: 'Research Evaluation',
    badge: 'Negative Test',
    spec: 'Procure protective helmets complying with IS 999999 and requiring batch quality test reports.'
  }
];

export function SpecificationInput({ onAnalyze, loading }: Props) {
  const [tenderId, setTenderId] = useState(DEMONSTRATION_SPECIFICATIONS[0].tenderId);
  const [department, setDepartment] = useState(DEMONSTRATION_SPECIFICATIONS[0].department);
  const [domain, setDomain] = useState(DEMONSTRATION_SPECIFICATIONS[0].domain);
  const [spec, setSpec] = useState(DEMONSTRATION_SPECIFICATIONS[0].spec);
  const [strictMode, setStrictMode] = useState(true);

  const handleSelectPreset = (preset: typeof DEMONSTRATION_SPECIFICATIONS[0]) => {
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
              Procurement Specification Evaluator
            </h2>
            <p className="text-xs text-gray-500">
              Analysis & Decision-Support for Indian Procurement Standards (GeM / CPPP)
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
        {/* Built-in Demonstration Specifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Load Demonstration Specification:
            </span>
            <span className="text-[11px] text-gray-500">
              Click any demonstration specification to test the decision-support engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {DEMONSTRATION_SPECIFICATIONS.map((preset) => {
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

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="gov-label flex items-center gap-1.5">
                <Hash size={13} className="text-gray-400" />
                <span>Tender / Bid Reference (Optional)</span>
              </label>
              <input
                type="text"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                placeholder="e.g. GEM/2026/B/789104"
                className="gov-input font-mono text-xs"
              />
            </div>

            <div>
              <label className="gov-label flex items-center gap-1.5">
                <Building size={13} className="text-gray-400" />
                <span>Procuring Department / Authority</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Ministry / Public Entity"
                className="gov-input text-xs"
              />
            </div>

            <div>
              <label className="gov-label flex items-center gap-1.5">
                <span>Product Domain Focus</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="gov-input text-xs"
              >
                <option value="Motorcycle Helmet">Motorcycle Helmets (IS 4151)</option>
                <option value="Industrial Safety Helmet">Industrial Safety Helmets (IS 2925)</option>
                <option value="Firefighter Helmet">Firefighter Helmets (IS 2745)</option>
                <option value="Tactical Riot Helmet">Tactical Riot Helmets (IS 14740)</option>
                <option value="Racing Helmet">Racing Helmets (IS 9562)</option>
                <option value="Cycling Helmet">Cycling Helmets (IS 4129)</option>
                <option value="Equestrian Helmet">Equestrian Helmets (IS 15758)</option>
                <option value="General Headgear">General Protective Headgear</option>
              </select>
            </div>
          </div>

          {/* Main Specification Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="gov-label mb-0">
                Draft Procurement Specification Text <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">
                {spec.length} characters (min 10)
              </span>
            </div>

            <textarea
              rows={6}
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="Paste draft tender clauses, technical specifications, or equipment requirements..."
              className="gov-input font-mono text-xs leading-relaxed resize-y"
              required
            />
          </div>

          {/* Bottom Bar: Strict Mode & Analyze Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="font-semibold text-slate-800">
                Strict Standards Compliance Audit
              </span>
              <span className="text-slate-500 text-[11px]">
                (Flags omissions of mandatory ISI Mark and Quality Control Orders)
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || spec.trim().length < 10}
              className="btn-gov-primary flex items-center gap-2 px-6 py-2.5 shadow-sm text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing Specification...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Specification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
