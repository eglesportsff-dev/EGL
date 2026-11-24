export default function StatCard({ label, value, accent, subtext, icon: Icon }) {
  return (
    <div className="panel min-h-24 bg-gradient-to-br from-[#121A2D] to-[#0A0E18] border border-white/10 transition-all hover:border-fire-500/30">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">{label}</p>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <p className={`mt-2 text-2xl font-black tracking-tight font-mono ${accent ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {subtext && <p className="mt-1 text-[11px] text-slate-500">{subtext}</p>}
    </div>
  );
}