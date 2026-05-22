import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import useAsync from '../hooks/useAsync';
import { getDashboard } from '../services/tournamentService';
import { money, when } from '../utils/format';

export default function Dashboard() {
  const { data, loading, error } = useAsync(getDashboard, []);
  if (loading) return <div className="screen-center">Loading dashboard...</div>;
  if (error) return <Alert type="error">{error}</Alert>;
  const requestUpdates = Array.isArray(data.requestUpdates) ? data.requestUpdates : [];

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Player Dashboard</p>
        <h1 className="mt-2 text-3xl font-black">Ready for the next room?</h1>
        <p className="mt-2 text-sm text-secondary">Your wallet, qualification, and updates stay compact here.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Wallet Balance" value={money(data.wallet.walletBalance)} accent />
        <StatCard label="Winning Points" value={money(data.wallet.winningPoints)} />
        <StatCard label="Qualification" value={data.qualificationStatus} />
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <div className="panel">
          <h2 className="font-black">Last Wallet Activity</h2>
          <div className="mt-3 space-y-2">
            {data.lastTransactions.map((tx) => <p key={tx.id} className="rounded bg-arena p-2 text-sm">{tx.note} <b>{money(tx.amount)}</b></p>)}
            {!data.lastTransactions.length && <p className="text-sm text-secondary">No wallet activity yet.</p>}
          </div>
        </div>
        <div className="panel">
          <h2 className="font-black">Tournament Updates</h2>
          <div className="mt-3 space-y-2">
            {data.updates.map((item) => <p key={item.id} className="text-sm text-slate-300"><b className="text-white">{item.title}</b> {item.message}</p>)}
            {!data.updates.length && <p className="text-sm text-secondary">No tournament updates yet.</p>}
          </div>
        </div>
      </section>
      <section className="panel">
        <h2 className="font-black">Request Updates</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {requestUpdates.map((item) => (
            <div className="rounded-xl border border-white/10 bg-arena p-3 text-sm" key={`${item.type}-${item.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b>{item.type} {money(item.amount)}</b>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                  item.status === 'REJECTED' ? 'bg-red-500/15 text-red-200' :
                  item.status === 'APPROVED' || item.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-200' :
                  'bg-primary/15 text-purple-200'
                }`}>{item.status}</span>
              </div>
              <p className="mt-2 text-secondary">{item.message}</p>
              <p className="mt-2 text-xs text-slate-500">{item.reference} - {when(item.createdAt)}</p>
            </div>
          ))}
          {!requestUpdates.length && <p className="text-sm text-secondary">No deposit or withdrawal updates yet.</p>}
        </div>
      </section>
      {data.qualificationStatus === 'Q' && <button className="btn-primary w-full sm:w-auto">Apply for Tournament</button>}
    </div>
  );
}
