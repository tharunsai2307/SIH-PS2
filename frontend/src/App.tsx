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
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6385ff, #4a6cf7)' }}>
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">ISense</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,133,255,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,133,255,0.25)' }}>
                MVP
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              AI-Powered Indian Standards Engine
            </span>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,212,142,0.08)', border: '1px solid rgba(16,212,142,0.2)', color: '#10d48e' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              Prototype · BIS Helmet Domain
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(99,133,255,0.1)', border: '1px solid rgba(99,133,255,0.2)', color: '#a5b4fc' }}>
            <GitBranch size={12} />
            Graph-Powered Standards Intelligence · Coverage Gap Detection
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Find Applicable<br />
            <span style={{ background: 'linear-gradient(135deg, #6385ff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Indian Standards
            </span>
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Paste your procurement specification. ISense identifies applicable BIS standards,
            expands the relationship graph, and highlights exactly what's missing.
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
                  <p className="text-sm font-semibold text-white">Analysing specification…</p>
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
                  style={{ background: 'rgba(99,133,255,0.08)', border: '1px solid rgba(99,133,255,0.15)' }}>
                  <Layers size={24} style={{ color: 'rgba(99,133,255,0.4)' }} />
                </div>
                <p className="font-semibold text-white mb-2">Coverage Matrix</p>
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

      {/* Footer */}
      <footer className="mt-12 border-t py-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <strong className="text-white">ISense MVP</strong> · Curated prototype knowledge base · Not affiliated with BIS
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            FastAPI + pgvector + Gemini AI · Helmet Domain
          </p>
        </div>
      </footer>
    </div>
  );
}
