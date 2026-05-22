import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import { createMatch, getControllerOverview } from '../services/tournamentService';


const gameModes = [
  { value: 'BATTLE_ROYALE', label: 'BR Mode' },
  { value: 'CLASH_SQUAD', label: 'CS Mode' },
  { value: 'LONE_WOLF', label: 'Lone Wolf Mode' },
];

const variantOptions = {
  withoutTeam: {
    BATTLE_ROYALE: [
      { value: 'BR_SOLO', label: 'Solo BR' },
      { value: 'BR_DUO', label: 'Duo BR' },
      { value: 'BR_SQUAD', label: 'Squad BR' },
    ],
    CLASH_SQUAD: [
      { value: 'CS_SQUAD', label: 'CS Squad' },
    ],
    LONE_WOLF: [
      { value: 'LONE_WOLF_1V1', label: '1v1 Lone Wolf' },
      { value: 'LONE_WOLF_2V2', label: '2v2 Lone Wolf' },
    ],
  },
  withTeam: {
    BATTLE_ROYALE: [
      { value: 'BR_DUO', label: 'BR Duo' },
      { value: 'BR_SQUAD', label: 'BR Squad' },
    ],
    CLASH_SQUAD: [
      { value: 'CS_SQUAD', label: 'CS Squad' },
    ],
    LONE_WOLF: [
      { value: 'LONE_WOLF_2V2', label: '2v2 Lone Wolf' },
    ],
  },
};

const winnerOnlyVariants = new Set(['CS_SQUAD', 'LONE_WOLF_1V1', 'LONE_WOLF_2V2']);

const fixedRoomSizeForVariant = (value) => {
  if (value === 'CS_SQUAD') return 8;
  if (value === 'LONE_WOLF_1V1') return 2;
  if (value === 'LONE_WOLF_2V2') return 4;
  return null;
};

const defaultRoomSizeForVariant = (value) => {
  const fixedRoomSize = fixedRoomSizeForVariant(value);
  if (fixedRoomSize) return fixedRoomSize;
  if (value === 'BR_DUO') return 24;
  if (value === 'BR_SQUAD') return 48;
  return 8;
};

