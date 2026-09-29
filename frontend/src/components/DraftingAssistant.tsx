import { useState } from 'react';
import { 
  FileEdit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  PlusCircle, 
  Loader2, 
  Layers, 
  Copy, 
  RotateCcw,
  Check
} from 'lucide-react';
import type { AnalyzeResponse } from '../api/isense';
import { api } from '../api/isense';

export function DraftingAssistant() {
  const [draftText, setDraftText] = useState(
    'Procure protective helmets for motorcycle riders. The helmets should provide head safety and crash protection for riders.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [insertedIdx, setInsertedIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (draftText.trim().length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyze({
        specification: draftText.trim(),
        tender_id: 'GEM/2026/DRAFT-ASSIST',
        department: 'Tender Drafting Committee',
        domain: 'Protective Headgear',
        strict_mode: true
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please verify backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertClause = (clauseText: string, idx: number) => {
    setDraftText((prev) => {
      const trimmed = prev.trim();
      return `${trimmed}\n- ${clauseText}`;
    });
    setInsertedIdx(idx);
    setTimeout(() => setInsertedIdx(null), 2000);
    // Scroll textarea to bottom after insert
    setTimeout(() => {
      const ta = document.getElementById('draft-textarea') as HTMLTextAreaElement | null;
      if (ta) ta.scrollTop = ta.scrollHeight;
    }, 50);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDraftText(
      'Procure protective helmets for motorcycle riders. The helmets should provide head safety and crash protection for riders.'
    );
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#003366] text-white text-xs font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
              Procurement Clause Drafter
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Interactive Tender Specification Drafting Assistant
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#003366] tracking-normal leading-snug">
            Smart Tender Drafting & Real-Time Gap Remediation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Draft tender specifications while ISense continuously checks applicable BIS standards, evaluates coverage across statutory categories, and offers one-click clause insertions to eliminate deficiencies before publication.
          </p>
        </div>
      </div>

      {/* Main Two-Column Drafting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Draft Editor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="gov-card">
            <div className="gov-card-header flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
                <FileEdit size={16} className="text-[#003366]" />
                <span>Tender Specification Draft Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  title="Reset to default example"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleCopyDraft}
                  className="text-xs text-[#003366] font-semibold flex items-center gap-1 hover:underline"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
                </button>
              </div>
            </div>

            <div className="gov-card-body space-y-4">
              <div>
                <textarea
                  id="draft-textarea"
                  rows={10}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Draft your equipment requirements here..."
                  className="gov-textarea text-sm resize-y"
                />
                <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500 font-mono">
                  <span>{draftText.length} characters · {draftText.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>Minimum 5 characters</span>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  Quick Starter Templates:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDraftText('Procure protective helmets for motorcycle riders. The helmets should provide head safety and crash protection for riders.')}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                  >
                    Draft 1: Basic Motorcycle (Gaps Present)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftText('Procure industrial safety helmets for civil construction site workers with protective headgear requirements.')}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                  >
                    Draft 2: Industrial Hard Hats (Gaps Present)
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || draftText.trim().length < 5}
                  className="btn-gov-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Auditing Specification...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze Specification with ISense</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Decision Support & Coverage Feedback */}
        <div className="lg:col-span-6 space-y-4">
          {!result && !loading && (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-sm text-slate-800">
                Live Standards Decision Support
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Click <strong>"Analyze Specification with ISense"</strong> to identify applicable Indian Standards, evaluate the Coverage Matrix, and inspect missing requirement clauses.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score & Primary Standard Header Card */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Compliance Rating
                    </span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      result.compliance_score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.compliance_score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {result.compliance_score}%
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Cert: {result.certificate_id}
                  </span>
                </div>

                {result.primary_standard ? (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="is-code-chip text-xs font-bold">
                        {result.primary_standard.standard.is_number}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                        MATCH: {Math.round(result.primary_standard.relevance_score * 100)}%
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {result.primary_standard.standard.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {result.primary_standard.reason}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    ⚠️ No unambiguous primary standard matched. Specification requires clarification.
                  </div>
                )}
              </div>

              {/* Coverage Matrix Card */}
              <div className="gov-card">
                <div className="gov-card-header flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers size={14} className="text-[#003366]" />
                    <span>Requirement Coverage Matrix</span>
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {result.coverage.filter(c => c.status === 'FOUND').length} / {result.coverage.length} Met
                  </span>
                </div>

                <div className="p-0 overflow-x-auto">
                  <table className="gov-table">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold text-center">Status</th>
                        <th className="p-3 font-semibold">Observation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.coverage.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 text-xs">
                            {item.category}
                          </td>
                          <td className="p-3 text-center">
                            {item.status === 'FOUND' && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 size={12} />
                                FOUND
                              </span>
                            )}
                            {(item.status === 'PARTIAL' || item.status === 'REVIEW') && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <AlertTriangle size={12} />
                                {item.status}
                              </span>
                            )}
                            {item.status === 'MISSING' && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                <XCircle size={12} />
                                MISSING
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 text-xs leading-relaxed">
                            {item.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Missing Requirements & One-Click Insertions */}
              {result.gaps.length > 0 && (
                <div className="gov-card">
                  <div className="gov-card-header bg-rose-50/60 border-rose-200">
                    <span className="font-bold text-xs text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-600" />
                      <span>Missing Requirements & Instant Remediation ({result.gaps.length})</span>
                    </span>
                    <span className="text-xs text-rose-800 font-semibold">
                      Click (+) to append clause into draft
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {result.gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            [{gap.category}] {gap.description}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                            gap.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {gap.severity}
                          </span>
                        </div>

                        {gap.suggestion && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 flex items-start justify-between gap-3">
                            <p className="leading-relaxed">
                              {gap.suggestion}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleInsertClause(gap.suggestion!, idx)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold flex-shrink-0 transition-colors ${
                                insertedIdx === idx
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#003366] text-white hover:bg-[#002244]'
                              }`}
                              title="Append this clause to your draft specification"
                            >
                              {insertedIdx === idx ? (
                                <><Check size={13} /><span>Inserted!</span></>
                              ) : (
                                <><PlusCircle size={13} /><span>Insert</span></>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
