import { useEffect, useState } from 'react';
import { Gavel, Scale } from 'lucide-react';
import type { QCOOrder } from '../api/isense';
import { api } from '../api/isense';

export function QCOOrdersView() {
  const [orders, setOrders] = useState<QCOOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getQcoOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load QCO orders', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="gov-card">
        <div className="gov-card-header flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Scale size={16} className="text-[#003366]" />
              <span>Quality Control Orders (QCO) Compliance Reference</span>
            </h2>
            <p className="text-xs text-gray-500">
              Statutory Quality Control Orders reference repository for procurement officers under the BIS Act, 2016
            </p>
          </div>
          <span className="badge-critical text-[11px]">
            Statutory Reference
          </span>
        </div>

        <div className="gov-card-body space-y-6">
          {/* Statutory Notice */}
          <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg flex items-start gap-3">
            <Gavel size={20} className="text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed">
              <strong className="block text-sm font-bold text-red-950 mb-1">
                Mandatory Legal Notice for Government Procurement Officers
              </strong>
              Under Section 16 of the BIS Act, 2016 and General Financial Rules (GFR) Rule 144, Central and State Government departments, autonomous bodies, and Public Sector Undertakings (PSUs) are strictly prohibited from procuring goods that do not bear the Standard Mark (ISI Mark) for items notified under Quality Control Orders. 
              Any tender invitation that permits non-ISI compliant headgear is legally invalid and subjects procurement committee members to vigilance inquiry under CVC regulations.
            </div>
          </div>

          {/* QCO Cards */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Loading Official Gazette Notifications...
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((qco, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-5 bg-white hover:border-[#003366] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <span className="badge-qco text-xs">
                        {qco.enforcement_status}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">
                        {qco.order_title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right text-xs">
                      <span className="text-gray-500 block">Gazette Notification</span>
                      <span className="font-mono font-bold text-[#003366]">{qco.gazette_no}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div className="p-2.5 bg-slate-50 border border-gray-200 rounded">
                      <span className="text-gray-500 block text-[11px] font-bold uppercase">Notified By</span>
                      <span className="font-medium text-gray-900">{qco.ministry}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-gray-200 rounded">
                      <span className="text-gray-500 block text-[11px] font-bold uppercase">Mandated Standard</span>
                      <span className="font-mono font-bold text-[#003366]">{qco.standard_mandated}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-gray-200 rounded">
                      <span className="text-gray-500 block text-[11px] font-bold uppercase">Date of Gazette Notification</span>
                      <span className="font-medium text-gray-900">{qco.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    {qco.summary}
                  </p>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs space-y-1">
                    <div className="text-amber-950 font-bold">
                      Central Vigilance Commission (CVC) Tender Directive:
                    </div>
                    <p className="text-amber-900">
                      {qco.cvc_guideline}
                    </p>
                    <div className="pt-1 text-[11.5px] text-red-800 font-semibold">
                      Statutory Penalties: {qco.penalties}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
