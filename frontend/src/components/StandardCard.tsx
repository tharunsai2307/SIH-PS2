/**
 * StandardCard — displays a recommended or related IS standard
 */
import { ChevronDown, ChevronUp, ExternalLink, Shield } from 'lucide-react';
import { useState } from 'react';
import type { RecommendedStandard } from '../api/isense';

interface Props {
  rec: RecommendedStandard;
  isPrimary?: boolean;
}

const RELEVANCE_COLORS = {
  HIGH: '#10d48e',
  MEDIUM: '#f59e0b',
  LOW: '#7b8cb8',
} as const;

const REL_TYPE_LABELS: Record<string, string> = {
  primary: 'Primary Standard',
  normative_reference: 'Normative Reference',
  test_method: 'Test Method',
  safety: 'Safety Standard',
  installation: 'Installation',
  terminology: 'Terminology',
  related_product: 'Related Product',
  certified_under: 'Certified Under',
  supersedes: 'Supersedes',
};

export function StandardCard({ rec, isPrimary = false }: Props) {
  const [expanded, setExpanded] = useState(isPrimary);
  const { standard, relevance_label, relevance_score, reason, relationship_type, evidence } = rec;
  const relColor = RELEVANCE_COLORS[relevance_label as keyof typeof RELEVANCE_COLORS] || '#7b8cb8';
  const relTypeLabel = REL_TYPE_LABELS[relationship_type || 'primary'] || relationship_type;

  return (
    <div
      className="glass p-5 transition-all duration-300"
      style={isPrimary ? { boxShadow: '0 0 0 1px rgba(99, 133, 255, 0.45), 0 0 20px rgba(99,133,255,0.1)' } : {}}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(99, 133, 255, 0.12)', border: '1px solid rgba(99, 133, 255, 0.25)' }}
        >
          <Shield size={18} style={{ color: '#6385ff' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="is-chip">{standard.is_number}</span>
            {isPrimary && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,133,255,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,133,255,0.3)' }}>
                Primary
              </span>
            )}
            {relTypeLabel && !isPrimary && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                {relTypeLabel}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{standard.title}</h3>
          {standard.year && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Year: {standard.year} · {standard.product_type}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {/* Relevance score */}
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round(relevance_score * 100)}%`, background: relColor }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: relColor }}>
              {relevance_label}
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {reason}
      </p>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
          {/* Scope */}
          {standard.scope && (
            <div>
              <p className="section-title mb-1.5">Scope</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {standard.scope}
              </p>
            </div>
          )}

          {/* Requirements */}
          {standard.requirements && Object.keys(standard.requirements).length > 0 && (
            <div>
              <p className="section-title mb-2">Key Requirements</p>
              <div className="space-y-1.5">
                {Object.entries(standard.requirements).slice(0, 5).map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="font-medium capitalize flex-shrink-0" style={{ color: '#a5b4fc', minWidth: 120 }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certification */}
          {standard.certification_scheme && (
            <div>
              <p className="section-title mb-2">Certification</p>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                {standard.certification_scheme.scheme != null && (
                  <p>Scheme: <span className="text-white">{`${standard.certification_scheme.scheme}`}</span></p>
                )}
                {standard.certification_scheme.mandatory !== undefined && (
                  <p>Mandatory: <span className={Boolean(standard.certification_scheme.mandatory) ? 'conf-verified' : 'conf-review'}>
                    {Boolean(standard.certification_scheme.mandatory) ? 'Yes' : 'No'}
                  </span></p>
                )}
              </div>
            </div>
          )}

          {/* Evidence */}
          {evidence.length > 0 && (
            <div>
              <p className="section-title mb-2">Evidence</p>
              {evidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={ev.confidence === 'VERIFIED' ? 'conf-verified' : 'conf-review'}>
                    {ev.confidence}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{ev.claim}</span>
                </div>
              ))}
              {standard.source_reference && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#6385ff' }}>
                  <ExternalLink size={10} />
                  {standard.source_reference}
                </p>
              )}
            </div>
          )}

          {/* Amendments */}
          {standard.amendments && standard.amendments.length > 0 && (
            <div>
              <p className="section-title mb-1.5">Amendments</p>
              <div className="space-y-1">
                {standard.amendments.map((amd, i) => (
                  <p key={i} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="text-white">{amd.number} ({amd.year})</span> — {amd.description}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
