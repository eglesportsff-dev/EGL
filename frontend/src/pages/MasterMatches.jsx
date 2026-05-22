import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { getMasterMatches } from '../services/tournamentService';
import { money, when } from '../utils/format';


const tabs = [['live', 'Live Matches'], ['history', 'History'], ['upcoming', 'Upcoming Matches']];

export default function MasterMatches() {
  const [status, setStatus] = useState('live');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMasterMatches(status).then(setRows).catch((err) => setMessage(err.message));
  }, [status]);

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Master · Matches</p>
        <h1 className="mt-2 text-3xl font-black">Match finance overview</h1>
      </section>
      <div className="panel flex gap-2 overflow-x-auto">
        {tabs.map(([id, label]) => <button key={id} className={status === id ? 'btn-primary' : 'btn-ghost'} onClick={() => setStatus(id)}>{label}</button>)}
      </div>
      <Alert>{message}</Alert>
      <section className="panel overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-secondary"><tr><th className="py-2">Title</th><th>Type</th><th>Variant</th><th>Players</th><th>Entry Total</th><th>Reward Total</th><th>Saved</th><th>Match Time</th><th>Register Before</th></tr></thead>
          <tbody>{rows.map((r) => <tr className="border-t border-white/10" key={r.id}>
            <td className="py-3 font-semibold">{r.title}</td><td>{r.gameType}</td><td>{r.variant}</td><td>{r.players}</td><td>{money(r.entryFeeTotal)}</td><td>{money(r.rewardTotal)}</td><td>{money(r.savedTotal)}</td><td>{when(r.matchTime)}</td><td>{when(r.registerBefore)}</td>
          </tr>)}</tbody>
        </table>
        {!rows.length && <p className="p-5 text-center text-secondary">No matches in this section.</p>}
      </section>
    </div>
  );
}
