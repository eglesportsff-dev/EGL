import Alert from '../components/Alert';
import { Link } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { getLeaderboard } from '../services/tournamentService';


const points = (value) => Number(value || 0).toFixed(0);

export default function Leaderboard() {
  const { data = [], loading, error } = useAsync(getLeaderboard, []);
  if (loading) return <div className="screen-center">Loading leaderboard...</div>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="panel overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black">Player Leaderboard</h1>
        <Link className="btn-ghost" to="/point-table">View Tournament Point Table</Link>
      </div>
      {data.length === 0 ? (
        <div className="rounded-md bg-arena p-5 text-sm text-slate-400">No players are ranked yet. Winning results will update leaderboard points automatically.</div>
      ) : <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-slate-400">
          <tr><th className="py-2">Rank</th><th>Player Name</th><th>Gaming UID</th><th>Points</th><th>Status</th></tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.playerId || row.teamId} className="border-t border-line">
              <td className="py-3 font-black text-ember">#{row.rank}</td>
              <td>{row.playerName || row.teamName}</td>
              <td>{row.gameUid || row.playerUid || '-'}</td>
              <td><span className="rounded-full bg-gold/15 px-3 py-1 font-black text-gold">{points(row.totalWinningPoints)} pts</span></td>
              <td>{row.qualified ? 'Qualified' : 'Need 500 pts'}</td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}
