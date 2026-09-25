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
      // Smooth scroll down to the evaluation report
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
    <div className="min-h-screen flex flex-col bg-[#f4f6fa]">
      {/* ── Official Government Header ── */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* EVALUATOR TAB (Core Engine) */}
        {activeTab === 'evaluator' && (
          <div className="space-y-6">
            {/* Government Hero Banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
              
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#003366] text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                    SIH Problem Statement 2 Flagship
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    GeM & CPPP Procurement Standards Verification
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[#003366] tracking-tight leading-snug">
                  राष्ट्रीय मानक परामर्श एवं निविदा अनुपालन पोर्टल
                  <span className="block text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
                    National Standards Advisory & Technical Tender Compliance Portal
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Enter draft procurement specifications below to determine the legally applicable Indian Standard (IS), audit mandatory Quality Control Orders (QCO), inspect normative companion standards, and detect critical gaps before publishing tenders on GeM.
                </p>

                {/* Micro Stat Badges */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <ShieldCheck size={14} className="text-green-700" />
                    <span>11 Active BIS Standards</span>
                  </div>
                  <div className="text-gray-300">|</div>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <FileCheck2 size={14} className="text-[#003366]" />
                    <span>Normative Graph Engine</span>
                  </div>
                  <div className="text-gray-300">|</div>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <Scale size={14} className="text-amber-700" />
                    <span>Statutory QCO Enforcement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tender Specification Input Card */}
            <SpecificationInput onAnalyze={handleAnalyze} loading={loading} />

            {/* Backend Connection Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-md flex items-start gap-3 text-xs text-red-900">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-950 mb-0.5">
                    Evaluation Request Failed
                  </h4>
                  <p>{error}</p>
                  <p className="mt-1 text-gray-600 font-mono text-[11px]">
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
