import { money, when } from '../utils/format';
import ffBrMode from '../assets/ff-br-mode.jpg';
import ffCsMode from '../assets/ff-cs-mode.jpg';
import ff1vs1 from '../assets/ff-1vs1.jpg';
import { Trophy, Users, Clock, Flame } from 'lucide-react';

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
  const actionText = actionLabel || (match.registrationOpen ? (match.teamOnly ? 'Register With Team' : 'Register Room') : 'Registration Closed');
  const seatsFull = Number(match.seatsLeft || 0) <= 0;
  const disabled = actionDisabled ?? (!match.registrationOpen || seatsFull);
  const usesWinnerOnly = match.gameType === 'CLASH_SQUAD' || match.gameType === 'LONE_WOLF';
  const isLive = match.active && match.matchTime && new Date(match.matchTime) <= new Date();

  // Select appropriate Free Fire image
  const matchImage = match.gameType === 'BATTLE_ROYALE'
    ? ffBrMode
    : match.gameType === 'CLASH_SQUAD'
      ? ffCsMode
      : ff1vs1;

  const variantLabel = match.variant ? match.variant.replaceAll('_', ' ') : '';
  const gameTypeLabel = match.gameType ? match.gameType.replaceAll('_', ' ') : 'MATCH';

  return (
    <article className="panel-esports overflow-hidden p-0 group border border-white/10 hover:border-fire-500/40 transition-all duration-300">
      {/* TOP IMAGE BANNER - RESPONSIVE 16:9 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/70">
        <img
          src={matchImage}
          alt={match.title}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1120] via-black/40 to-transparent" />

        {/* Mode Badge & Live Indicator */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-fire-500/40 flex items-center gap-1.5 shadow-md">
            <Flame className="h-3 w-3 text-fire-400" />
            <span>{gameTypeLabel}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            )}
            <span className="rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-200 border border-white/10">
              {match.roomSize} SLOTS
            </span>
          </div>
        </div>

        {/* Bottom Overlay on Image: Variant & Queue Type */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] font-bold">
          <span className="rounded bg-fire-500/90 text-white px-2 py-0.5 text-[10px] font-black tracking-wide shadow-sm">
            {variantLabel}
          </span>
          <span className="text-slate-300 drop-shadow-md text-[10px] uppercase tracking-wider">
            {match.teamOnly ? 'Team Invite' : 'Open Registration'}
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 space-y-3.5">
        <div>
          <h3 className="text-base font-black text-white tracking-tight leading-snug line-clamp-1">{match.title}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-fire-400" />
            <span>Match: {when(match.matchTime)}</span>
          </div>
        </div>

        {/* PRIZE POOL & ENTRY FEE GRID */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-[#080D1A] border border-white/5 p-2.5 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Entry Fee</span>
            <span className="mt-1 font-mono font-black text-sm text-amber-400">{money(match.entryFee)}</span>
          </div>
          <div className="rounded-xl bg-[#080D1A] border border-fire-500/20 p-2.5 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-fire-400 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {usesWinnerOnly ? 'Winner Prize' : '1st Booyah!'}
            </span>
            <span className="mt-1 font-mono font-black text-sm text-white">{money(match.firstReward)}</span>
          </div>
          {!usesWinnerOnly && (
            <>
              <div className="rounded-xl bg-[#080D1A] border border-white/5 p-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">2nd Place:</span>
                <b className="font-mono text-slate-200">{money(match.secondReward)}</b>
              </div>
              <div className="rounded-xl bg-[#080D1A] border border-white/5 p-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">3rd Place:</span>
                <b className="font-mono text-slate-200">{money(match.thirdReward)}</b>
              </div>
            </>
          )}
        </div>

        {/* JOINED PROGRESS BAR */}
        <div
          className={`rounded-2xl bg-[#080D1A] border border-white/5 p-3 text-xs text-slate-300 ${onProgressClick ? 'cursor-pointer transition hover:border-fire-500/30' : ''}`}
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
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Users className="h-3.5 w-3.5 text-fire-400" />
              <span>Slots Filled</span>
            </span>
            <span className="font-mono text-white">{match.currentParticipants || 0} / {match.roomSize}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-fire-500 to-red-500 transition-all duration-500"
              style={{
                width: `${match.roomSize ? Math.min(100, ((match.currentParticipants || 0) * 100) / match.roomSize).toFixed(0) : 0}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className={seatsFull ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {seatsFull ? 'House Full' : `${match.seatsLeft || 0} slots remaining`}
            </span>
            {match.pendingInvites > 0 && <span className="text-amber-400">{match.pendingInvites} invite pending</span>}
          </div>
        </div>

        {/* REGISTRATION DEADLINE */}
        <div className="rounded-xl bg-[#080D1A]/50 border border-white/5 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Registration Closes:</span>
          <b className="text-slate-300">{when(match.registerBefore)}</b>
        </div>

        {detailsContent}

        {footerContent || (
          <div className="pt-1">
            <button
              className={`w-full py-2.5 text-xs sm:text-sm font-black tracking-wide rounded-xl transition ${disabled
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'btn-fire shadow-glow-fire hover:brightness-110 active:scale-95'
                }`}
              disabled={disabled}
              onClick={() => (onAction ? onAction(match) : onJoin?.(match.id))}
            >
              {seatsFull ? 'SEATS FULL' : actionText}
            </button>
            {secondaryActionLabel && (
              <button className="btn-ghost w-full mt-2 text-xs" disabled={secondaryActionDisabled} onClick={() => onSecondaryAction?.(match)}>
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}