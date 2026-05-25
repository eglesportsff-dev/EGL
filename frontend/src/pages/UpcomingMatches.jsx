import Alert from '../components/Alert';
import MatchCard from '../components/MatchCard';
import useAsync from '../hooks/useAsync';
import { getUpcomingMatches } from '../services/tournamentService';


export default function UpcomingMatches() {
  const { data, loading, error } = useAsync(getUpcomingMatches, []);
  const matches = Array.isArray(data) ? data : [];

  if (loading) return <div className="screen-center">Loading upcoming matches...</div>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Your Schedule</p>
        <h1 className="mt-2 text-3xl font-black">Upcoming Matches</h1>
        <p className="mt-2 text-sm text-secondary">
          Matches where your entry is registered and are upcoming or currently live.
        </p>
      </section>

      {matches.length ? (
        <section className="grid gap-3 md:grid-cols-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              footerContent={<RoomDetails match={match} />}
            />
          ))}
        </section>
      ) : (
        <section className="panel text-center">
          <h2 className="text-lg font-black">No upcoming registered matches</h2>
          <p className="mt-2 text-sm text-secondary">
            Matches you join will appear here after registration.
          </p>
        </section>
      )}
    </div>
  );
}

function RoomDetails({ match }) {
  const hasRoomDetails = match.roomId && match.roomPassword;

  return (
    <div className="mt-4 rounded-3xl bg-bg/80 p-4 text-sm">
      {hasRoomDetails ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-card p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Room ID</p>
            <p className="mt-2 break-words font-black text-white">{match.roomId}</p>
          </div>
          <div className="rounded-xl bg-card p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Password</p>
            <p className="mt-2 break-words font-black text-white">{match.roomPassword}</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-black text-white">Room details pending</p>
          <p className="mt-2 text-secondary">The controller will share the room ID and password before the match.</p>
        </div>
      )}
    </div>
  );
}
