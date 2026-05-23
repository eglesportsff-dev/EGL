import { useMemo, useState } from 'react';
import { getActivePlayers, sendMessage } from '../services/tournamentService';
import useAsync from '../hooks/useAsync';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function ActivePlayers() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [search, setSearch] = useState('');

  const { data, loading, error } = useAsync(() => getActivePlayers(page, 5, search), [page, search]);
  const loadedPlayers = data || [];
  const isSearching = search.trim().length > 0;

  const players = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    // Exclude the current user from the list
    let list = loadedPlayers;
    if (user) {
      list = list.filter((p) => p.userId !== user.id);
    }

    if (!normalizedSearch) {
      return list;
    }

    return list.filter((player) => {
      const username = (player.username || '').toLowerCase();
      const gameUid = (player.gameUid || '').toLowerCase();

      return username.includes(normalizedSearch) || gameUid.includes(normalizedSearch);
    });
  }, [loadedPlayers, search, user]);

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
  };

  const handleSendMessage = async () => {
    if (!selectedPlayer || !message.trim()) {
      setAlert('Please enter a message');
      return;
    }

    const words = message.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (words > 10) {
      setAlert('Message must be 10 words or less');
      return;
    }

    setSending(true);
    try {
      await sendMessage({
        recipientId: selectedPlayer.userId,
        content: message.trim()
      });
      setAlert('Message sent successfully!');
      setMessage('');
      setSelectedPlayer(null);
      setWordCount(0);
      setTimeout(() => setAlert(''), 3000);
    } catch (err) {
      setAlert(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeCount = players.filter(p => p.status === 'ACTIVE').length;
  const recentCount = players.filter(p => p.status === 'RECENT').length;
  const inactiveCount = players.filter(p => p.status === 'INACTIVE').length;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Player Community</p>
        <h1 className="mt-2 text-3xl font-black">Active Players</h1>
        <p className="mt-2 text-sm text-secondary">
          Connect with other players for match making or custom notes (max 10 words).
        </p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            className="input"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search players by name or UID"
            aria-label="Search players by name or UID"
          />
        </div>
        {isSearching && (
          <button
            className="btn-ghost sm:w-auto"
            type="button"
            onClick={() => {
              setSearch('');
              setPage(0);
            }}
          >
            Clear
          </button>
        )}
      </section>

      <Alert>{alert}</Alert>

      {error && (
        <section className="panel text-center text-red-400">
          Error loading players. Please try again.
        </section>
      )}

      {loading ? (
        <section className="panel text-center text-secondary">
          Loading active players...
        </section>
      ) : players.length === 0 ? (
        <section className="panel text-center">
          <h2 className="text-lg font-black">
            {isSearching ? 'No players match your search' : 'No players found'}
          </h2>
        </section>
      ) : (
        <>
          {activeCount > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-bold text-gold uppercase">Active Now ({activeCount})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {players.filter(p => p.status === 'ACTIVE').map((player) => (
                  <PlayerCard key={player.userId} player={player} onClick={setSelectedPlayer} />
                ))}
              </div>
            </section>
          )}

          {recentCount > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-bold text-gold uppercase">Recently Active ({recentCount})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {players.filter(p => p.status === 'RECENT').map((player) => (
                  <PlayerCard key={player.userId} player={player} onClick={setSelectedPlayer} />
                ))}
              </div>
            </section>
          )}

          {inactiveCount > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-bold text-gold uppercase">Other Players ({inactiveCount})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {players.filter(p => p.status === 'INACTIVE').map((player) => (
                  <PlayerCard key={player.userId} player={player} onClick={setSelectedPlayer} />
                ))}
              </div>
            </section>
          )}

          <section className="flex justify-between">
            <button
              className="btn-secondary"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="text-secondary">Page {page + 1}</span>
            <button
              className="btn-secondary"
              disabled={loadedPlayers.length < 5}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </section>
        </>
      )}

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <div className="panel w-full max-w-lg space-y-5 bg-gradient-to-b from-card to-bg border border-white/10 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Player Profile</h2>
              <button
                className="text-secondary hover:text-white transition-colors text-2xl p-1"
                aria-label="Close profile details"
                onClick={() => {
                  setSelectedPlayer(null);
                  setMessage('');
                  setWordCount(0);
                }}
              >
                ✕
              </button>
            </div>

            {selectedPlayer.profileScreenshotUrl ? (
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex justify-center items-center">
                <img
                  src={selectedPlayer.profileScreenshotUrl}
                  alt={selectedPlayer.username}
                  className="max-h-72 w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-secondary">
                No screenshot uploaded
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Username</span>
                <span className="font-bold text-white text-base truncate block">{selectedPlayer.username}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Gaming UID</span>
                <span className="font-bold text-white text-base truncate block">{selectedPlayer.gameUid || 'Not set'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Winning Points</span>
                <span className="font-bold text-gold text-base block">{selectedPlayer.winningPoints ?? 0}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-secondary block">Status</span>
                <span className="inline-flex items-center gap-1.5 font-bold mt-1 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    selectedPlayer.status === 'ACTIVE' ? 'bg-green-500' :
                    selectedPlayer.status === 'RECENT' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  {selectedPlayer.status === 'ACTIVE' ? 'Active Now' :
                   selectedPlayer.status === 'RECENT' ? 'Recently Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <label className="text-xs font-bold text-gold uppercase block">Send Message</label>
              <textarea
                className="input min-h-20 resize-none text-sm"
                placeholder="Type your message (max 10 words)..."
                value={message}
                onChange={handleMessageChange}
                maxLength={120}
              />
              <div className="flex justify-between items-center">
                <p className={`text-xs ${wordCount > 10 ? 'text-red-400 font-bold' : 'text-secondary'}`}>
                  Words: {wordCount}/10
                </p>
                {wordCount > 10 && (
                  <p className="text-xs text-red-400 font-semibold">Must be 10 words or less</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="btn-primary flex-1 py-2.5 font-bold"
                disabled={sending || wordCount === 0 || wordCount > 10}
                onClick={handleSendMessage}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <button
                className="btn-ghost flex-1 py-2.5 font-bold"
                onClick={() => {
                  setSelectedPlayer(null);
                  setMessage('');
                  setWordCount(0);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, onClick }) {
  const statusColor = {
    ACTIVE: 'bg-green-500',
    RECENT: 'bg-yellow-500',
    INACTIVE: 'bg-gray-500'
  };

  return (
    <div
      onClick={() => onClick(player)}
      className="panel relative flex flex-col justify-center cursor-pointer border border-white/5 hover:border-primary/55 hover:shadow-glow-sm transition-all duration-200 p-4 min-h-[5.5rem] select-none"
    >
      {/* Status dot */}
      <div className={`absolute top-3 right-3 h-3 w-3 rounded-full ${statusColor[player.status]}`} />

      {/* Info */}
      <div className="pr-6">
        <p className="font-bold text-white text-base truncate">{player.username}</p>
        <p className="text-xs text-secondary mt-1 truncate">UID: {player.gameUid || 'No UID'}</p>
      </div>
    </div>
  );
}

