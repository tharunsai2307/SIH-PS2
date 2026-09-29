import { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Download, 
  RotateCcw
} from 'lucide-react';
import type { EvaluationBenchmarkResponse } from '../api/isense';
import { api } from '../api/isense';

export function EvaluationDashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EvaluationBenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEvaluationBenchmark();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to run evaluation benchmark. Verify backend server is active on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Removed auto-run on mount — user must click "Run Benchmark" to avoid
  // hitting the backend on every page browse (fix #17)

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isense_evaluation_benchmark_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCases = data?.test_cases.filter((tc) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'NORMAL') return tc.category === 'Normal Query';
    if (categoryFilter === 'AMBIGUOUS') return tc.category === 'Ambiguous Query' || tc.category === 'Out-of-Scope Query' || tc.category === 'Unknown Standard Query';
    if (categoryFilter === 'MULTILINGUAL') return tc.category.startsWith('Multilingual');
    if (categoryFilter === 'PDF') return tc.category.includes('PDF');
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#003366] text-white text-xs font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                Standards Precision Benchmarks
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Reproducible Quality Metrics & Test Scenarios
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-normal leading-snug">
              Standards Evaluation & Precision Benchmarks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Automated reproducible test suite validating 14 real-world procurement scenarios across Precision@K, Recall@K, ambiguous refusal behavior, multilingual queries (Hindi/Tamil), and PDF documents.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBenchmark}
              disabled={loading}
              className="btn-gov-primary flex items-center gap-2 text-xs py-2 px-3.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  <span>Re-run Benchmark</span>
                </>
              )}
            </button>
            {data && (
              <button
                onClick={handleDownloadJson}
                className="btn-gov-secondary flex items-center gap-1.5 text-xs py-2 px-3"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Pass Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {data.summary.overall_pass_rate_pct}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({data.summary.passed_test_cases}/{data.summary.total_test_cases})
              </span>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Precision@1
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#003366]">
              {(data.summary.precision_at_1 * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Precision@3
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#003366]">
              {(data.summary.precision_at_3 * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Recall@1
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-900">
              {(data.summary.recall_at_1 * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Refusal / Clarity
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {(data.summary.refusal_accuracy * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Average Latency
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-800">
                {data.summary.average_latency_ms}
              </span>
              <span className="text-xs text-slate-500 font-medium">ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Test Cases Table */}
      <div className="gov-card">
        <div className="gov-card-header flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
            <BarChart3 size={16} className="text-[#003366]" />
            <span>Benchmark Execution Table (14 Scenarios)</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {[
              { id: 'ALL', label: 'All Cases' },
              { id: 'NORMAL', label: 'Normal' },
              { id: 'AMBIGUOUS', label: 'Ambiguous / Refusal' },
              { id: 'MULTILINGUAL', label: 'Multilingual' },
              { id: 'PDF', label: 'PDF' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === f.id
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-16">ID</th>
                <th className="w-40">Category</th>
                <th>Specification Query</th>
                <th className="w-32">Expected</th>
                <th className="w-32">Retrieved</th>
                <th className="w-24 text-center">Status</th>
                <th className="w-28 text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-500">
                    {data
                      ? `No test cases match the "${categoryFilter}" filter. Try "All Cases".`
                      : 'Click "Run Benchmark" above to execute the evaluation test suite.'}
                  </td>
                </tr>
              ) : (
                filteredCases.map((tc) => (
                <tr key={tc.id}>
                  <td className="font-mono font-bold text-slate-700">
                    {tc.id}
                  </td>
                  <td className="font-medium text-slate-700">
                    <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                      {tc.category}
                    </span>
                  </td>
                  <td className="text-slate-900">
                    <p className="font-medium leading-relaxed">{tc.query}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">{tc.outcome_detail}</p>
                  </td>
                  <td className="font-mono text-slate-800 font-bold">
                    {tc.expected_is || (
                      <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-sans">
                        {tc.expected_action.replace(/_/g, ' ')}
                      </span>
                    )}
                  </td>
                  <td className="font-mono">
                    {tc.retrieved_top1 ? (
                      <span className="is-code-chip">{tc.retrieved_top1}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {tc.passed ? (
                      <span className="badge-verified">
                        <CheckCircle2 size={13} />
                        PASS
                      </span>
                    ) : (
                      <span className="badge-critical">
                        <XCircle size={13} />
                        FAIL
                      </span>
                    )}
                  </td>
                  <td className="text-right font-mono text-slate-600 font-medium">
                    {tc.latency_ms} ms
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
