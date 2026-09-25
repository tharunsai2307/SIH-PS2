/**
 * App.tsx — ISense Main Application Shell
 * Phase 11 ⭐ Drafting Assistant UI
 */
import { useCallback, useState } from 'react';
import { AlertCircle, BookOpen, GitBranch, Layers } from 'lucide-react';
import type { AnalyzeResponse } from './api/isense';
import { api } from './api/isense';
import { CoverageMatrix } from './components/CoverageMatrix';
import { ExplanationPanel } from './components/ExplanationPanel';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { RequirementChips } from './components/RequirementChips';
import { SpecificationInput } from './components/SpecificationInput';
import { StandardCard } from './components/StandardCard';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (spec: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.analyze(spec);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="bg-mesh min-h-screen">
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-10" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg leading-tight tracking-tight">Bureau of Indian Standards</span>
              <span className="text-xs text-gray-600">Government of India | Ministry of Consumer Affairs</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
              SIH MVP
            </span>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              Prototype · BIS Helmet Domain
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            ISense: AI-Powered Applicable Standards<br />
            <span className="text-blue-800">
              Recommendation Engine
            </span>
          </h1>
          <p className="text-base max-w-2xl mx-auto text-gray-600">
            Smart India Hackathon (SIH) Prototype. Enter a procurement specification below to identify applicable BIS standards, expand the normative relationship graph, and detect coverage gaps.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column — Input + Results */}
          <div className="space-y-4">
            <SpecificationInput onAnalyze={handleAnalyze} loading={loading} />

            {/* Error State */}
            {error && (
              <div className="glass p-4 flex items-start gap-3 fade-in"
                style={{ borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.06)' }}>
                <AlertCircle size={18} style={{ color: '#ff4d6d', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#ff4d6d' }}>Analysis Error</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    Make sure the backend is running: <code className="text-blue-400">docker-compose up</code>
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="glass p-4 flex items-center gap-3 fade-in"
                style={{ background: 'rgba(99,133,255,0.05)', borderColor: 'rgba(99,133,255,0.2)' }}>
                <div className="relative w-5 h-5 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(99,133,255,0.3)', borderTopColor: '#6385ff' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Analysing specification…</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Extracting → Retrieving → Graph → Coverage → AI Explanation
                  </p>
                </div>
              </div>
            )}

            {/* Extracted Requirements chips */}
            {result && <RequirementChips requirements={result.extracted_requirements} />}

            {/* Primary Standard */}
            {result?.primary_standard && (
              <div className="fade-in fade-in-delay-1">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="section-title">Primary Standard</p>
                </div>
                <StandardCard rec={result.primary_standard} isPrimary />
              </div>
            )}

            {/* Related Standards */}
            {result && result.related_standards.length > 0 && (
              <div className="fade-in fade-in-delay-2">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <p className="section-title">Related Standards ({result.related_standards.length})</p>
                </div>
                <div className="space-y-3">
                  {result.related_standards.map((rec) => (
                    <StandardCard key={rec.standard.id} rec={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Coverage + Explanation */}
          <div className="space-y-4">
            {loading && <LoadingSkeleton />}

            {!loading && !result && !error && (
              <div className="glass p-10 flex flex-col items-center justify-center text-center h-64">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(30,58,138,0.08)', border: '1px solid rgba(30,58,138,0.15)' }}>
                  <Layers size={24} style={{ color: 'rgba(30,58,138,0.6)' }} />
                </div>
                <p className="font-semibold text-gray-900 mb-2">Coverage Matrix</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Enter a specification on the left to see<br />the coverage analysis and gap detection
                </p>
              </div>
            )}

            {result && (
              <>
                <CoverageMatrix coverage={result.coverage} gaps={result.gaps} />
                <ExplanationPanel
                  explanation={result.explanation}
                  processingStatus={result.processing_status}
                  disclaimer={result.disclaimer}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-gray-50 border-t py-8" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-700">
              Designed and Developed for Smart India Hackathon (SIH)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Curated prototype knowledge base (Helmet Domain) · Not affiliated with actual BIS databases
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Powered by FastAPI + pgvector + Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
