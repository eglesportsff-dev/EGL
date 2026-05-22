export default function StatCard({ label, value, accent }) {
  return (
    <div className="panel min-h-24 bg-gradient-to-br from-card to-bg">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
    </div>
  );
}
