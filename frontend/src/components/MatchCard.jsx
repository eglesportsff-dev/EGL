import { money, when } from '../utils/format';

export default function MatchCard({
  match,
  onJoin,
  actionLabel,
  onAction,
  actionDisabled,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionDisabled,
  detailsContent,
  footerContent,
  onProgressClick,
}) {
  const actionText = actionLabel || (match.registrationOpen ? (match.teamOnly ? 'Register With Team' : 'Register') : 'Registration Closed');
  const seatsFull = Number(match.seatsLeft || 0) <= 0;
  const disabled = actionDisabled ?? (!match.registrationOpen || seatsFull);
  const usesWinnerOnly = match.gameType === 'CLASH_SQUAD' || match.gameType === 'LONE_WOLF';
  const isLive = match.active && match.matchTime && new Date(match.matchTime) <= new Date();

  return (
    <article className="panel bg-gradient-to-br from-card to-bg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-ember">{match.gameType.replaceAll('_', ' ')} - {match.variant.replaceAll('_', ' ')}</p>
            {isLive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {isLive && (
              <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">
                Live
              </span>
            )}
          </div>
          <h3 className="mt-1 text-lg font-black">{match.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{when(match.matchTime)}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{match.teamOnly ? 'Team invite registration' : 'Open registration'}</p>
        </div>
        <span className="shrink-0 rounded-xl bg-primary/10 px-2 py-1 text-xs text-gold">{match.roomSize} slots</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <span className="rounded-xl bg-bg/80 p-2">Entry <b>{money(match.entryFee)}</b></span>
        <span className="rounded-xl bg-bg/80 p-2">{usesWinnerOnly ? 'Winner' : '1st'} <b>{money(match.firstReward)}</b></span>
        {!usesWinnerOnly && (
          <>
            <span className="rounded-xl bg-bg/80 p-2">2nd <b>{money(match.secondReward)}</b></span>
            <span className="rounded-xl bg-bg/80 p-2">3rd <b>{money(match.thirdReward)}</b></span>
          </>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        <div
          className={`rounded-3xl bg-bg/80 p-3 text-sm text-slate-400 ${onProgressClick ? 'cursor-pointer transition hover:bg-bg' : ''}`}
          onClick={() => onProgressClick?.(match)}
          role={onProgressClick ? 'button' : undefined}
          tabIndex={onProgressClick ? 0 : undefined}
          onKeyDown={(event) => {
            if (onProgressClick && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onProgressClick(match);
            }
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span>Joined</span>
            <span>{match.currentParticipants || 0}/{match.roomSize}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gold"
              style={{
                width: `${match.roomSize ? Math.min(100, ((match.currentParticipants || 0) * 100) / match.roomSize).toFixed(0) : 0}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>{match.seatsLeft || 0} slots left</span>
            {match.pendingInvites > 0 && <span>{match.pendingInvites} invite pending</span>}
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
          <span className="rounded-xl bg-bg/80 p-2">Register by <b>{when(match.registerBefore)}</b></span>
          <span className="rounded-xl bg-bg/80 p-2">Match time <b>{when(match.matchTime)}</b></span>
        </div>
      </div>

      {detailsContent}
      {footerContent || (
        <div className="mt-4 grid gap-2">
          <button className="btn-primary w-full" disabled={disabled} onClick={() => (onAction ? onAction(match) : onJoin?.(match.id))}>
            {seatsFull ? 'Seat full' : actionText}
          </button>
          {secondaryActionLabel && (
            <button className="btn-ghost w-full" disabled={secondaryActionDisabled} onClick={() => onSecondaryAction?.(match)}>
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
