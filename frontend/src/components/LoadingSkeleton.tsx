/**
 * LoadingSkeleton — shimmer placeholders during analysis
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="glass p-6">
        <div className="skeleton h-3 w-24 mb-4 rounded" />
        <div className="skeleton h-5 w-48 mb-6 rounded" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-7 h-7 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 rounded" style={{ width: `${60 + i * 5}%` }} />
                <div className="skeleton h-2.5 rounded" style={{ width: `${40 + i * 3}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6">
        <div className="skeleton h-3 w-32 mb-4 rounded" />
        <div className="skeleton h-28 rounded-xl" />
      </div>

      <div className="glass p-6">
        <div className="skeleton h-3 w-28 mb-4 rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
