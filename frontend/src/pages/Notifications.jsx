import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { acceptTeamInvite, getNotifications, markNotificationsRead } from '../services/tournamentService';
import { when } from '../utils/format';


const typeStyles = {
  PAYMENT: {
    label: 'Payment',
    chip: 'bg-emerald-500/15 text-emerald-200',
    marker: 'bg-emerald-400',
  },
  MATCH: {
    label: 'Match',
    chip: 'bg-primary/15 text-purple-200',
    marker: 'bg-gold',
  },
  UPDATE: {
    label: 'Update',
    chip: 'bg-gold/15 text-yellow-100',
    marker: 'bg-gold',
  },
};

export default function Notifications() {
  const [center, setCenter] = useState({ notifications: [], unreadCount: 0 });
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getNotifications();
        if (!active) return;

        const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
        const unreadCount = Number(data?.unreadCount || 0);
        setCenter({ notifications, unreadCount });
        setError('');

        if (unreadCount > 0) {
          markNotificationsRead()
            .then(() => window.dispatchEvent(new Event('notifications:read')))
            .catch(() => {});
        }
      } catch (err) {
        if (active) setError(err.message || 'Unable to load notifications');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const acceptInvite = async (matchId) => {
    setError('');
    setAcceptingId(matchId);

    try {
      await acceptTeamInvite({ matchId });
      setAcceptedMatches((current) => [...current, matchId]);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to accept invite');
    } finally {
      setAcceptingId(null);
    }
  };

  const isPlayerMessageNotification = (item) => item.title?.toLowerCase().startsWith('new message from');
  const notifications = center.notifications.filter((item) => !isPlayerMessageNotification(item));
  const visibleUnreadCount = notifications.filter((item) => !item.seen).length;

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gold">Notification Centre</p>
            <h1 className="mt-2 text-3xl font-black">Latest 12 updates</h1>
            <p className="mt-2 text-sm text-secondary">Payments, match announcements, and account activity stay here.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-bg/50 p-1">
              <button className={`px-3 py-1 text-sm ${tab === 'ALL' ? 'bg-primary text-white rounded' : 'text-secondary'}`} onClick={() => setTab('ALL')}>All</button>
              <button className={`px-3 py-1 text-sm ${tab === 'MESSAGES' ? 'bg-primary text-white rounded' : 'text-secondary'}`} onClick={() => setTab('MESSAGES')}>Friend Messages</button>
            </div>
            {visibleUnreadCount > 0 && (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-bg">
              {Math.min(visibleUnreadCount, 12)} new
            </span>
            )}
          </div>
        </div>
      </section>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <section className="panel text-center text-secondary">Loading notifications...</section>
      ) : (
        <section className="space-y-3">
          {notifications
            .filter((item) => (tab === 'ALL' ? true : item.type === 'MESSAGE'))
            .map((item) => {
            const styles = typeStyles[item.type] || typeStyles.MATCH;
            return (
              <article className="panel p-0" key={item.id}>
                <div className="flex gap-3 p-4">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.seen ? 'bg-white/20' : styles.marker}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="truncate text-base font-black">{item.title}</h2>
                        {!item.seen && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">New</span>}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${styles.chip}`}>{styles.label}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{when(item.createdAt)}</p>
                    {item.referenceId && item.title?.toLowerCase().includes('invite') && (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-slate-400">Team invite can be accepted to complete registration.</span>
                        <button
                          type="button"
                          disabled={acceptedMatches.includes(item.referenceId) || acceptingId === item.referenceId}
                          onClick={() => acceptInvite(item.referenceId)}
                          className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-bg transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acceptedMatches.includes(item.referenceId)
                            ? 'Accepted'
                            : acceptingId === item.referenceId
                            ? 'Accepting...'
                            : 'Accept Invite'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {!notifications.length && (
            <section className="panel text-center">
              <h2 className="text-lg font-black">No notifications yet</h2>
              <p className="mt-2 text-sm text-secondary">New wallet updates and match announcements will appear here.</p>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
