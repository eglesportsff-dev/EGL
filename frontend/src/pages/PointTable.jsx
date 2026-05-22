import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import useAsync from '../hooks/useAsync';
import { getPointTable } from '../services/tournamentService';


const points = (value) => Number(value || 0).toFixed(0);

export default function PointTable() {
  const { data = [], loading, error } = useAsync(() => getPointTable(1), []);
  if (loading) return <div className="screen-center">Loading point table...</div>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="panel overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ember">Tournament Point Table</p>
          <h1 className="text-xl font-black">Solo Player Rank And Total Winning Points</h1>
        </div>
        <Link className="btn-ghost" to="/leaderboard">Back</Link>
      </div>
      {data.length === 0 ? (
        <div className="rounded-md bg-arena p-5 text-sm text-slate-400">No player points have been updated yet.</div>
      ) : (
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-slate-400">
            <tr><th className="py-2">Rank</th><th>Player Name</th><th>Gaming UID</th><th>Points</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.playerId || row.teamId} className="border-t border-line">
                <td className="py-3 font-black text-ember">#{row.rank}</td>
                <td>{row.playerName || row.teamName}</td>
                <td>{row.gameUid || row.playerUid || '-'}</td>
                <td><span className="rounded-full bg-primary/15 px-3 py-1 font-black text-gold">{points(row.totalWinningPoints)} pts</span></td>
                <td>{row.qualified ? 'Qualified' : 'Need 500 pts'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
