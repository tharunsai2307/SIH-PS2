import { useCallback, useState } from 'react';
import { 
  AlertCircle, 
  FileCheck2, 
  Scale, 
  ShieldCheck 
} from 'lucide-react';
import type { AnalyzeRequest, AnalyzeResponse } from './api/isense';
import { api } from './api/isense';
import { EvaluationReport } from './components/EvaluationReport';
import { Footer } from './components/Footer';
import { GeMClauseBuilder } from './components/GeMClauseBuilder';
import { GuidelinesView } from './components/GuidelinesView';
import type { NavTab } from './components/Header';
import { Header } from './components/Header';
import { NormativeGraphView } from './components/NormativeGraphView';
import { QCOOrdersView } from './components/QCOOrdersView';
import { SpecificationInput } from './components/SpecificationInput';
import { StandardsRepository } from './components/StandardsRepository';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('evaluator');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (payload: AnalyzeRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.analyze(payload);
      setResult(data);
      setTimeout(() => {
        document.getElementById('evaluation-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Evaluation could not be completed. Please ensure the backend server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* ── Official Government Header ── */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* EVALUATOR TAB (Core Engine) */}
        {activeTab === 'evaluator' && (
          <div className="space-y-8">
            {/* Government Hero Banner */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-56 bg-gradient-to-l from-blue-50/60 to-transparent pointer-events-none" />
              
              <div className="max-w-3xl relative z-10">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="bg-[#003366] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                    SIH Problem Statement 2 Flagship
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    GeM & CPPP Procurement Standards Verification
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
                  National Standards Advisory & Tender Compliance Portal
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  राष्ट्रीय मानक परामर्श एवं तकनीकी निविदा अनुपालन प्रणाली (Bureau of Indian Standards)
                </p>

                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  Enter draft procurement specifications to determine the applicable Indian Standard (IS), audit mandatory Quality Control Orders (QCO), inspect normative companion standards, and detect critical gaps before publishing tenders on GeM.
                </p>

                {/* Micro Stat Badges */}
                <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span>11 Active BIS Standards</span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <FileCheck2 size={16} className="text-[#003366]" />
                    <span>Normative Knowledge Engine</span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Scale size={16} className="text-amber-700" />
                    <span>Statutory QCO Enforcement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tender Specification Input Card */}
            <SpecificationInput onAnalyze={handleAnalyze} loading={loading} />

            {/* Backend Connection Error */}
            {error && (
              <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3.5 text-xs text-rose-900 shadow-2xs">
                <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-950">
                    Evaluation Request Failed
                  </h4>
                  <p className="leading-relaxed">{error}</p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Backend endpoint: http://localhost:8000/api/v1/analyze
                  </p>
                </div>
              </div>
            )}

            {/* Evaluation Results Section */}
            {result && (
              <div id="evaluation-results-section" className="pt-2">
                <EvaluationReport result={result} />
              </div>
            )}
          </div>
        )}

        {/* STANDARDS CATALOGUE TAB */}
        {activeTab === 'catalogue' && <StandardsRepository />}

        {/* NORMATIVE RELATIONSHIPS GRAPH TAB */}
        {activeTab === 'graph' && <NormativeGraphView />}

        {/* GeM TENDER CLAUSE DRAFTER TAB */}
        {activeTab === 'gem-clauses' && <GeMClauseBuilder />}

        {/* QCO GAZETTE ORDERS TAB */}
        {activeTab === 'qco-orders' && <QCOOrdersView />}

        {/* GUIDELINES & CVC COMPLIANCE TAB */}
        {activeTab === 'guidelines' && <GuidelinesView />}
      </main>

      {/* ── Official Government Footer ── */}
      <Footer />
    </div>
  );
}
