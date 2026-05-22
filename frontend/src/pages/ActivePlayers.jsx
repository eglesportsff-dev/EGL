import { useMemo, useState } from 'react';
import { getActivePlayers, sendMessage } from '../services/tournamentService';
import useAsync from '../hooks/useAsync';
import Alert from '../components/Alert';


export default function ActivePlayers() {
  const [page, setPage] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [search, setSearch] = useState('');

  const { data, loading, error } = useAsync(() => getActivePlayers(page, 10, search), [page, search]);
  const loadedPlayers = data || [];
  const isSearching = search.trim().length > 0;
  const players = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return loadedPlayers;
    }

    return loadedPlayers.filter((player) => {
      const username = (player.username || '').toLowerCase();
      const gameUid = (player.gameUid || '').toLowerCase();

      return username.includes(normalizedSearch) || gameUid.includes(normalizedSearch);
    });
  }, [loadedPlayers, search]);

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
                  <PlayerCard key={player.userId} player={player} onMessage={setSelectedPlayer} />
                ))}
              </div>
            </section>
          )}

          {recentCount > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-bold text-gold uppercase">Recently Active ({recentCount})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {players.filter(p => p.status === 'RECENT').map((player) => (
                  <PlayerCard key={player.userId} player={player} onMessage={setSelectedPlayer} />
                ))}
              </div>
            </section>
          )}

          {inactiveCount > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-bold text-gold uppercase">Other Players ({inactiveCount})</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {players.filter(p => p.status === 'INACTIVE').map((player) => (
                  <PlayerCard key={player.userId} player={player} onMessage={setSelectedPlayer} />
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
            <button className="btn-secondary" onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </section>
        </>
      )}

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="panel w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Message {selectedPlayer.username}</h2>
              <button
                className="text-2xl"
                onClick={() => {
                  setSelectedPlayer(null);
                  setMessage('');
                  setWordCount(0);
                }}
              >
                ✕
              </button>
            </div>

            {selectedPlayer.profileScreenshotUrl && (
              <img
                src={selectedPlayer.profileScreenshotUrl}
                alt={selectedPlayer.username}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}

            <div>
              <p className="text-sm text-secondary">Username: {selectedPlayer.username}</p>
              <p className="text-sm text-secondary">Gaming UID: {selectedPlayer.gameUid || 'Not set'}</p>
            </div>

            <div>
              <textarea
                className="input min-h-24 resize-y"
                placeholder="Type your message (max 10 words)..."
                value={message}
                onChange={handleMessageChange}
                maxLength={100}
              />
              <p className={`mt-2 text-xs ${wordCount > 10 ? 'text-red-400' : 'text-secondary'}`}>
                Words: {wordCount}/10
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-primary flex-1"
                disabled={sending || wordCount === 0 || wordCount > 10}
                onClick={handleSendMessage}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
              <button
                className="btn-ghost flex-1"
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

function PlayerCard({ player, onMessage }) {
  const statusColor = {
    ACTIVE: 'bg-green-500',
    RECENT: 'bg-yellow-500',
    INACTIVE: 'bg-gray-500'
  };

  const statusText = {
    ACTIVE: 'Active Now',
    RECENT: 'Recently Active',
    INACTIVE: 'Inactive'
  };

  return (
    <div className="panel relative space-y-2 overflow-hidden">
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${statusColor[player.status]}`} />

      {/* Profile image */}
      {player.profileScreenshotUrl && (
        <img
          src={player.profileScreenshotUrl}
          alt={player.username}
          className="h-24 w-full rounded-lg object-cover"
        />
      )}

      {/* Player info */}
      <div className="truncate">
        <p className="truncate font-bold">{player.username}</p>
        <p className="truncate text-xs text-secondary">UID: {player.gameUid || 'No UID'}</p>
      </div>

      {/* Status and points */}
      <div className="space-y-1 text-xs">
        <p className="text-secondary">{statusText[player.status]}</p>
        <p className="text-gold">Points: {player.winningPoints}</p>
      </div>

      {/* Message button */}
      <button
        className="btn-primary w-full py-2 text-center text-sm"
        onClick={() => onMessage(player)}
      >
        + Message
      </button>
    </div>
  );
}
