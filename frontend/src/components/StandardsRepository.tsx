import { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  Filter, 
  Layers, 
  Search, 
  X 
} from 'lucide-react';
import type { StandardResponse, StandardSummary } from '../api/isense';
import { api } from '../api/isense';

export function StandardsRepository() {
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedStandard, setSelectedStandard] = useState<StandardResponse | null>(null);
  const [, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadStandards() {
      try {
        const data = await api.listStandards();
        setStandards(data);
      } catch (err) {
        console.error('Failed to load standards', err);
      } finally {
        setLoading(false);
      }
    }
    loadStandards();
  }, []);

  const handleSelectStandard = async (isNumber: string) => {
    setDetailLoading(true);
    try {
      const data = await api.getStandard(isNumber);
      setSelectedStandard(data);
    } catch (err) {
      console.error('Failed to fetch details for ' + isNumber, err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = standards.filter((s) => {
    const matchesSearch =
      s.is_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.product_type && s.product_type.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'MANDATORY') return s.mandatory;
    return s.product_type?.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="gov-card">
        <div className="gov-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Layers size={16} className="text-[#003366]" />
              <span>National Standards Repository — BIS Catalogue</span>
            </h2>
            <p className="text-xs text-gray-500">
              Active Indian Standards governing Personal Protective Equipment (PPE) & Headgear
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#003366] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {standards.length} Standards Catalogued
            </span>
          </div>
        </div>

        <div className="gov-card-body space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search standard by IS Number, Title (e.g. IS 4151, Motorcyclist, Industrial, Headform)..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded bg-white focus:border-[#003366] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter size={14} className="text-gray-500 hidden sm:inline" />
              {['ALL', 'MANDATORY', 'Motorcycle', 'Industrial', 'Firefighter', 'Testing'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`text-xs px-2.5 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === f
                      ? 'bg-[#003366] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'ALL' ? 'All Standards' : f === 'MANDATORY' ? 'Mandatory (QCO)' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Standards Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Loading National Standards Registry...
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th className="w-32">Standard No.</th>
                    <th>Standard Title</th>
                    <th className="w-48">Classification</th>
                    <th className="w-24 text-center">Year</th>
                    <th className="w-32 text-center">QCO Status</th>
                    <th className="w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="cursor-pointer hover:bg-blue-50/50" onClick={() => handleSelectStandard(s.is_number)}>
                      <td className="font-mono font-bold text-[#003366] text-xs">
                        <span className="is-code-chip">{s.is_number}</span>
                      </td>
                      <td>
                        <div className="font-semibold text-gray-900 text-xs">
                          {s.title}
                        </div>
                        {s.scope && (
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {s.scope}
                          </div>
                        )}
                      </td>
                      <td className="text-xs text-gray-700">
                        {s.product_type}
                      </td>
                      <td className="text-xs text-center text-gray-600 font-mono">
                        {s.year || '—'}
                      </td>
                      <td className="text-center">
                        {s.mandatory ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            MANDATORY (ISI)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            Voluntary
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStandard(s.is_number);
                          }}
                          className="text-xs font-semibold text-[#003366] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-xs text-gray-500">
                        No standards found matching your query "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Standard Detail Modal / Drawer */}
      {selectedStandard && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="is-code-chip font-bold text-sm">
                  {selectedStandard.is_number}:{selectedStandard.year}
                </span>
                <span className="badge-verified">ACTIVE REGISTRATION</span>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-[#003366]">
                  {selectedStandard.title}
                </h3>
                <p className="text-gray-500 mt-0.5">
                  Category: {selectedStandard.product_type} · Source: {selectedStandard.source_reference}
                </p>
              </div>

              {selectedStandard.scope && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <strong className="text-gray-800 block mb-1">Standard Scope & Application:</strong>
                  <p className="text-gray-700 leading-relaxed">{selectedStandard.scope}</p>
                </div>
              )}

              {/* Clauses Table */}
              {selectedStandard.clauses && selectedStandard.clauses.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Key Standard Clauses & Technical Prescriptions
                  </h4>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th className="w-24">Clause</th>
                          <th className="w-48">Parameter</th>
                          <th>Prescribed Specification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStandard.clauses.map((cl, i) => (
                          <tr key={i}>
                            <td className="font-mono font-bold text-[#003366]">{cl.clause}</td>
                            <td className="font-semibold text-gray-900">{cl.title}</td>
                            <td className="text-gray-700">{cl.requirement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Testing Requirements */}
              {selectedStandard.testing_requirements && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Mandatory Laboratory Test Protocols
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(selectedStandard.testing_requirements).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-slate-50 border border-gray-200 rounded">
                        <span className="font-bold text-[#003366] uppercase block text-[11px]">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-700">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certification & Legal Scheme */}
              {selectedStandard.certification_scheme && (
                <div className="p-3 border border-amber-200 bg-amber-50 rounded">
                  <h4 className="font-bold text-amber-900 mb-1">
                    Statutory Certification Scheme
                  </h4>
                  <p className="text-amber-800">
                    Scheme: {selectedStandard.certification_scheme.scheme}
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    Legal Basis: {selectedStandard.certification_scheme.legal_basis}
                  </p>
                  {selectedStandard.certification_scheme.penalty_clause && (
                    <p className="text-amber-900 font-semibold mt-1">
                      Penalties: {selectedStandard.certification_scheme.penalty_clause}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Data verified from BIS Standards Portal (www.bis.gov.in)
              </span>
              <button
                onClick={() => setSelectedStandard(null)}
                className="btn-gov-secondary text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
