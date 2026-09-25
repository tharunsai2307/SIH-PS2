/**
 * CoverageMatrix — Phase 8 ⭐ ISense's core innovation visualizer
 * Renders the coverage grid with status icons and gap counts
 */
import type { CoverageItem, GapItem } from '../api/isense';

const STATUS_CONFIG = {
  FOUND: { label: 'Found', icon: '✅', className: 'badge-found' },
  MISSING: { label: 'Missing', icon: '❌', className: 'badge-missing' },
  REVIEW: { label: 'Review', icon: '⚠️', className: 'badge-review' },
  INSUFFICIENT: { label: 'Insufficient', icon: '⚠️', className: 'badge-insufficient' },
} as const;

interface Props {
  coverage: CoverageItem[];
  gaps: GapItem[];
}

export function CoverageMatrix({ coverage, gaps }: Props) {
  const highGaps = gaps.filter((g) => g.severity === 'HIGH');
  const medGaps = gaps.filter((g) => g.severity === 'MEDIUM');

  return (
    <div className="glass p-6 fade-in fade-in-delay-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-title mb-1">Coverage Matrix</p>
          <h2 className="text-lg font-bold text-white">Specification Coverage</h2>
        </div>
        {gaps.length > 0 && (
          <div className="flex gap-2">
            {highGaps.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold badge-missing">
                {highGaps.length} Critical
              </span>
            )}
            {medGaps.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold badge-review">
                {medGaps.length} Advisory
              </span>
            )}
          </div>
        )}
      </div>

      {/* Coverage Grid */}
      <div className="space-y-2">
        {coverage.map((item, idx) => {
          const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.REVIEW;
          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className="text-xl mt-0.5 flex-shrink-0">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{item.category}</span>
                  {item.standard && (
                    <span className="is-chip">{item.standard}</span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.className}`}>
                    {config.label}
                  </span>
                </div>
                {item.note && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap Details */}
      {gaps.length > 0 && (
        <div className="mt-6">
          <hr className="divider mb-4" />
          <p className="section-title mb-3">Gap Analysis</p>
          <div className="space-y-3">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl"
                style={{
                  background: gap.severity === 'HIGH'
                    ? 'rgba(255, 77, 109, 0.06)'
                    : 'rgba(245, 158, 11, 0.06)',
                  border: `1px solid ${
                    gap.severity === 'HIGH'
                      ? 'rgba(255, 77, 109, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)'
                  }`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold uppercase tracking-wide severity-${gap.severity.toLowerCase()}`}>
                    {gap.severity}
                  </span>
                  <span className="font-semibold text-white text-sm">{gap.category}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {gap.description}
                </p>
                {gap.suggestion && (
                  <div className="mt-2 flex items-start gap-2">
                    <span className="text-blue-400 text-xs mt-0.5 flex-shrink-0">→</span>
                    <p className="text-xs text-blue-300">{gap.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
