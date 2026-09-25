import { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  Clipboard, 
  FileText, 
  GitBranch, 
  Printer, 
  Scale, 
  ShieldAlert, 
  XCircle 
} from 'lucide-react';
import type { AnalyzeResponse } from '../api/isense';

interface Props {
  result: AnalyzeResponse;
}

export function EvaluationReport({ result }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'clauses' | 'gaps' | 'relationships' | 'gem-clause' | 'statutory'>('clauses');
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-300';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-red-700 bg-red-50 border-red-300';
  };

  return (
    <div className="gov-card">
      {/* ── Official Government Certificate Header ── */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#003366] text-white text-[10.5px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                Official BIS Assessment
              </span>
              <span className="text-xs font-mono font-bold text-gray-700">
                Ref: {certificate_id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#003366] tracking-tight">
              Tender Technical Compliance & Applicable Standards Certificate
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Issued under the authority of National Standards Bureau pilot for GeM e-Procurement
            </p>
          </div>

          {/* Action Buttons: Print & Copy */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="btn-gov-secondary text-xs"
              title="Print Official Certificate"
            >
              <Printer size={14} />
              <span>Print Official Report</span>
            </button>
            <button
              onClick={handleCopyClause}
              className="btn-gov-primary text-xs"
            >
              <Clipboard size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy GeM Clause'}</span>
            </button>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px] uppercase font-bold">Tender / Bid ID</span>
            <span className="font-mono font-semibold text-gray-900">{tender_id}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px] uppercase font-bold">Procuring Authority</span>
            <span className="font-medium text-gray-900 truncate block">{department}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px] uppercase font-bold">Evaluation Date</span>
            <span className="font-medium text-gray-900">{evaluation_timestamp}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px] uppercase font-bold">Verification Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-green-700">
              <CheckCircle2 size={13} />
              BIS Engine Validated
            </span>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-6 bg-white border-b border-gray-200">
        {/* Metric 1: Primary Standard */}
        <div className="kpi-box">
          <div className="kpi-lbl">Primary Standard</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="is-code-chip text-sm">
              {primary_standard ? primary_standard.standard.is_number : 'NOT DETECTED'}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {primary_standard?.standard.year}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2 truncate font-medium">
            {primary_standard?.standard.title}
          </p>
        </div>

        {/* Metric 2: Compliance Score */}
        <div className="kpi-box kpi-accent">
          <div className="kpi-lbl">Compliance Rating</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="kpi-val">{compliance_score}%</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(compliance_score)}`}>
              {compliance_score >= 80 ? 'HIGH' : compliance_score >= 50 ? 'MODERATE' : 'INADEQUATE'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium">
            {highGaps.length === 0 ? 'Meets core tender criteria' : `${highGaps.length} critical gaps identified`}
          </p>
        </div>

        {/* Metric 3: Mandatory QCO Order Status */}
        <div className="kpi-box">
          <div className="kpi-lbl">Quality Control Order</div>
          <div className="mt-1">
            {matched_qco ? (
              <span className="badge-qco">
                <Scale size={12} />
                COMPULSORY (QCO {matched_qco.date.split(' ').pop()})
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-600">Voluntary / Standard</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2 truncate font-medium">
            {matched_qco ? matched_qco.order_title : 'General BIS compliance standard'}
          </p>
        </div>

        {/* Metric 4: Normative Companion Standards */}
        <div className="kpi-box kpi-green">
          <div className="kpi-lbl">Companion Standards</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="kpi-val">{related_standards.length}</span>
            <span className="text-xs text-gray-500 font-medium">Linked IS codes</span>
          </div>
          <p className="text-xs text-gray-600 mt-2 truncate font-medium">
            Testing headforms & materials
          </p>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 sm:px-6 no-print">
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('clauses')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'clauses'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Standard Specification & Clauses</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gaps')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'gaps'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert size={14} />
            <span>
              Coverage & Gap Action Plan
              {highGaps.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                  {highGaps.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('relationships')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'relationships'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitBranch size={14} />
            <span>Normative Companion Tree ({related_standards.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gem-clause')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'gem-clause'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText size={14} />
            <span>Ready-to-Use GeM Tender Clause</span>
          </button>

          <button
            onClick={() => setActiveSubTab('statutory')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeSubTab === 'statutory'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale size={14} />
            <span>Statutory & CVC Legal Commentary</span>
          </button>
        </div>
      </div>

      {/* ── Sub-Tab Contents ── */}
      <div className="p-4 sm:p-6">
        {/* SUB-TAB 1: Clauses & Standard Details */}
        {activeSubTab === 'clauses' && (
          <div className="space-y-6">
            {primary_standard && (
              <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="is-code-chip text-base font-bold">
                      {primary_standard.standard.is_number}:{primary_standard.standard.year}
                    </span>
                    <span className="badge-verified">ACTIVE STANDARD</span>
                    {primary_standard.standard.certification_scheme?.mandatory && (
                      <span className="badge-critical">MANDATORY ISI MARK</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    Registry Ref: {primary_standard.standard.source_reference}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {primary_standard.standard.title}
                </h3>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                  <strong>Scope:</strong> {primary_standard.standard.scope}
                </p>

                {primary_standard.standard.certification_scheme && (
                  <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <strong className="text-gray-700">Certification Scheme:</strong>{' '}
                      <span className="text-gray-900 font-medium">
                        {primary_standard.standard.certification_scheme.scheme}
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Legal Enforcement:</strong>{' '}
                      <span className="text-gray-900 font-medium">
                        {primary_standard.standard.certification_scheme.legal_basis}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clause Audit Table */}
            {clauses_analysis && clauses_analysis.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Clause-by-Clause Specification Audit</span>
                  <span className="text-gray-500 font-normal">
                    {clauses_analysis.filter(c => c.status === 'COMPLIANT').length} of {clauses_analysis.length} Clauses Referenced in Tender
                  </span>
                </h4>

                <div className="overflow-x-auto border border-gray-200 rounded-md">
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
                          <td className="font-semibold text-gray-900 text-xs">
                            {cl.title}
                          </td>
                          <td className="text-xs text-gray-700">
                            {cl.requirement}
                          </td>
                          <td className="text-center">
                            {cl.status === 'COMPLIANT' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                <CheckCircle2 size={11} />
                                Specified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <AlertTriangle size={11} />
                                Omitted
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {cl.risk === 'NONE' ? (
                              <span className="text-xs text-green-700 font-medium">Low</span>
                            ) : cl.risk === 'HIGH' ? (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
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

            {/* Testing Requirements Card */}
            {primary_standard?.standard.testing_requirements && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                  Prescribed Laboratory Test Methods & Acceptance Criteria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(primary_standard.standard.testing_requirements).map(([k, v]) => (
                    <div key={k} className="p-3 bg-white border border-gray-200 rounded">
                      <div className="text-[11px] font-bold text-[#003366] uppercase">
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
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
        {activeSubTab === 'gaps' && (
          <div className="space-y-6">
            {/* Coverage Matrix Table */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Procurement Parameter Coverage Matrix
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th className="w-56">Category / Requirement</th>
                      <th className="w-28 text-center">Status</th>
                      <th className="w-36">Designated Standard</th>
                      <th>Evaluation Findings & Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((c, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-gray-900 text-xs">
                          {c.category}
                        </td>
                        <td className="text-center">
                          {c.status === 'FOUND' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                              <CheckCircle2 size={11} />
                              Compliant
                            </span>
                          )}
                          {c.status === 'MISSING' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <XCircle size={11} />
                              Missing
                            </span>
                          )}
                          {c.status === 'REVIEW' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle size={11} />
                              Review
                            </span>
                          )}
                        </td>
                        <td>
                          {c.standard ? (
                            <span className="is-code-chip text-xs">{c.standard}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="text-xs text-gray-700">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gap Action Plan */}
            {gaps.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertOctagon size={15} className="text-red-600" />
                  <span>Deficiencies & Actionable Remediation for Procurement Officer</span>
                </h4>

                <div className="space-y-3">
                  {gaps.map((gap, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        gap.severity === 'HIGH'
                          ? 'bg-red-50/60 border-red-200'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              gap.severity === 'HIGH'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {gap.severity} PRIORITY
                          </span>
                          <span className="font-bold text-gray-900 text-xs">
                            {gap.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Risk of Tender Dispute
                        </span>
                      </div>

                      <p className="text-xs text-gray-800 font-medium">
                        {gap.description}
                      </p>

                      {gap.suggestion && (
                        <div className="mt-2.5 pt-2 border-t border-gray-300/60 bg-white/70 p-2.5 rounded border">
                          <strong className="text-xs text-blue-900 block mb-0.5">
                            Recommended Tender Amendment:
                          </strong>
                          <p className="text-xs font-mono text-gray-900">
                            {gap.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: Normative Relationships */}
        {activeSubTab === 'relationships' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md text-xs text-gray-700">
              <strong className="text-[#003366] block mb-1">
                Normative Relationship Knowledge Graph
              </strong>
              Under BIS drafting guidelines, a primary standard cannot be implemented in isolation. 
              The following auxiliary standards govern testing apparatus, headform geometries, and material specifications required during inspection.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {related_standards.map((rel, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-white hover:border-[#003366] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="is-code-chip text-xs font-bold">
                        {rel.standard.is_number}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {rel.standard.year}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rel.relevance_label === 'HIGH'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rel.relevance_label} RELEVANCE
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 mb-1">
                    {rel.standard.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {rel.reason}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Category: {rel.standard.product_type}</span>
                    <span className="font-semibold text-blue-800">Verified Citation</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: Ready-to-Use GeM Tender Clause */}
        {activeSubTab === 'gem-clause' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Special Terms & Conditions (STC) for GeM / CPPP Bidding Documents
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Legally vetted clause template ready for direct insertion into GeM Portal Bid Details
                </p>
              </div>

              <button
                onClick={handleCopyClause}
                className="btn-gov-primary text-xs no-print"
              >
                <Clipboard size={14} />
                <span>{copied ? 'Copied Successfully!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-gray-700">
                {gem_clause_template}
              </pre>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900">
              <strong>Notice to Tender Issuing Officers:</strong> Under Rule 144 of the General Financial Rules (GFR), 2017 and CVC Guidelines, specifications must mandate BIS standards wherever available to ensure fair competition and public safety.
            </div>
          </div>
        )}

        {/* SUB-TAB 5: Statutory AI Legal Commentary */}
        {activeSubTab === 'statutory' && (
          <div className="space-y-4">
            {/* Matched QCO Box */}
            {matched_qco && (
              <div className="p-4 border-2 border-amber-400 bg-amber-50/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Scale size={18} className="text-amber-800" />
                  <h4 className="text-sm font-bold text-amber-950">
                    Statutory Gazette Order: {matched_qco.order_title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-3 text-amber-900">
                  <div>
                    <strong>Gazette Notification:</strong> {matched_qco.gazette_no}
                  </div>
                  <div>
                    <strong>Issued By:</strong> {matched_qco.ministry}
                  </div>
                  <div>
                    <strong>Enforcement:</strong> {matched_qco.enforcement_status}
                  </div>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  {matched_qco.summary}
                </p>

                <div className="mt-3 pt-2 border-t border-amber-200 text-xs text-amber-950">
                  <strong>Penalty for Non-Compliance:</strong> {matched_qco.penalties}
                </div>
              </div>
            )}

            {/* Explanation Commentary */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3 text-xs leading-relaxed text-gray-800">
              <h4 className="font-bold text-sm text-[#003366]">
                Technical Finding Summary & Central Vigilance Commission (CVC) Advisory
              </h4>
              <div
                dangerouslySetInnerHTML={{
                  __html: explanation
                    .replace(/### (.*?)\n/g, '<h5 class="font-bold text-xs text-gray-900 uppercase mt-2 mb-1">$1</h5>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="text-gray-600">$1</em>')
                    .replace(/\n\n/g, '<p class="mt-2 text-gray-700"></p>')
                }}
              />
            </div>

            {/* Official Disclaimer */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 leading-normal">
              <strong>Official Disclaimer:</strong> {result.disclaimer}
            </div>

            {/* Print Signatures Block (Visible only on print or export) */}
            <div className="mt-8 pt-8 border-t border-gray-400 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="h-12 border-b border-gray-400 mb-2"></div>
                <p className="font-bold text-gray-900">Procurement Committee Officer</p>
                <p className="text-gray-500">{department}</p>
              </div>
              <div>
                <div className="h-12 border-b border-gray-400 mb-2"></div>
                <p className="font-bold text-gray-900">Technical Standards Officer</p>
                <p className="text-gray-500">Bureau of Indian Standards Advisory Cell</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
