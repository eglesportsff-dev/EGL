import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import MatchCard from '../components/MatchCard';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';
import { getMatches, getControllerMatches, joinMatch, validateTeamJoin, joinTeam, getMatchParticipants, saveMatchRoomDetails, saveMatchTiming, submitMatchResults, deleteControllerMatch } from '../services/tournamentService';
import { when } from '../utils/format';


const groups = {
  ALL: [],
  BATTLE_ROYALE: ['BR_SQUAD', 'BR_DUO', 'BR_SOLO'],
  CLASH_SQUAD: ['CS_SQUAD'],
  LONE_WOLF: ['LONE_WOLF_1V1', 'LONE_WOLF_2V2'],
};

const labels = {
  ALL: 'View All Matches',
  BATTLE_ROYALE: 'BR',
  CLASH_SQUAD: 'CS',
  LONE_WOLF: 'Lone Wolf',
};

const resultPositions = [
  { key: 'firstUid', label: '1st' },
  { key: 'secondUid', label: '2nd' },
  { key: 'thirdUid', label: '3rd' },
];

const winnerOnlyPositions = [
  { key: 'firstUid', label: 'Winner' },
];

const resultEntryKey = (participant) => {
  const team = participant.teamName || 'Solo';
  return team === 'Solo' ? `solo:${participant.uid}` : `team:${team}`;
};

const getTeamSize = (variant) => {
  switch (variant) {
    case 'BR_DUO':
    case 'LONE_WOLF_2V2':
      return 2;
    case 'BR_SQUAD':
    case 'CS_SQUAD':
      return 4;
    default:
      return 1;
  }
};

const usesWinnerOnlyResult = (match) => match?.gameType === 'CLASH_SQUAD' || match?.gameType === 'LONE_WOLF';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

function ControllerRoomDetails({ match }) {
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
          <p className="font-black text-white">Room details not sent</p>
          <p className="mt-2 text-secondary">Send room ID and password when the room is ready.</p>
        </div>
      )}
    </div>
  );
}

