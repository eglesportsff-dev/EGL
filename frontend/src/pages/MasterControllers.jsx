import { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import { getMasterControllers } from '../services/tournamentService';
import { money, when } from '../utils/format';


export default function MasterControllers() {
  const [controllers, setControllers] = useState([]);
  const [openControllerId, setOpenControllerId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMasterControllers()
      .then((data) => {
        setControllers(Array.isArray(data) ? data : []);
        setMessage('');
      })
      .catch((err) => {
        setControllers([]);
        setMessage(err.message || 'Unable to load controllers');
      });
  }, []);

  const totals = useMemo(() => controllers.reduce((acc, controller) => ({
    totalMatches: acc.totalMatches + Number(controller.totalMatches || 0),
    activeMatches: acc.activeMatches + Number(controller.activeMatches || 0),
    totalPlayers: acc.totalPlayers + Number(controller.totalPlayers || 0),
    entryFeeTotal: acc.entryFeeTotal + Number(controller.entryFeeTotal || 0),
    rewardTotal: acc.rewardTotal + Number(controller.rewardTotal || 0),
    savedTotal: acc.savedTotal + Number(controller.savedTotal || 0),
  }), {
    totalMatches: 0,
    activeMatches: 0,
    totalPlayers: 0,
    entryFeeTotal: 0,
    rewardTotal: 0,
    savedTotal: 0,
  }), [controllers]);

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Master - Controllers</p>
        <h1 className="mt-2 text-3xl font-black">Controller data and match records</h1>
        <p className="mt-2 text-sm text-secondary">Track active controllers, their details, and every match they created.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Active Controllers" value={controllers.length} accent />
        <StatCard label="Total Matches" value={totals.totalMatches} />
        <StatCard label="Active Matches" value={totals.activeMatches} />
        <StatCard label="Players Joined" value={totals.totalPlayers} />
        <StatCard label="Entry Collected" value={money(totals.entryFeeTotal)} />
        <StatCard label="Saved Total" value={money(totals.savedTotal)} />
      </section>

      <Alert type={message?.toLowerCase().includes('unable') ? 'error' : 'info'}>{message}</Alert>

      <section className="space-y-4">
        {controllers.map((controller) => {
          const isOpen = openControllerId === controller.controllerProfileId;

          return (
            <article className="panel space-y-4" key={controller.controllerProfileId}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{controller.username}</h2>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-200">Active</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-secondary">
                    <p>Email: <b className="text-white">{controller.email}</b></p>
                    <p>App UID: <b className="text-white">{controller.uid || '-'}</b></p>
                    <p>Matches: <b className="text-white">{controller.totalMatches}</b></p>
                    <p>Active: <b className="text-white">{controller.activeMatches}</b></p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="text-secondary">Entry / Saved</p>
                    <p className="font-black text-white">{money(controller.entryFeeTotal)} / {money(controller.savedTotal)}</p>
                  </div>
                  <button
                    className={isOpen ? 'btn-ghost whitespace-nowrap' : 'btn-primary whitespace-nowrap'}
                    type="button"
                    onClick={() => setOpenControllerId(isOpen ? null : controller.controllerProfileId)}
                  >
                    {isOpen ? 'Close Report' : 'View Report'}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <h3 className="text-lg font-black">Controller Report</h3>
                    <div className="mt-3 grid gap-3 text-sm text-secondary sm:grid-cols-2 lg:grid-cols-3">
                      <p>Profile ID: <b className="text-white">{controller.controllerProfileId}</b></p>
                      <p>User ID: <b className="text-white">{controller.userId}</b></p>
                      <p>App UID: <b className="text-white">{controller.uid || '-'}</b></p>
                      <p>Gaming UID: <b className="text-white">{controller.gameUid || '-'}</b></p>
                      <p>Email: <b className="text-white">{controller.email}</b></p>
                      <p>Created: <b className="text-white">{when(controller.createdAt)}</b></p>
                      <p>Total Matches: <b className="text-white">{controller.totalMatches}</b></p>
                      <p>Total Players: <b className="text-white">{controller.totalPlayers}</b></p>
                      <p>Reward Total: <b className="text-white">{money(controller.rewardTotal)}</b></p>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <p className="border-l border-primary/60 pl-3 text-secondary">Matches<br /><b className="text-lg text-white">{controller.totalMatches}</b></p>
                    <p className="border-l border-primary/60 pl-3 text-secondary">Active<br /><b className="text-lg text-white">{controller.activeMatches}</b></p>
                    <p className="border-l border-primary/60 pl-3 text-secondary">Entry Total<br /><b className="text-lg text-white">{money(controller.entryFeeTotal)}</b></p>
                    <p className="border-l border-primary/60 pl-3 text-secondary">Saved<br /><b className="text-lg text-white">{money(controller.savedTotal)}</b></p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1080px] text-left text-sm">
                      <thead className="text-secondary">
                        <tr>
                          <th className="py-2">Match ID</th>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Variant</th>
                          <th>Players</th>
                          <th>Entry Total</th>
                          <th>Reward Total</th>
                          <th>Saved</th>
                          <th>Match Time</th>
                          <th>Register Before</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(controller.matches || []).map((match) => (
                          <tr className="border-t border-white/10" key={match.id}>
                            <td className="py-3">{match.id}</td>
                            <td className="font-semibold">{match.title}</td>
                            <td>{match.gameType}</td>
                            <td>{match.variant}</td>
                            <td>{match.players}</td>
                            <td>{money(match.entryFeeTotal)}</td>
                            <td>{money(match.rewardTotal)}</td>
                            <td>{money(match.savedTotal)}</td>
                            <td>{when(match.matchTime)}</td>
                            <td>{when(match.registerBefore)}</td>
                            <td>
                              <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                                match.active ? 'bg-primary/15 text-purple-200' : 'bg-white/10 text-slate-300'
                              }`}>
                                {match.active ? 'Active' : 'Closed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!(controller.matches || []).length && (
                      <p className="rounded-lg bg-arena p-4 text-sm text-secondary">This controller has not created any matches yet.</p>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {!controllers.length && (
          <section className="panel text-center">
            <h2 className="text-lg font-black">No active controllers</h2>
            <p className="mt-2 text-sm text-secondary">Create a controller from the Master page to start tracking their match records.</p>
          </section>
        )}
      </section>
    </div>
  );
}
