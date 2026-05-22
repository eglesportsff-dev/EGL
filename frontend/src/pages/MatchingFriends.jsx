import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { acceptFriendInvite, getFriendInvites, rejectFriendInvite } from '../services/tournamentService';
import { money, when } from '../utils/format';


const statusStyle = {
  PENDING: 'bg-gold/15 text-yellow-100',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-200',
  REJECTED: 'bg-red-500/15 text-red-200',
};

export default function MatchingFriends() {
  const [invites, setInvites] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadInvites = async () => {
    setLoading(true);
    try {
      const data = await getFriendInvites();
      setInvites(Array.isArray(data) ? data : []);
      setMessage('');
    } catch (err) {
      setMessage(err.message || 'Unable to load matching requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const act = async (invite, action) => {
    setWorkingId(invite.id);
    setMessage('');
    try {
      const payload = { inviteId: invite.id, note: notes[invite.id] || '' };
      const response = action === 'accept'
        ? await acceptFriendInvite(payload)
        : await rejectFriendInvite(payload);
      await loadInvites();
      setMessage(response.message);
    } catch (err) {
      setMessage(err.message || 'Unable to update invite.');
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Matching With Friends</p>
        <h1 className="mt-2 text-3xl font-black">Latest 8 team requests</h1>
        <p className="mt-2 text-sm text-secondary">Accepting a request deducts the match entry fee from your wallet and registers you with that team.</p>
      </section>

      <Alert>{message}</Alert>

      {loading ? (
        <section className="panel text-center text-secondary">Loading matching requests...</section>
      ) : (
        <section className="space-y-3">
          {invites.map((invite) => {
            const progress = invite.requiredCount
              ? Math.min(100, Math.round((Number(invite.acceptedCount || 0) * 100) / invite.requiredCount))
              : 0;
            const pendingIncoming = invite.incoming && invite.status === 'PENDING';
            return (
              <article key={invite.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                      {invite.gameType?.replaceAll('_', ' ')} / {invite.variant?.replaceAll('_', ' ')}
                    </p>
                    <h2 className="mt-2 text-xl font-black">{invite.matchTitle}</h2>
                    <p className="mt-1 text-sm text-secondary">
                      Team {invite.teamName} / Entry {money(invite.entryFee)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[invite.status] || statusStyle.PENDING}`}>
                    {invite.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-bg/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">{invite.incoming ? 'Invited by' : 'Invite sent to'}</p>
                    <p className="mt-1 font-black">{invite.incoming ? invite.inviterUsername : invite.inviteeUsername}</p>
                    <p className="mt-1 text-xs text-slate-500">UID: {invite.incoming ? invite.inviterUid : invite.inviteeUid}</p>
                  </div>
                  <div className="rounded-2xl bg-bg/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Team progress</p>
                    <p className="mt-1 font-black">{invite.acceptedCount}/{invite.requiredCount} accepted</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {invite.note && (
                  <p className="mt-4 rounded-2xl bg-bg/70 p-3 text-sm text-slate-300">Note: {invite.note}</p>
                )}
                {invite.responseNote && (
                  <p className="mt-3 rounded-2xl bg-bg/70 p-3 text-sm text-slate-300">Response: {invite.responseNote}</p>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-xs text-slate-500">Requested {when(invite.createdAt)}</p>
                  {pendingIncoming && (
                    <>
                      <textarea
                        className="input min-h-20 resize-y"
                        maxLength={240}
                        placeholder="Optional response note"
                        value={notes[invite.id] || ''}
                        onChange={(event) => setNotes((current) => ({ ...current, [invite.id]: event.target.value }))}
                      />
                      <div className="flex flex-wrap gap-3">
                        <button className="btn-primary" type="button" disabled={workingId === invite.id} onClick={() => act(invite, 'accept')}>
                          {workingId === invite.id ? 'Working...' : 'Accept request'}
                        </button>
                        <button className="btn-ghost" type="button" disabled={workingId === invite.id} onClick={() => act(invite, 'reject')}>
                          Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
          {!invites.length && (
            <section className="panel text-center">
              <h2 className="text-lg font-black">No friend matching requests</h2>
              <p className="mt-2 text-sm text-secondary">Team invites from other players will appear here.</p>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