export default function Matches() {
  const auth = useAuth();
  const user = auth?.user;
  const [type, setType] = useState('ALL');
  const [variant, setVariant] = useState('');
  const [notice, setNotice] = useState('');
  const [joinNotice, setJoinNotice] = useState('');
  const [selectedJoinMatch, setSelectedJoinMatch] = useState(null);
  const [selectedRoomMatch, setSelectedRoomMatch] = useState(null);
  const [selectedResultMatch, setSelectedResultMatch] = useState(null);
  const [selectedDeleteMatch, setSelectedDeleteMatch] = useState(null);
  const [selectedParticipantsMatch, setSelectedParticipantsMatch] = useState(null);
  const [joinMode, setJoinMode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [playerUids, setPlayerUids] = useState([]);
  const [inviteNote, setInviteNote] = useState('');
  const [teamValidation, setTeamValidation] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState({ firstUid: '', secondUid: '', thirdUid: '' });
  const [roomDetails, setRoomDetails] = useState({ roomId: '', roomPassword: '' });
  const [roomMatchTime, setRoomMatchTime] = useState('');
  const [roomNotice, setRoomNotice] = useState('');
  const [participantsNotice, setParticipantsNotice] = useState('');
  const [participantsPage, setParticipantsPage] = useState(0);
  const [roomSaving, setRoomSaving] = useState(false);
  const [timingSaving, setTimingSaving] = useState(false);
  const [resultNotice, setResultNotice] = useState('');
  const [deleteNotice, setDeleteNotice] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const isController = user?.role === 'CONTROLLER';
  const { data = [], loading, error, refresh } = useAsync(() => (isController ? getControllerMatches() : getMatches()), [isController]);
  const scheduledMatches = Array.isArray(data) ? data : [];

  const matches = useMemo(
    () => scheduledMatches.filter((m) => {
      if (type === 'ALL') return true;
      return m.gameType === type && (!variant || m.variant === variant);
    }),
    [scheduledMatches, type, variant]
  );
  const participantByUid = useMemo(() => new Map(participants.map((participant) => [participant.uid, participant])), [participants]);

  const resetJoinModal = () => {
    setSelectedJoinMatch(null);
    setJoinMode('');
    setTeamName('');
    setPlayerUids([]);
    setInviteNote('');
    setTeamValidation(null);
    setJoinNotice('');
    setJoinLoading(false);
    setValidationLoading(false);
  };

  const openJoinModal = (match) => {
    if (Number(match.seatsLeft || 0) <= 0) {
      setNotice('Seat full');
      return;
    }
    setSelectedJoinMatch(match);
    setJoinMode(match.teamOnly ? 'team' : '');
    setTeamName('');
    setPlayerUids(Array(Math.max(0, getTeamSize(match.variant) - 1)).fill(''));
    setInviteNote('');
    setTeamValidation(null);
    setJoinNotice('');
  };

  const closeJoinModal = () => resetJoinModal();

  const openRoomEditor = (match) => {
    setSelectedRoomMatch(match);
    setRoomDetails({ roomId: match.roomId || '', roomPassword: match.roomPassword || '' });
    setRoomMatchTime(toDateTimeLocal(match.matchTime));
    setRoomNotice('');
    setRoomSaving(false);
    setTimingSaving(false);
  };

  const closeRoomEditor = () => {
    setSelectedRoomMatch(null);
    setRoomDetails({ roomId: '', roomPassword: '' });
    setRoomMatchTime('');
    setRoomNotice('');
    setRoomSaving(false);
    setTimingSaving(false);
  };

  const submitMatchTime = async () => {
    if (!selectedRoomMatch) return;
    if (!roomMatchTime) {
      setRoomNotice('Choose a match start time before saving.');
      return;
    }

    setTimingSaving(true);
    setRoomNotice('');
    try {
      const response = await saveMatchTiming(selectedRoomMatch.id, {
        matchTime: new Date(roomMatchTime).toISOString(),
      });
      setRoomNotice(response.message);
      refresh();
    } catch (err) {
      setRoomNotice(err.message);
    } finally {
      setTimingSaving(false);
    }
  };

  const submitRoomDetails = async () => {
    if (!selectedRoomMatch) return;
    if (!roomDetails.roomId.trim() || !roomDetails.roomPassword.trim()) {
      setRoomNotice('Enter both room ID and password.');
      return;
    }

    setRoomSaving(true);
    setRoomNotice('');
    try {
      const response = await saveMatchRoomDetails(selectedRoomMatch.id, {
        roomId: roomDetails.roomId.trim(),
        roomPassword: roomDetails.roomPassword.trim(),
      });
      setRoomNotice(response.message);
      refresh();
      setTimeout(closeRoomEditor, 1200);
    } catch (err) {
      setRoomNotice(err.message);
    } finally {
      setRoomSaving(false);
    }
  };

  const join = async (id) => {
    if (!user) {
      setNotice('Login as a player before registering for a match.');
      return;
    }
    try {
      const res = await joinMatch(id);
      setNotice(res.message);
      refresh();
      return true;
    } catch (err) {
      setNotice(err.message);
      return false;
    }
  };

  const validateTeam = async () => {
    if (!selectedJoinMatch) return;
    if (!teamName.trim()) {
      setJoinNotice('Please enter a team name.');
      return;
    }
    const missing = playerUids.filter((uid) => !uid.trim());
    if (missing.length) {
      setJoinNotice('Enter every player UID separately before validation.');
      return;
    }
    setValidationLoading(true);
    setJoinNotice('');
    try {
      const response = await validateTeamJoin({
        matchId: selectedJoinMatch.id,
        teamName: teamName.trim(),
        playerUids: playerUids.map((uid) => uid.trim()),
        confirm: false,
        note: inviteNote.trim(),
      });
      setTeamValidation(response);
      setJoinNotice(response.message);
    } catch (err) {
      setJoinNotice(err.message);
      setTeamValidation(null);
    } finally {
      setValidationLoading(false);
    }
  };

  const submitTeam = async () => {
    if (!selectedJoinMatch) return;
    if (!teamValidation || !teamValidation.valid) {
      setJoinNotice('Validate team members before confirming registration.');
      return;
    }
    setJoinLoading(true);
    setJoinNotice('');
    try {
      const response = await joinTeam({
        matchId: selectedJoinMatch.id,
        teamName: teamName.trim(),
        playerUids: playerUids.map((uid) => uid.trim()),
        confirm: false,
        note: inviteNote.trim(),
      });
      setJoinNotice(response.message);
      refresh();
      setTimeout(closeJoinModal, 1400);
    } catch (err) {
      setJoinNotice(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const openResultEditor = async (match) => {
    setSelectedResultMatch(match);
    setResultNotice('');
    setSelectedPositions({ firstUid: '', secondUid: '', thirdUid: '' });
    setLoadingParticipants(true);
    try {
      const data = await getMatchParticipants(match.id);
      setParticipants(data);
    } catch (err) {
      setResultNotice(err.message);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openParticipantsViewer = async (match) => {
    setSelectedParticipantsMatch(match);
    setParticipants([]);
    setParticipantsPage(0);
    setParticipantsNotice('');
    setLoadingParticipants(true);
    try {
      const data = await getMatchParticipants(match.id);
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      setParticipantsNotice(err.message);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const closeParticipantsViewer = () => {
    setSelectedParticipantsMatch(null);
    setParticipants([]);
    setParticipantsPage(0);
    setParticipantsNotice('');
  };

  const closeResultEditor = () => {
    setSelectedResultMatch(null);
    setParticipants([]);
    setSelectedPositions({ firstUid: '', secondUid: '', thirdUid: '' });
    setResultNotice('');
  };

  const openDeleteConfirm = (match) => {
    setSelectedDeleteMatch(match);
    setDeleteNotice('');
    setDeleteSaving(false);
  };

  const closeDeleteConfirm = () => {
    setSelectedDeleteMatch(null);
    setDeleteNotice('');
    setDeleteSaving(false);
  };

  const confirmDeleteMatch = async () => {
    if (!selectedDeleteMatch) return;
    setDeleteSaving(true);
    setDeleteNotice('');
    try {
      const response = await deleteControllerMatch(selectedDeleteMatch.id);
      setNotice(response.message || 'Match deleted successfully.');
      closeDeleteConfirm();
      refresh();
    } catch (err) {
      setDeleteNotice(err.message);
    } finally {
      setDeleteSaving(false);
    }
  };

  const setPosition = (position, player) => {
    const entryKey = resultEntryKey(player);
    setSelectedPositions((current) => {
      const next = { ...current };
      Object.entries(current).forEach(([key, selectedUid]) => {
        const selectedPlayer = participantByUid.get(selectedUid);
        if (selectedPlayer && resultEntryKey(selectedPlayer) === entryKey) {
          next[key] = '';
        }
      });
      if (current[position] !== player.uid) {
        next[position] = player.uid;
      }
      return next;
    });
  };

  const submitResults = async () => {
    if (!selectedResultMatch) return;
    const winnerOnly = usesWinnerOnlyResult(selectedResultMatch);
    if (!selectedPositions.firstUid || (!winnerOnly && (!selectedPositions.secondUid || !selectedPositions.thirdUid))) {
      setResultNotice(winnerOnly ? 'Please select the winner before submitting.' : 'Please select first, second, and third places before submitting.');
      return;
    }
    const resultPayload = winnerOnly
      ? { ...selectedPositions, secondUid: '', thirdUid: '' }
      : selectedPositions;
    const selectedPlayers = [resultPayload.firstUid, resultPayload.secondUid, resultPayload.thirdUid]
      .filter(Boolean)
      .map((uid) => participantByUid.get(uid));
    if (new Set(selectedPlayers.map(resultEntryKey)).size < selectedPlayers.length) {
      setResultNotice('One team or player can only be selected for one prize position.');
      return;
    }
    try {
      await submitMatchResults({ matchId: selectedResultMatch.id, ...resultPayload });
      setResultNotice('Match results recorded successfully. Winnings and points have been awarded.');
      refresh();
      setTimeout(closeResultEditor, 1200);
    } catch (err) {
      setResultNotice(err.message);
    }
  };

  const groupedParticipants = participants.reduce((groups, participant) => {
    const team = participant.teamName || 'Solo';
    if (!groups[team]) groups[team] = [];
    groups[team].push(participant);
    return groups;
  }, {});

  const selectedMatchTeamSize = selectedJoinMatch ? getTeamSize(selectedJoinMatch.variant) : 1;
  const queueFilled = selectedJoinMatch && selectedMatchTeamSize > 1
    ? (selectedJoinMatch.currentParticipants || 0) % selectedMatchTeamSize
    : selectedJoinMatch?.currentParticipants || 0;
  const queueDisplay = selectedMatchTeamSize > 1 && queueFilled === 0 && (selectedJoinMatch?.currentParticipants || 0) > 0
    ? selectedMatchTeamSize
    : queueFilled;
  const activeResultPositions = usesWinnerOnlyResult(selectedResultMatch) ? winnerOnlyPositions : resultPositions;
  const registeredRows = selectedParticipantsMatch ? participants.slice(participantsPage * 8, participantsPage * 8 + 8) : [];
  const registeredTotalPages = selectedParticipantsMatch ? Math.ceil(participants.length / 8) : 0;

  return (
    <main className="hero-grid min-h-screen bg-bg px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gold">EliteGrindLeague Matches</p>
              <h1 className="mt-2 text-3xl font-black">Register for scheduled rooms</h1>
              <p className="mt-2 text-sm text-secondary">Matches created by controllers appear here as cards. Wallet balance is checked when you join.</p>
            </div>
            {!user && <Link className="btn-primary" to="/login">Player Login</Link>}
          </div>
        </header>

       <section className="panel">

  {/* GAME MODE */}
  <div className="w-full overflow-hidden">
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
      Game Mode
    </p>

    <div className="flex w-full flex-wrap gap-2 overflow-hidden">

      {Object.keys(groups).map((g) => (
        <button
          key={g}
          onClick={() => {
            setType(g);
            setVariant('');
          }}
          className={`max-w-full rounded-2xl px-3 py-3 text-[11px] font-bold transition-all sm:px-4 sm:text-xs ${
            type === g ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          {labels[g]}
        </button>
      ))}

    </div>
  </div>

  {/* VARIANTS */}
  {type !== 'ALL' && (
    <div className="mt-5 w-full overflow-hidden">

      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        Match Variant
      </p>

      <div className="flex w-full flex-wrap gap-2 overflow-hidden">

        <button
          onClick={() => setVariant('')}
          className={`max-w-full rounded-2xl px-3 py-3 text-[11px] font-bold transition-all sm:px-4 sm:text-xs ${
            !variant ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          All Variants
        </button>

        {groups[type].map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={`max-w-full rounded-2xl px-3 py-3 text-[11px] font-bold transition-all sm:px-4 sm:text-xs ${
              variant === v ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            {v.replaceAll('_', ' ')}
          </button>
        ))}

      </div>
    </div>
  )}
</section>

        <Alert type={error ? 'error' : 'info'}>{notice}</Alert>
        {error && <Alert type="error">Could not load scheduled matches from server. Showing match modes for now.</Alert>}

        {loading ? (
          <section className="panel text-center text-secondary">Loading scheduled matches...</section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onJoin={() => openJoinModal(match)}
                onProgressClick={isController ? openParticipantsViewer : undefined}
                detailsContent={isController ? <ControllerRoomDetails match={match} /> : undefined}
                footerContent={isController ? (
                  <div className="mt-4 grid gap-2">
                    <button className="btn-primary w-full" type="button" onClick={() => openRoomEditor(match)}>
                      Room ID & Password
                    </button>
                    <button className="btn-ghost w-full" type="button" onClick={() => openResultEditor(match)}>
                      Update Result
                    </button>
                    <button
                      className="btn-ghost w-full border-red-500/40 text-red-200 hover:border-red-400 hover:bg-red-500/10"
                      type="button"
                      onClick={() => openDeleteConfirm(match)}
                    >
                      DELETE MATCH
                    </button>
                  </div>
                ) : undefined}
              />
            ))}
          </section>
        )}

        {!loading && !matches.length && (
          <section className="panel text-center">
            <p className="text-lg font-black">Matches will be live soon</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-secondary">
              Once a Controller schedules a match, it will appear here as a card under All Matches, BR, CS, or Lone Wolf.
            </p>
            {user && ['CONTROLLER', 'MASTER_CONTROLLER', 'ADMIN'].includes(user.role) && <Link className="btn-primary mt-4" to="/controller">Create Match</Link>}
          </section>
        )}
      </div>

      {selectedJoinMatch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-4 sm:px-4 sm:py-6">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-card p-4 text-white shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gold">Match Registration</p>
                <h2 className="mt-2 text-2xl font-black">{selectedJoinMatch.title}</h2>
                <p className="text-sm text-slate-400">{selectedJoinMatch.gameType.replaceAll('_', ' ')} · {selectedJoinMatch.variant.replaceAll('_', ' ')}</p>
              </div>
              <button className="btn-ghost" type="button" onClick={closeJoinModal}>Close</button>
            </div>

            <div className="mt-5 space-y-5">
              <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-300">
                <div className="rounded-2xl bg-bg/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Entry</p>
                  <p className="mt-2 text-lg font-black">₹{selectedJoinMatch.entryFee}</p>
                </div>
                <div className="rounded-2xl bg-bg/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Registration</p>
                  <p className="mt-2 font-black">{selectedJoinMatch.teamOnly ? 'With team invites' : 'Open registration'}</p>
                </div>
              </div>
              {!selectedJoinMatch.teamOnly && (
                <div className="space-y-4 rounded-3xl bg-bg/80 p-5">
                  <div>
                    <p className="font-semibold">Register without team</p>
                    <p className="mt-1 text-sm text-slate-400">
                      No player UID is required here. Your own UID is registered and the entry fee is deducted from your wallet.
                    </p>
                  </div>
                  {selectedMatchTeamSize > 1 && (
                    <div className="rounded-2xl bg-card p-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <span>Open squad progress</span>
                        <b>{queueDisplay}/{selectedMatchTeamSize}</b>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gold"
                          style={{ width: `${selectedMatchTeamSize ? Math.min(100, (queueDisplay * 100) / selectedMatchTeamSize) : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={async () => {
                      if (await join(selectedJoinMatch.id)) {
                        closeJoinModal();
                      }
                    }}
                  >
                    Register
                  </button>
                </div>
              )}

              {(joinMode === 'team' || selectedJoinMatch.teamOnly) && (
                <div className="space-y-4 rounded-3xl bg-bg/80 p-5">
                  <p className="font-semibold">Team invite registration</p>
                  <p className="text-sm text-slate-400">
                    Enter the team name and the other {Math.max(1, selectedMatchTeamSize - 1)} player UID{selectedMatchTeamSize - 1 === 1 ? '' : 's'}.
                    They will receive the request in Matching Friends.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-sm text-slate-300">
                      Team name
                      <input
                        className="input mt-2"
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value);
                          setTeamValidation(null);
                        }}
                        placeholder="Team name"
                      />
                    </label>
                    <label className="block text-sm text-slate-300">
                      Team size
                      <div className="mt-2 rounded-2xl bg-bg/90 p-3 text-sm text-slate-400">
                        You + {Math.max(1, selectedMatchTeamSize - 1)} invited player{selectedMatchTeamSize - 1 === 1 ? '' : 's'}
                      </div>
                    </label>
                  </div>
                  <div className="grid gap-3">
                    {playerUids.map((uid, index) => (
                      <input
                        key={index}
                        className="input"
                        value={uid}
                        onChange={(e) => {
                          const next = [...playerUids];
                          next[index] = e.target.value;
                          setPlayerUids(next);
                          setTeamValidation(null);
                        }}
                        placeholder={`Other player ${index + 1} UID`}
                      />
                    ))}
                  </div>
                  <textarea
                    className="input min-h-20 resize-y"
                    maxLength={240}
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder="Optional short note for invited players"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-primary" type="button" onClick={validateTeam} disabled={validationLoading}>
                      {validationLoading ? 'Validating…' : 'Verify Team UIDs'}
                    </button>
                    {teamValidation?.valid && (
                      <button className="rounded-full border border-gold/50 bg-gold px-5 py-3 text-sm font-black text-bg shadow-lg shadow-gold/20 transition hover:-translate-y-0.5 hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" type="button" onClick={submitTeam} disabled={joinLoading}>
                        {joinLoading ? 'Sending...' : 'Send invite requests'}
                      </button>
                    )}
                  </div>
                  {joinNotice && <p className="text-sm text-slate-300">{joinNotice}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRoomMatch && isController && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-4 sm:px-4 sm:py-6">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-4 text-white shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gold">Room Access</p>
                <h2 className="mt-2 text-2xl font-black">{selectedRoomMatch.title}</h2>
                <p className="text-sm text-slate-400">{selectedRoomMatch.gameType.replaceAll('_', ' ')} Â· {selectedRoomMatch.variant.replaceAll('_', ' ')}</p>
              </div>
              <button className="btn-ghost" type="button" onClick={closeRoomEditor}>Close</button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm text-slate-300">
                Match start time
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="input"
                    type="datetime-local"
                    value={roomMatchTime}
                    onChange={(e) => setRoomMatchTime(e.target.value)}
                  />
                  <button className="btn-ghost" type="button" onClick={submitMatchTime} disabled={timingSaving}>
                    {timingSaving ? 'Saving...' : 'Save Time'}
                  </button>
                </div>
              </label>
              <label className="block text-sm text-slate-300">
                Room ID
                <input
                  className="input mt-2"
                  value={roomDetails.roomId}
                  onChange={(e) => setRoomDetails({ ...roomDetails, roomId: e.target.value })}
                  placeholder="Enter room ID"
                  maxLength={80}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  className="input mt-2"
                  value={roomDetails.roomPassword}
                  onChange={(e) => setRoomDetails({ ...roomDetails, roomPassword: e.target.value })}
                  placeholder="Enter room password"
                  maxLength={80}
                />
              </label>
              <div className="rounded-2xl bg-bg/80 p-4 text-sm text-secondary">
                Registered players for this match will receive these details in their upcoming match card and notification center.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button className="btn-primary" type="button" onClick={submitRoomDetails} disabled={roomSaving}>
                  {roomSaving ? 'Sending...' : 'Send to Registered Players'}
                </button>
                {roomNotice && <p className="text-sm text-slate-300">{roomNotice}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedParticipantsMatch && isController && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-4 sm:px-4 sm:py-6">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-card p-4 text-white shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gold">Registered Players</p>
                <h2 className="mt-2 text-2xl font-black">{selectedParticipantsMatch.title}</h2>
                <p className="text-sm text-slate-400">{participants.length} registered · Showing 8 per page</p>
              </div>
              <button className="btn-ghost" type="button" onClick={closeParticipantsViewer}>Close</button>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-bg/70">
              <div className="grid grid-cols-[1fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                <span>Name</span>
                <span>Gaming UID</span>
              </div>
              {loadingParticipants ? (
                <p className="p-5 text-center text-sm text-secondary">Loading registered players...</p>
              ) : registeredRows.length ? (
                <div className="divide-y divide-white/10">
                  {registeredRows.map((player) => (
                    <div key={`${player.userId}-${player.uid}`} className="grid grid-cols-[1fr_1fr] gap-3 px-4 py-3 text-sm">
                      <span className="font-semibold text-white">{player.username}</span>
                      <span className="break-words text-slate-300">{player.uid}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-center text-sm text-secondary">No players registered yet.</p>
              )}
            </div>

            {participantsNotice && <p className="mt-4 text-sm text-red-200">{participantsNotice}</p>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
              <button
                className="btn-ghost px-3 py-1.5"
                type="button"
                disabled={participantsPage <= 0}
                onClick={() => setParticipantsPage((page) => Math.max(0, page - 1))}
              >
                Prev
              </button>
              <span>Page {registeredTotalPages ? participantsPage + 1 : 1} / {Math.max(registeredTotalPages, 1)}</span>
              <button
                className="btn-ghost px-3 py-1.5"
                type="button"
                disabled={!registeredTotalPages || participantsPage + 1 >= registeredTotalPages}
                onClick={() => setParticipantsPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDeleteMatch && isController && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-4 sm:px-4 sm:py-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-4 text-white shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-red-200">Delete Match</p>
                <h2 className="mt-2 text-2xl font-black">{selectedDeleteMatch.title}</h2>
              </div>
              <button className="btn-ghost" type="button" onClick={closeDeleteConfirm} disabled={deleteSaving}>Close</button>
            </div>
            <p className="mt-5 text-slate-300">Are you sure you want to delete this match?</p>
            <div className="mt-5 rounded-2xl bg-bg/80 p-4 text-sm text-secondary">
              Registered players will be removed from this match. If any entry fee was deducted, it will be refunded by the backend.
            </div>
            {deleteNotice && <p className="mt-4 text-sm text-red-200">{deleteNotice}</p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="btn-ghost" type="button" onClick={closeDeleteConfirm} disabled={deleteSaving}>
                Cancel
              </button>
              <button
                className="btn-primary bg-red-600 hover:bg-red-500"
                type="button"
                onClick={confirmDeleteMatch}
                disabled={deleteSaving}
              >
                {deleteSaving ? 'Deleting...' : 'DELETE MATCH'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedResultMatch && isController && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-4 sm:px-4 sm:py-6">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-card p-4 text-white shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gold">Match Results</p>
                <h2 className="mt-2 text-2xl font-black">{selectedResultMatch.title}</h2>
                <p className="text-sm text-slate-400">{selectedResultMatch.gameType.replaceAll('_', ' ')} · {selectedResultMatch.variant.replaceAll('_', ' ')}</p>
              </div>
              <button className="btn-ghost" type="button" onClick={closeResultEditor}>Close</button>
            </div>

            <div className="mt-5 space-y-4">
              <div className={`grid gap-3 ${usesWinnerOnlyResult(selectedResultMatch) ? '' : 'md:grid-cols-3'}`}>
                <div className="rounded-2xl bg-bg/80 p-4 text-sm">
                  <p className="text-slate-400">{usesWinnerOnlyResult(selectedResultMatch) ? 'Winner prize' : '1st prize'}</p>
                  <p className="mt-2 text-lg font-black">₹{selectedResultMatch.firstReward}</p>
                </div>
                {!usesWinnerOnlyResult(selectedResultMatch) && (
                  <>
                    <div className="rounded-2xl bg-bg/80 p-4 text-sm">
                      <p className="text-slate-400">2nd prize</p>
                      <p className="mt-2 text-lg font-black">₹{selectedResultMatch.secondReward}</p>
                    </div>
                    <div className="rounded-2xl bg-bg/80 p-4 text-sm">
                      <p className="text-slate-400">3rd prize</p>
                      <p className="mt-2 text-lg font-black">₹{selectedResultMatch.thirdReward}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-bg/80 p-4 text-sm">
                  <p className="text-slate-400">Register before</p>
                  <p className="mt-2 font-black">{when(selectedResultMatch.registerBefore)}</p>
                </div>
                <div className="rounded-2xl bg-bg/80 p-4 text-sm">
                  <p className="text-slate-400">Match time</p>
                  <p className="mt-2 font-black">{when(selectedResultMatch.matchTime)}</p>
                </div>
              </div>

              {loadingParticipants ? (
                <section className="rounded-3xl bg-bg/80 p-6 text-center text-sm text-secondary">Loading participants...</section>
              ) : (
                <div className="space-y-4">
                  {participants.length ? (
                    Object.entries(groupedParticipants).map(([teamName, players]) => (
                      <div key={teamName} className="rounded-3xl border border-white/10 bg-bg/70 p-4">
                        <p className="text-sm font-bold text-white">Team: {teamName}</p>
                        <div className="mt-4 space-y-3">
                          {players.map((player) => (
                            <div key={player.uid} className="grid gap-3 rounded-2xl bg-card p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                              <div>
                                <p className="font-semibold">{player.username}</p>
                                <p className="text-sm text-slate-400">Gaming UID: {player.uid}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm">
                                {activeResultPositions.map(({ key, label }) => {
                                  const entryKey = resultEntryKey(player);
                                  const selectedEntryPosition = activeResultPositions.find(({ key: selectedKey }) => {
                                    const selectedPlayer = participantByUid.get(selectedPositions[selectedKey]);
                                    return selectedPlayer && resultEntryKey(selectedPlayer) === entryKey;
                                  })?.key;
                                  const selectedHere = selectedEntryPosition === key;
                                  const selectedElsewhere = selectedEntryPosition && selectedEntryPosition !== key;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      className={`rounded-full px-3 py-2 text-xs ${selectedHere ? 'bg-primary text-white' : selectedElsewhere ? 'bg-white/10 text-slate-500' : 'bg-white/5 text-slate-300'}`}
                                      onClick={() => setPosition(key, player)}
                                      title={selectedElsewhere ? 'Move this team/player to this position' : undefined}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <section className="rounded-3xl bg-bg/80 p-6 text-center text-sm text-secondary">No participants registered for this match yet.</section>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button className="btn-primary" type="button" onClick={submitResults}>Submit Results</button>
                {resultNotice && <p className="text-sm text-slate-300">{resultNotice}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}