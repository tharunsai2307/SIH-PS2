import { useEffect, useState } from 'react';
import { ArrowRight, Info, Network } from 'lucide-react';
import type { RelationshipItem } from '../api/isense';
import { api } from '../api/isense';

export function NormativeGraphView() {
  const [relationships, setRelationships] = useState<RelationshipItem[]>([]);
  const [selectedStandard, setSelectedStandard] = useState('IS 4151');
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getRelationships();
        setRelationships(data);
      } catch (err) {
        console.error('Failed to load relationships', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const standardsList = Array.from(
    new Set(relationships.flatMap((r) => [r.source, r.target]))
  );

  const activeRelationships = relationships.filter(
    (r) => r.source === selectedStandard || r.target === selectedStandard
  );

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'normative_reference':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'safety':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'test_method':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terminology':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="gov-card">
        <div className="gov-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Network size={16} className="text-[#003366]" />
              <span>Normative Relationship Knowledge Graph</span>
            </h2>
            <p className="text-xs text-gray-500">
              Interactive network demonstrating inter-standard references, testing protocols, and material specifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Select Focus Standard:</span>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="text-xs font-mono font-bold px-3 py-1.5 border border-gray-300 rounded bg-white text-[#003366] focus:outline-none"
            >
              {standardsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="gov-card-body space-y-6">
          {/* Explanation Banner */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs text-gray-700 flex items-start gap-2.5">
            <Info size={16} className="text-[#003366] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#003366]">What is a Normative Relationship in BIS Standards?</strong>
              <p className="mt-0.5">
                Indian Standards reference other standards for test apparatus (e.g. wooden headforms under IS 7692), raw materials (e.g. rubber cushions under IS 9944), or definitions (IS 7318). A procurement tender that cites only the primary standard without verifying normative dependencies risks non-compliance during laboratory audit.
              </p>
            </div>
          </div>

          {/* Visual Node Diagram */}
          <div className="p-6 bg-slate-50 border border-gray-200 rounded-lg text-center">
            <div className="inline-block p-4 bg-white border-2 border-[#003366] rounded-lg shadow-sm mb-6">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Selected Primary Standard</span>
              <span className="text-lg font-mono font-extrabold text-[#003366]">{selectedStandard}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
              {activeRelationships.map((rel, i) => {
                const isSource = rel.source === selectedStandard;
                const other = isSource ? rel.target : rel.source;
                return (
                  <div key={i} className="p-3.5 bg-white border border-gray-200 rounded-md hover:border-[#003366] transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-[#003366]">
                        <span>{selectedStandard}</span>
                        <ArrowRight size={12} className="text-gray-400" />
                        <span className="is-code-chip">{other}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeClass(rel.type)}`}>
                        {rel.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-snug">
                      {rel.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Normative Link Strength</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#003366]"
                          style={{ width: `${Math.round(rel.strength * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeRelationships.length === 0 && (
              <p className="text-xs text-gray-500 py-6">
                No active normative links recorded for {selectedStandard}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