export default function ControllerPanel() {
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState('idle');
  const [teamType, setTeamType] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [variant, setVariant] = useState(null);
  const [overview, setOverview] = useState({
    activeMatches: 0,
    matchesManaged: 0,
    totalRegistrations: 0,
    totalTeams: 0,
    upcomingMatches: 0,
  });
  const [match, setMatch] = useState({
    title: '',
    entryFee: 0,
    firstReward: 0,
    secondReward: 0,
    thirdReward: 0,
    roomSize: 0,
    matchTime: '',
    registerBefore: '',
  });

  const resetFlow = () => {
    setStage('idle');
    setTeamType(null);
    setGameMode(null);
    setVariant(null);
    setMatch({
      title: '',
      entryFee: 0,
      firstReward: 0,
      secondReward: 0,
      thirdReward: 0,
      roomSize: 0,
      matchTime: '',
      registerBefore: '',
    });
    setMessage('');
  };

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getControllerOverview();
        setOverview({
          activeMatches: data.activeMatches || 0,
          matchesManaged: data.matchesManaged || 0,
          totalRegistrations: data.totalRegistrations || 0,
          totalTeams: data.totalTeams || 0,
          upcomingMatches: data.upcomingMatches || 0,
        });
      } catch (err) {
        // ignore overview load failures for now
      }
    };

    loadOverview();
  }, []);

  const chooseTeamType = (type) => {
    setTeamType(type);
    setStage('mode');
    setGameMode(null);
    setVariant(null);
  };

  const chooseGameMode = (mode) => {
    setGameMode(mode);
    setStage('variant');
    setVariant(null);
  };

  const chooseVariant = (value) => {
    const usesWinnerOnly = winnerOnlyVariants.has(value);
    setVariant(value);
    setStage('details');
    setMatch((current) => ({
      ...current,
      entryFee: current.entryFee || 0,
      firstReward: current.firstReward || 0,
      secondReward: usesWinnerOnly ? 0 : current.secondReward || 0,
      thirdReward: usesWinnerOnly ? 0 : current.thirdReward || 0,
      roomSize: defaultRoomSizeForVariant(value),
    }));
  };

  const saveMatch = async (event) => {
    event.preventDefault();
    const usesWinnerOnly = winnerOnlyVariants.has(variant);
    const fixedRoomSize = fixedRoomSizeForVariant(variant);
    try {
      await createMatch({
        title: match.title,
        gameType: gameMode,
        variant,
        entryFee: Number(match.entryFee),
        firstReward: Number(match.firstReward),
        secondReward: usesWinnerOnly ? 0 : Number(match.secondReward),
        thirdReward: usesWinnerOnly ? 0 : Number(match.thirdReward),
        roomSize: fixedRoomSize || Number(match.roomSize),
        matchTime: match.matchTime ? new Date(match.matchTime).toISOString() : null,
        registerBefore: new Date(match.registerBefore).toISOString(),
        teamOnly: teamType === 'withTeam',
      });
      setMessage('Match created successfully.');
      resetFlow();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const modeLabel = gameModes.find((mode) => mode.value === gameMode)?.label || 'Select a game mode';
  const activeVariants = teamType && gameMode ? variantOptions[teamType][gameMode] : [];
  const usesWinnerOnly = winnerOnlyVariants.has(variant);

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Controller Console</p>
        <h1 className="mt-2 text-3xl font-black">Create and schedule matches</h1>
      </section>
      <section className="grid gap-3 sm:grid-cols-5">
        <StatCard label="Active Matches" value={overview.activeMatches} />
        <StatCard label="Matches Managed" value={overview.matchesManaged} />
        <StatCard label="Registrations" value={overview.totalRegistrations} />
        <StatCard label="Teams" value={overview.totalTeams} />
        <StatCard label="Upcoming Matches" value={overview.upcomingMatches} />
      </section>

      <section className="panel space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-gold">Create Match</p>
            <h2 className="mt-2 text-xl font-black">Choose match type</h2>
          </div>
          <button className="btn-primary" type="button" onClick={resetFlow}>
            Start over
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`btn ${teamType === 'withoutTeam' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => chooseTeamType('withoutTeam')}
          >
            Without Team
          </button>
          <button
            type="button"
            className={`btn ${teamType === 'withTeam' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => chooseTeamType('withTeam')}
          >
            With Team
          </button>
        </div>

        {stage !== 'idle' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-secondary">Step 2: Choose game mode</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {gameModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={`btn ${gameMode === mode.value ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => chooseGameMode(mode.value)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {stage === 'variant' && (
              <div>
                <p className="text-sm text-secondary">Step 3: Pick match variant for {modeLabel}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {activeVariants.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`btn ${variant === option.value ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => chooseVariant(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stage === 'details' && (
              <form className="grid gap-3 md:grid-cols-2" onSubmit={saveMatch}>
                <h2 className="md:col-span-2 text-xl font-black">Enter match details</h2>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-secondary">Selected match:</p>
                  <p className="font-semibold">{teamType === 'withTeam' ? 'Team' : 'Solo'} / {modeLabel} / {variant}</p>
                </div>
                <input
                  className="input"
                  placeholder="Match title"
                  value={match.title}
                  onChange={(e) => setMatch({ ...match, title: e.target.value })}
                  required
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Entry fee"
                  min="0"
                  value={match.entryFee}
                  onChange={(e) => setMatch({ ...match, entryFee: e.target.value })}
                  required
                />
                <input
                  className="input"
                  type="number"
                  placeholder={usesWinnerOnly ? 'Winner prize amount' : '1st prize amount'}
                  min="0"
                  value={match.firstReward}
                  onChange={(e) => setMatch({ ...match, firstReward: e.target.value })}
                  required
                />
                {!usesWinnerOnly && (
                  <>
                    <input
                      className="input"
                      type="number"
                      placeholder="2nd prize amount"
                      min="0"
                      value={match.secondReward}
                      onChange={(e) => setMatch({ ...match, secondReward: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="3rd prize amount"
                      min="0"
                      value={match.thirdReward}
                      onChange={(e) => setMatch({ ...match, thirdReward: e.target.value })}
                      required
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Room size"
                      min="2"
                      value={match.roomSize}
                      onChange={(e) => setMatch({ ...match, roomSize: e.target.value })}
                      required
                    />
                  </>
                )}
                <input
                  className="input"
                  type="datetime-local"
                  placeholder="Register before"
                  value={match.registerBefore}
                  onChange={(e) => setMatch({ ...match, registerBefore: e.target.value })}
                  required
                />
                <input
                  className="input"
                  type="datetime-local"
                  placeholder="Match start time"
                  value={match.matchTime}
                  onChange={(e) => setMatch({ ...match, matchTime: e.target.value })}
                />
                <button className="btn-primary md:col-span-2" type="submit">
                  Create {variant?.replace('_', ' ')} Match
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      <Alert>{message}</Alert>
    </div>
  );
}
