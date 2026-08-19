export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-start items-center relative overflow-hidden">
      {/* Top Glowing Linear Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-blue-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 w-full animate-[pulse_1s_infinite] shadow-[0_0_12px_#2563eb]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-12 flex flex-col gap-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-full h-52 bg-slate-200/70 rounded-3xl" />
        
        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-7 w-48 bg-slate-200/80 rounded-lg" />
          <div className="h-5 w-24 bg-slate-200/60 rounded-md" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200/60 rounded-2xl flex flex-col p-4 gap-3">
              <div className="h-32 bg-slate-300/50 rounded-xl w-full" />
              <div className="h-5 bg-slate-300/60 rounded w-3/4" />
              <div className="h-4 bg-slate-300/40 rounded w-1/2" />
              <div className="mt-auto h-9 bg-slate-300/50 rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
