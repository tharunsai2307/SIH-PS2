/**
 * RequirementChips — displays extracted requirements as pill chips
 */
import type { ExtractedRequirements } from '../api/isense';

interface Props {
  requirements: ExtractedRequirements;
}

export function RequirementChips({ requirements }: Props) {
  const pills = [
    requirements.product && { label: requirements.product, color: '#a5b4fc', bg: 'rgba(99,133,255,0.12)', border: 'rgba(99,133,255,0.3)' },
    requirements.application && { label: requirements.application, color: '#93c5fd', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    requirements.safety_required && { label: '🛡️ Safety', color: '#10d48e', bg: 'rgba(16,212,142,0.1)', border: 'rgba(16,212,142,0.3)' },
    requirements.testing_required && { label: '🔬 Testing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    requirements.certification_required && { label: '📋 Certification', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
  ].filter(Boolean) as { label: string; color: string; bg: string; border: string }[];

  if (pills.length === 0 && requirements.technical_keywords.length === 0) return null;

  return (
    <div className="glass p-4 fade-in fade-in-delay-1">
      <p className="section-title mb-3">Extracted Requirements</p>
      <div className="flex flex-wrap gap-2">
        {pills.map((p, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
          >
            {p.label}
          </span>
        ))}
        {requirements.specific_standards.map((s) => (
          <span key={s} className="is-chip text-xs">{s}</span>
        ))}
      </div>
      {requirements.ambiguities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="text-xs font-semibold mb-1.5" style={{ color: '#f59e0b' }}>⚠ Ambiguities Detected</p>
          {requirements.ambiguities.map((a, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>• {a}</p>
          ))}
        </div>
      )}
    </div>
  );
}
