/**
 * ExplanationPanel — Phase 10 AI explanation display
 */
import { Bot } from 'lucide-react';

interface Props {
  explanation: string;
  processingStatus: string;
  disclaimer: string;
}

const STATUS_STYLES = {
  FOUND: { color: '#10d48e', label: 'Standards Found', icon: '✅' },
  MANUAL_REVIEW: { color: '#f59e0b', label: 'Manual Review Required', icon: '⚠️' },
  NOT_FOUND: { color: '#ff4d6d', label: 'No Standards Found', icon: '❌' },
} as const;

export function ExplanationPanel({ explanation, processingStatus, disclaimer }: Props) {
  const status = STATUS_STYLES[processingStatus as keyof typeof STATUS_STYLES] || STATUS_STYLES.MANUAL_REVIEW;

  return (
    <div className="glass p-6 fade-in fade-in-delay-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(16,212,142,0.15), rgba(16,212,142,0.08))', border: '1px solid rgba(16,212,142,0.25)' }}>
          <Bot size={16} style={{ color: '#10d48e' }} />
        </div>
        <div className="flex-1">
          <p className="section-title">ISense Analysis</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: status.color }}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* AI explanation */}
      <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}
        dangerouslySetInnerHTML={{
          __html: explanation.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f8">$1</strong>')
        }}
      />

      {/* Disclaimer */}
      <div className="mt-4 p-3 rounded-lg text-xs leading-relaxed"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#a0a8c0' }}>
        <strong style={{ color: '#f59e0b' }}>⚠ Disclaimer:</strong> {disclaimer}
      </div>
    </div>
  );
}
