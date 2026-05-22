import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import useAsync from '../hooks/useAsync';
import { getTodayControllerReviews } from '../services/tournamentService';
import { money, when } from '../utils/format';


const points = (value) => Number(value || 0).toFixed(0);

export default function ControllerTodayReviewed() {
  const { data, loading, error } = useAsync(getTodayControllerReviews, []);
  const reviews = data?.items || [];

  if (loading) return <div className="screen-center">Loading today's reviews...</div>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Controller Review</p>
        <h1 className="mt-2 text-3xl font-black">Today reviewed matches</h1>
        <p className="mt-2 text-sm text-secondary">Only controller-reviewed matches from today are counted here.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Reviewed Today" value={data.totalReviews || 0} accent />
        <StatCard label="Rewards Updated" value={money(data.rewardsUpdated)} />
        <StatCard label="Points Updated" value={points(data.pointsUpdated)} />
      </section>

      <section className="panel">
        <h2 className="text-xl font-black">Today's Review Log</h2>
        {reviews.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-bg/60 p-6 text-center text-sm text-secondary">
            No matches have been reviewed today.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-white/10 bg-bg/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-ember">{review.gameType?.replaceAll('_', ' ')} - {review.variant?.replaceAll('_', ' ')}</p>
                    <h3 className="mt-1 font-black">{review.matchTitle}</h3>
                    <p className="mt-1 text-sm text-secondary">{review.winnerSummary}</p>
                  </div>
                  <span className="text-xs text-slate-400">{when(review.reviewedAt)}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <span className="rounded-xl bg-card p-2">Rewards <b>{money(review.rewardsUpdated)}</b></span>
                  <span className="rounded-xl bg-card p-2">Points <b>{points(review.pointsUpdated)}</b></span>
                  <span className="rounded-xl bg-card p-2">By <b>{review.controllerUsername}</b></span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
