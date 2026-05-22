import StatCard from '../components/StatCard';


export default function ControllerPendingReview() {
  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Controller Review</p>
        <h1 className="mt-2 text-3xl font-black">Match pending review</h1>
        <p className="mt-2 text-sm text-secondary">Matches waiting for controller verification will appear here.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Pending Reviews" value="0" accent />
        <StatCard label="Awaiting Results" value="0" />
        <StatCard label="Needs Action" value="0" />
      </section>

      <section className="panel">
        <h2 className="text-xl font-black">Pending Review Queue</h2>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-bg/60 p-6 text-center text-sm text-secondary">
          No matches are pending review yet.
        </div>
      </section>
    </div>
  );
}
