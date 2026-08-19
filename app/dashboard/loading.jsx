export default function DashboardLoading() {
  return (
    <div className="min-h-[80vh] w-full p-6 flex flex-col gap-6 animate-pulse">
      {/* Top Glowing Linear Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-blue-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 w-full animate-[pulse_1s_infinite] shadow-[0_0_12px_#2563eb]" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200/60 pb-5">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200/60 rounded-2xl p-4 border border-slate-200/60" />
        ))}
      </div>

      <div className="h-96 w-full bg-slate-200/60 rounded-2xl border border-slate-200/60 mt-4" />
    </div>
  );
}
