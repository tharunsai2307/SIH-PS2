import { useState, useRef } from 'react';
import { 
  Building, 
  FileEdit, 
  Hash, 
  Loader2, 
  RotateCcw, 
  Sparkles,
  FileUp,
  FileCheck
} from 'lucide-react';
import type { AnalyzeRequest } from '../api/isense';

interface Props {
  onAnalyze: (payload: AnalyzeRequest) => void;
  onAnalyzePdf?: (file: File) => void;
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
  },
  {
    id: 'demo-6',
    title: 'Demo 6: Hindi (हिंदी)',
    subtitle: 'BHASHINI Multilingual Input',
    tenderId: 'GEM/2026/DEMO-HI',
    department: 'उत्तर प्रदेश राज्य सड़क परिवहन निगम',
    domain: 'Motorcycle Helmet',
    badge: 'BHASHINI NMT',
    spec: 'मोटरसाइकिल चालकों के लिए सुरक्षात्मक हेलमेट और झटका अवशोषण परीक्षण और बीआईएस प्रमाणीकरण'
  },
  {
    id: 'demo-7',
    title: 'Demo 7: Tamil (தமிழ்)',
    subtitle: 'BHASHINI Multilingual Input',
    tenderId: 'GEM/2026/DEMO-TA',
    department: 'தமிழ்நாடு அரசு போக்குவரத்துக் கழகம்',
    domain: 'Motorcycle Helmet',
    badge: 'BHASHINI NMT',
    spec: 'இருசக்கர வாகன ஓட்டிகளுக்கான பாதுகாப்பு தலைக்கவசம் மற்றும் ஐஎஸ்ஐ சான்றிதழ்'
  }
];

