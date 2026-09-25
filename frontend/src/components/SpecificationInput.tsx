/**
 * SpecificationInput — Phase 11 ⭐ Drafting Assistant UI
 * The main input panel where users enter procurement specifications
 */
import { Loader2, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';



interface Props {
  onAnalyze: (spec: string) => void;
  loading: boolean;
}

export function SpecificationInput({ onAnalyze, loading }: Props) {
  const [spec, setSpec] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spec.trim().length >= 10) onAnalyze(spec.trim());
  };

  return (
    <div className="glass p-6 fade-in">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center bg-blue-50 border border-blue-200">
            <Zap size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Input</p>
            <h2 className="font-bold text-gray-900 text-base">Draft Specification</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSpec("Procure motorcycle helmets for riders. The helmets should comply with applicable Indian safety standards and carry BIS ISI certification.")}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Load Template
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          id="specification-input"
          className="spec-textarea"
          rows={7}
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          placeholder={`Enter your procurement specification here...\n\nExample: "Procure protective helmets for motorcycle riders conforming to applicable Indian safety standards. The helmets shall bear ISI certification mark..."`}
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {spec.length} / 5000 characters
            </span>
            {spec.length > 0 && spec.length < 10 && (
              <span className="text-xs" style={{ color: 'var(--color-missing)' }}>
                Minimum 10 characters
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading || spec.trim().length < 10}
            id="analyze-btn"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyse Specification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
