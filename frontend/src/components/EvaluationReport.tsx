import { useState } from 'react';
import { 
  AlertCircle,
  AlertOctagon, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  Clipboard, 
  FileText, 
  GitBranch, 
  HelpCircle,
  Info,
  Printer, 
  Scale, 
  ShieldAlert, 
  ShieldCheck,
  XCircle 
} from 'lucide-react';
import type { AnalyzeResponse } from '../api/isense';

interface Props {
  result: AnalyzeResponse;
}

export function EvaluationReport({ result }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'standards' | 'coverage' | 'relationships' | 'gem-clause' | 'statutory'>('standards');
  const [copied, setCopied] = useState(false);

  const {
    certificate_id,
    evaluation_timestamp,
    tender_id,
    department,
    compliance_score,
    primary_standard,
    related_standards,
    coverage,
    gaps,
    clauses_analysis,
    gem_clause_template,
    matched_qco,
    explanation,
    extracted_requirements,
    unknown_standards_detected,
    specification_needs_clarification,
    clarification_prompt,
  } = result;

  const handleCopyClause = () => {
    if (gem_clause_template) {
      navigator.clipboard.writeText(gem_clause_template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const highGaps = gaps.filter((g) => g.severity === 'HIGH');

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-800 bg-rose-50 border-rose-300';
  };

  return (
    <div className="gov-card">
      {/* ── Decision-Support Certificate Header ── */}
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#003366] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                BIS Standards Analysis Assessment
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Ref: {certificate_id}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                SIH PS-2 Prototype
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003366] tracking-tight">
              Tender Specification Analysis & Standards Decision-Support Report
            </h2>
            <p className="text-xs text-slate-600">
              Technical decision-support advisory for GeM & public procurement specification verification
            </p>
          </div>

          {/* Action Buttons: Print & Copy */}
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="btn-gov-secondary"
              title="Print Decision-Support Report"
            >
              <Printer size={15} />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleCopyClause}
              className="btn-gov-primary"
            >
              <Clipboard size={15} />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy GeM Clause'}</span>
            </button>
          </div>
        </div>

        {/* ── Mandatory Decision-Support Notice ── */}
        <div className="mt-5 p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center gap-2.5 text-xs text-blue-950 font-medium">
          <Info size={18} className="text-[#003366] flex-shrink-0" />
          <span>
            <strong>Decision-support output:</strong> Final procurement qualification and compliance decisions remain with the authorized procurement officer.
          </span>
        </div>

        {/* ── Ambiguity / Clarification Alert (Section 10) ── */}
        {specification_needs_clarification && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-900">
                Specification Requires Clarification
              </h4>
              <p className="leading-relaxed">
                {clarification_prompt || 
                  'The supplied specification is preliminary or ambiguous. Product domain, mandatory testing schedules, and certification requirements must be defined before final tendering.'
                }
              </p>
              <p className="text-xs text-amber-800 font-semibold mt-1">
                Candidate standards below are marked as preliminary candidates subject to clarification.
              </p>
            </div>
          </div>
        )}

        {/* ── Unknown Cited Standard Warning (Section 11) ── */}
        {unknown_standards_detected && unknown_standards_detected.length > 0 && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-xs text-rose-950">
            <AlertCircle size={18} className="text-rose-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-rose-900">
                Explicit Standard Citation Unverified in Demonstration Knowledge Base
              </h4>
              <p className="leading-relaxed">
                The draft specification cites <strong>{unknown_standards_detected.join(', ')}</strong>. This standard does not exist in the 11 curated demonstration standards. The system has preserved this citation without fabricating requirements.
              </p>
              <p className="text-xs text-rose-800 font-semibold">
                Please verify active status and applicability with the official BIS standards registry at bis.gov.in.
              </p>
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-200 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-0.5">Tender / Bid ID</span>
            <span className="font-mono font-bold text-slate-900 truncate block">{tender_id}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-0.5">Procuring Authority</span>
            <span className="font-semibold text-slate-900 truncate block">{department}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-0.5">Evaluation Timestamp</span>
            <span className="font-medium text-slate-800 block truncate">{evaluation_timestamp}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-0.5">Knowledge Base</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck size={14} />
              11 Curated Standards
            </span>
          </div>
        </div>
      </div>

      {/* ── Grounded Requirement Extraction Overview (Section 4) ── */}
      <div className="p-6 sm:p-8 bg-slate-50/40 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={15} className="text-[#003366]" />
            <span>Extracted Specification Requirements & Provenance</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Strict separation: Explicit vs Inferred vs Ambiguities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Box 1: Explicitly Stated Requirements */}
          <div className="p-4 bg-white border border-emerald-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Explicit Requirements</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                EXPLICIT
              </span>
            </div>
            {extracted_requirements.explicit_requirements && extracted_requirements.explicit_requirements.length > 0 ? (
              <ul className="space-y-1.5 text-slate-700">
                {extracted_requirements.explicit_requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No explicit parameters detected in specification text.</p>
            )}
          </div>

          {/* Box 2: Inferred Requirements */}
          <div className="p-4 bg-white border border-blue-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950">AI / Domain Inferences</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                INFERRED
              </span>
            </div>
            {extracted_requirements.inferred_requirements && extracted_requirements.inferred_requirements.length > 0 ? (
              <ul className="space-y-1.5 text-slate-700">
                {extracted_requirements.inferred_requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Info size={13} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No additional domain inferences required.</p>
            )}
          </div>

          {/* Box 3: Ambiguities & Missing Parameters */}
          <div className="p-4 bg-white border border-amber-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950">Missing / Ambiguous</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                REVIEW
              </span>
            </div>
            {extracted_requirements.ambiguities && extracted_requirements.ambiguities.length > 0 ? (
              <ul className="space-y-1.5 text-slate-700">
                {extracted_requirements.ambiguities.map((amb, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{amb}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Specification appears complete across major parameters.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Executive Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-white border-b border-slate-200">
        {/* Metric 1: Primary Standard */}
        <div className="kpi-box">
          <div className="kpi-lbl">Primary Standard</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="is-code-chip text-sm font-bold">
              {primary_standard ? primary_standard.standard.is_number : 'NOT IDENTIFIED'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {primary_standard?.standard.year}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2.5 truncate font-medium">
            {primary_standard ? primary_standard.standard.title : 'Specification requires domain clarification'}
          </p>
        </div>

        {/* Metric 2: Compliance Rating */}
        <div className="kpi-box">
          <div className="kpi-lbl">Specification Compliance Rating</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="kpi-val">{compliance_score}%</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getScoreBadge(compliance_score)}`}>
              {compliance_score >= 80 ? 'HIGH' : compliance_score >= 50 ? 'MODERATE' : 'INADEQUATE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 font-medium">
            Similarity score index; not a statutory compliance probability
          </p>
        </div>

        {/* Metric 3: Mandatory QCO Order Status */}
        <div className="kpi-box">
          <div className="kpi-lbl">Quality Control Order</div>
          <div className="mt-2">
            {matched_qco ? (
              <span className="badge-qco">
                <Scale size={13} />
                COMPULSORY (QCO)
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Voluntary / Standard
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2.5 truncate font-medium">
            {matched_qco ? matched_qco.order_title : 'General BIS standards reference'}
          </p>
        </div>

        {/* Metric 4: Normative Companion Standards */}
        <div className="kpi-box">
          <div className="kpi-lbl">Companion Standards</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="kpi-val">{related_standards.length}</span>
            <span className="text-xs text-slate-500 font-medium">Linked IS codes</span>
          </div>
          <p className="text-xs text-slate-600 mt-2.5 truncate font-medium">
            Testing headforms, visors & materials
          </p>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="border-b border-slate-200 bg-slate-50/60 px-6 sm:px-8 no-print">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('standards')}
            className={`py-3.5 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'standards'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={15} />
            <span>Recommended Standards & Evidence</span>
          </button>

          <button
            onClick={() => setActiveSubTab('coverage')}
            className={`py-3.5 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'coverage'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert size={15} />
            <span>
              Coverage Matrix & Gaps
              {highGaps.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                  {highGaps.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('relationships')}
            className={`py-3.5 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'relationships'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch size={15} />
            <span>Normative Standards Network ({related_standards.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gem-clause')}
            className={`py-3.5 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'gem-clause'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={15} />
            <span>GeM Tender Clause Assistant</span>
          </button>

          <button
            onClick={() => setActiveSubTab('statutory')}
            className={`py-3.5 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeSubTab === 'statutory'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale size={15} />
            <span>QCO Legal Reference & Commentary</span>
          </button>
        </div>
      </div>

      {/* ── Sub-Tab Contents ── */}
      <div className="p-6 sm:p-8">
        {/* SUB-TAB 1: Recommended Standards & Evidence */}
        {activeSubTab === 'standards' && (
          <div className="space-y-8">
            {/* Primary Standard Card */}
            {primary_standard ? (
              <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="is-code-chip text-base font-bold">
                      {primary_standard.standard.is_number}:{primary_standard.standard.year}
                    </span>
                    <span className="badge-verified">ACTIVE DEMONSTRATION STANDARD</span>
                    {primary_standard.standard.certification_scheme?.mandatory && (
                      <span className="badge-critical">MANDATORY ISI MARK</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Relevance:</span>
                    <span className="font-bold text-[#003366] bg-blue-100 px-2 py-0.5 rounded">
                      {primary_standard.relevance_label} ({primary_standard.relevance_score})
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {primary_standard.standard.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Category: <strong>{primary_standard.standard.product_type}</strong>
                  </p>
                </div>

                {/* Evidence-Grounded Reason */}
                <div className="p-3.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800 space-y-1">
                  <strong className="text-[#003366] block font-bold">Why Recommended:</strong>
                  <p className="leading-relaxed">{primary_standard.reason}</p>
                </div>

                {/* Contributing Signals */}
                {primary_standard.signals_contributed && primary_standard.signals_contributed.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Contributing Signals:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {primary_standard.signals_contributed.map((sig, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scope */}
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Scope:</strong> {primary_standard.standard.scope}
                </p>

                {/* Traceable Evidence */}
                {primary_standard.evidence && primary_standard.evidence.length > 0 && (
                  <div className="pt-3 border-t border-blue-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Traceable Supporting Evidence:
                    </span>
                    <div className="space-y-1.5">
                      {primary_standard.evidence.map((ev, idx) => (
                        <div key={idx} className="p-2.5 bg-white/80 border border-slate-200 rounded-md text-xs flex items-start justify-between gap-3">
                          <span className="text-slate-800 font-medium">{ev.claim}</span>
                          <span className="text-slate-500 font-mono text-[10.5px] whitespace-nowrap">
                            Source: {ev.source || 'Curated BIS Record'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                <AlertTriangle size={24} className="text-amber-700 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">No Primary Standard Identified</h4>
                <p className="text-xs text-slate-600 max-w-lg mx-auto">
                  The specification does not clearly specify equipment type or application matching the 11 demonstration standards. Review ambiguities in the panel above.
                </p>
              </div>
            )}

            {/* Clause Audit Table */}
            {clauses_analysis && clauses_analysis.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Clause-by-Clause Specification Audit
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {clauses_analysis.filter(c => c.status === 'COMPLIANT').length} of {clauses_analysis.length} Clauses Referenced in Specification
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th className="w-24">Clause</th>
                        <th className="w-48">Parameter</th>
                        <th>Mandated Standard Requirement</th>
                        <th className="w-36 text-center">Tender Status</th>
                        <th className="w-28 text-center">Audit Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clauses_analysis.map((cl, idx) => (
                        <tr key={idx}>
                          <td className="font-mono font-bold text-[#003366] text-xs">
                            {cl.clause}
                          </td>
                          <td className="font-semibold text-slate-900 text-xs">
                            {cl.title}
                          </td>
                          <td className="text-xs text-slate-700 leading-relaxed">
                            {cl.requirement}
                          </td>
                          <td className="text-center">
                            {cl.status === 'COMPLIANT' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 size={12} />
                                Specified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <AlertTriangle size={12} />
                                Omitted
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {cl.risk === 'NONE' ? (
                              <span className="text-xs text-emerald-700 font-medium">Low</span>
                            ) : cl.risk === 'HIGH' ? (
                              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                High Risk
                              </span>
                            ) : (
                              <span className="text-xs text-amber-700 font-medium">Moderate</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Prescribed Laboratory Test Methods */}
            {primary_standard?.standard.testing_requirements && (
              <div className="border border-slate-200 rounded-xl p-5 sm:p-6 bg-slate-50/50 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Prescribed Laboratory Test Methods & Acceptance Schedules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Object.entries(primary_standard.standard.testing_requirements).map(([k, v]) => (
                    <div key={k} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      <div className="text-[11px] font-bold text-[#003366] uppercase tracking-wide">
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                        {v as string}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: Coverage Matrix & Gap Action Plan */}
        {activeSubTab === 'coverage' && (
          <div className="space-y-8">
            {/* Coverage Matrix Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Procurement Parameter Coverage Matrix
                </h4>
                <span className="text-xs text-slate-500">
                  Statuses: FOUND · PARTIAL · MISSING · REVIEW
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th className="w-56">Category / Requirement</th>
                      <th className="w-32 text-center">Status</th>
                      <th className="w-36">Supporting Standard</th>
                      <th>Finding & Supporting Evidence</th>
                      <th className="w-64">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((c, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-slate-900 text-xs">
                          {c.category}
                        </td>
                        <td className="text-center">
                          {c.status === 'FOUND' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} />
                              FOUND
                            </span>
                          )}
                          {c.status === 'PARTIAL' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <AlertTriangle size={12} />
                              PARTIAL
                            </span>
                          )}
                          {c.status === 'MISSING' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <XCircle size={12} />
                              MISSING
                            </span>
                          )}
                          {c.status === 'REVIEW' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              <HelpCircle size={12} />
                              REVIEW
                            </span>
                          )}
                        </td>
                        <td>
                          {c.standard ? (
                            <span className="is-code-chip text-xs">{c.standard}</span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="text-xs text-slate-700 leading-relaxed">
                          <p>{c.note}</p>
                          {c.evidence && (
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Evidence: {c.evidence}
                            </p>
                          )}
                        </td>
                        <td className="text-xs text-slate-800 leading-relaxed">
                          {c.suggested_action || <span className="text-slate-400">None required</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gap Action Plan */}
            {gaps.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon size={16} className="text-rose-600" />
                  <span>Drafting Deficiencies & Recommended Actions for Procurement Officer</span>
                </h4>

                <div className="space-y-3.5">
                  {gaps.map((gap, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-xl border-l-4 shadow-2xs ${
                        gap.severity === 'HIGH'
                          ? 'bg-rose-50/40 border-l-rose-600 border border-slate-200'
                          : 'bg-amber-50/40 border-l-amber-600 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              gap.severity === 'HIGH'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {gap.severity} PRIORITY
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {gap.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Tender Quality Risk
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {gap.description}
                      </p>

                      {gap.suggestion && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white p-3 rounded-lg border border-slate-200">
                          <strong className="text-xs text-[#003366] block mb-1">
                            Recommended Tender Amendment:
                          </strong>
                          <p className="text-xs font-mono text-slate-800 leading-relaxed">
                            {gap.suggestion}
                          </p>
                        </div>
                      )}

                      {gap.supporting_evidence && (
                        <p className="text-[11px] text-slate-500 font-mono mt-2">
                          Regulatory / Standards Basis: {gap.supporting_evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: Normative Standards Network */}
        {activeSubTab === 'relationships' && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-700 leading-relaxed">
              <strong className="text-[#003366] block mb-1 text-sm font-bold">
                Normative Standards Knowledge Network
              </strong>
              Under BIS drafting guidelines, a primary standard cannot be implemented in isolation. 
              The following companion standards govern testing apparatus, headform geometries, visors, and material specifications required during inspection.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related_standards.map((rel, idx) => (
                <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-[#003366] transition-colors shadow-2xs">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="is-code-chip text-xs font-bold">
                        {rel.standard.is_number}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        {rel.standard.year}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rel.relevance_label === 'HIGH'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rel.relevance_label} RELEVANCE ({rel.relevance_score})
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                    {rel.standard.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {rel.reason}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Category: {rel.standard.product_type}</span>
                    <span className="font-semibold text-blue-800">
                      {rel.relationship_type ? rel.relationship_type.replace(/_/g, ' ').toUpperCase() : 'COMPANION'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: Ready-to-Use GeM Tender Clause */}
        {activeSubTab === 'gem-clause' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Special Terms & Conditions (STC) for GeM / CPPP Bidding Documents
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Vetted clause template ready for insertion into GeM Portal Bid Details
                </p>
              </div>

              <button
                onClick={handleCopyClause}
                className="btn-gov-primary no-print"
              >
                <Clipboard size={15} />
                <span>{copied ? 'Copied Successfully!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800 shadow-md">
                {gem_clause_template}
              </pre>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Notice to Tender Issuing Officers:</strong> Under Rule 144 of the General Financial Rules (GFR), 2017 and CVC Guidelines, specifications must mandate BIS standards wherever available to ensure fair competition and public safety.
            </div>
          </div>
        )}

        {/* SUB-TAB 5: Statutory Legal Reference & Commentary */}
        {activeSubTab === 'statutory' && (
          <div className="space-y-6">
            {/* Matched QCO Box */}
            {matched_qco && (
              <div className="p-5 border-2 border-amber-300 bg-amber-50/70 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <Scale size={20} className="text-amber-800" />
                  <h4 className="text-sm font-bold text-amber-950">
                    Statutory Gazette Order: {matched_qco.order_title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
                  <div className="p-2.5 bg-white/70 rounded-lg border border-amber-200">
                    <strong>Gazette Notification:</strong> {matched_qco.gazette_no}
                  </div>
                  <div className="p-2.5 bg-white/70 rounded-lg border border-amber-200">
                    <strong>Issued By:</strong> {matched_qco.ministry}
                  </div>
                  <div className="p-2.5 bg-white/70 rounded-lg border border-amber-200">
                    <strong>Enforcement:</strong> {matched_qco.enforcement_status}
                  </div>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  {matched_qco.summary}
                </p>

                <div className="pt-2 border-t border-amber-200 text-xs text-amber-950 font-medium">
                  <strong>Penalty for Non-Compliance:</strong> {matched_qco.penalties}
                </div>
              </div>
            )}

            {/* Explanation Commentary */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 text-xs leading-relaxed text-slate-800 shadow-2xs">
              <h4 className="font-bold text-sm text-[#003366]">
                Technical Finding Summary & Central Vigilance Commission (CVC) Advisory
              </h4>
              <div
                dangerouslySetInnerHTML={{
                  __html: explanation
                    .replace(/### (.*?)\n/g, '<h5 class="font-bold text-xs text-slate-900 uppercase mt-3 mb-1.5">$1</h5>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-slate-600">$1</em>')
                    .replace(/\n\n/g, '<p class="mt-2.5 text-slate-700"></p>')
                }}
              />
            </div>

            {/* Official Disclaimer */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-normal">
              <strong>Disclaimer:</strong> {result.disclaimer}
            </div>

            {/* Print Signatures Block */}
            <div className="mt-10 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-14 border-b border-slate-400 mb-2"></div>
                <p className="font-bold text-slate-900">Procurement Committee Officer</p>
                <p className="text-slate-500">{department}</p>
              </div>
              <div>
                <div className="h-14 border-b border-slate-400 mb-2"></div>
                <p className="font-bold text-slate-900">Technical Standards Analyst</p>
                <p className="text-slate-500">ISense Decision-Support Engine (SIH Prototype)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