export function SpecificationInput({ onAnalyze, onAnalyzePdf, loading }: Props) {
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [tenderId, setTenderId] = useState(DEMONSTRATION_SPECIFICATIONS[0].tenderId);
  const [department, setDepartment] = useState(DEMONSTRATION_SPECIFICATIONS[0].department);
  const [domain, setDomain] = useState(DEMONSTRATION_SPECIFICATIONS[0].domain);
  const [spec, setSpec] = useState(DEMONSTRATION_SPECIFICATIONS[0].spec);
  const [strictMode, setStrictMode] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: typeof DEMONSTRATION_SPECIFICATIONS[0]) => {
    setInputMode('text');
    setTenderId(preset.tenderId);
    setDepartment(preset.department);
    setDomain(preset.domain);
    setSpec(preset.spec);
  };

  const handleReset = () => {
    setTenderId('');
    setDepartment('');
    setSpec('');
    setSelectedPdf(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'pdf' && selectedPdf && onAnalyzePdf) {
      onAnalyzePdf(selectedPdf);
    } else if (spec.trim().length >= 5) {
      onAnalyze({
        specification: spec.trim(),
        tender_id: tenderId.trim() || 'GEM/2026/B/MANUAL-EVAL',
        department: department.trim() || 'Public Procurement Division',
        domain: domain,
        strict_mode: strictMode,
      });
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPdf(e.target.files[0]);
    }
  };

  const handleLoadSamplePdf = async () => {
    try {
      const resp = await fetch('http://localhost:8000/demo/sample-tender-pdf');
      const blob = await resp.blob();
      const file = new File([blob], 'tender_motorcycle_helmets.pdf', { type: 'application/pdf' });
      setSelectedPdf(file);
      setInputMode('pdf');
    } catch {
      alert('Backend server not reachable on http://localhost:8000. Please start demo_server.py');
    }
  };

  return (
    <div className="gov-card">
      <div className="gov-card-header flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#003366]">
            {inputMode === 'text' ? <FileEdit size={16} /> : <FileUp size={16} />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Procurement Specification Evaluator
            </h2>
            <p className="text-xs text-gray-500">
              Multilingual NLP · Semantic Vector Retrieval · Tender PDF Extraction (GeM / CPPP)
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                inputMode === 'text'
                  ? 'bg-white text-[#003366] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Text Input
            </button>
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                inputMode === 'pdf'
                  ? 'bg-white text-[#003366] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileUp size={13} />
              <span>Upload PDF Tender</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            title="Reset form"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="gov-card-body space-y-6">
        {/* Preset Specifications Picker */}
        <div>
          <label className="gov-label flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <span>Demonstration Presets (Phases 1, 2, 8):</span>
            </span>
            <span className="text-[11px] text-gray-500 font-normal">
              Click any chip to populate specification
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {DEMONSTRATION_SPECIFICATIONS.map((preset) => {
              const isSelected = inputMode === 'text' && spec === preset.spec;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3.5 sm:p-4 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-[#003366] bg-blue-50/70 shadow-xs ring-1 ring-[#003366]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="font-bold text-gray-900 text-xs sm:text-[13px] truncate">
                      {preset.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      preset.id.startsWith('demo-6') || preset.id.startsWith('demo-7')
                        ? 'bg-purple-100 text-purple-800'
                        : isSelected
                        ? 'bg-[#003366] text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 leading-normal">
                    {preset.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="gov-label flex items-center gap-1.5">
                <Hash size={14} className="text-gray-400" />
                <span>GeM / CPPP Bid Number</span>
              </label>
              <input
                type="text"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                placeholder="e.g. GEM/2026/B/123456"
                className="gov-input font-mono text-sm"
              />
            </div>

            <div>
              <label className="gov-label flex items-center gap-1.5">
                <Building size={14} className="text-gray-400" />
                <span>Procuring Ministry / Department</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Ministry / Public Entity"
                className="gov-input text-sm"
              />
            </div>

            <div>
              <label className="gov-label flex items-center gap-1.5">
                <span>Product Domain Focus</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="gov-input text-sm"
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

          {/* MODE 1: TEXT SPECIFICATION */}
          {inputMode === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="gov-label mb-0 flex items-center gap-2">
                  <span>Draft Procurement Specification Text</span>
                  <span className="text-red-500 font-bold">*</span>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Supports Multilingual (Hindi/Tamil/etc.)
                  </span>
                </label>
                <span className="text-xs text-gray-500 font-mono">
                  {spec.length} characters (min 5)
                </span>
              </div>

              <textarea
                rows={7}
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Paste draft tender clauses, technical specifications, or Indian language requirements (Hindi, Tamil, etc.)..."
                className="gov-textarea text-sm resize-y"
                required
              />
            </div>
          )}

          {/* MODE 2: PDF UPLOAD (PHASE 3) */}
          {inputMode === 'pdf' && (
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-center space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#003366] flex items-center justify-center mx-auto">
                <FileUp size={24} />
              </div>

              {selectedPdf ? (
                <div className="p-3 bg-white border border-emerald-300 rounded-lg inline-flex items-center gap-3 text-xs text-emerald-950 font-medium">
                  <FileCheck size={18} className="text-emerald-600" />
                  <span>
                    Selected: <strong>{selectedPdf.name}</strong> ({(selectedPdf.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPdf(null)}
                    className="text-rose-600 hover:underline ml-2 text-[11px]"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Upload an Official Tender PDF Document
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ISense extracts technical schedules, product clauses, and statutory mandates page-by-page.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-gov-secondary text-xs px-4 py-2"
                >
                  Browse PDF File...
                </button>
                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  className="px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  📄 Load Sample Motorcycle Tender PDF
                </button>
              </div>
            </div>
          )}

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
              disabled={loading || (inputMode === 'text' ? spec.trim().length < 5 : !selectedPdf)}
              className="btn-gov-primary flex items-center gap-2 px-6 py-2.5 shadow-sm text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{inputMode === 'pdf' ? 'Extracting & Analyzing PDF...' : 'Analyzing Specification...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{inputMode === 'pdf' ? 'Analyze Uploaded PDF' : 'Analyze Specification'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
