/**
 * SpecificationInput — Phase 11 ⭐ Drafting Assistant UI
 * The main input panel where users enter procurement specifications
 */
import { Loader2, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';

const DEMO_SCENARIOS = [
  {
    label: 'Demo 1 — Complete spec',
    text: 'Procure protective helmets for motorcycle riders conforming to IS 4151. The helmets shall bear the ISI Mark, comply with BIS certification requirements, and meet all testing requirements specified in the standard including shock absorption, penetration resistance, and retention system tests.',
  },
  {
    label: 'Demo 2 — Missing testing ⭐',
    text: 'Procure motorcycle helmets for riders. The helmets should comply with applicable Indian safety standards and carry BIS ISI certification.',
  },
  {
    label: 'Demo 3 — Ambiguous spec',
    text: 'Supply protective helmets suitable for hazardous environments with appropriate safety ratings.',
  },
];

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
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,133,255,0.2), rgba(74,108,247,0.15))', border: '1px solid rgba(99,133,255,0.3)' }}>
          <Zap size={16} style={{ color: '#6385ff' }} />
        </div>
        <div>
          <p className="section-title">Input</p>
          <h2 className="font-bold text-white text-base">Draft Specification</h2>
        </div>
      </div>

      {/* Quick demo buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSpec(s.text)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(99,133,255,0.08)',
              border: '1px solid rgba(99,133,255,0.2)',
              color: '#a5b4fc',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
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
