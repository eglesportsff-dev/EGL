import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import useAsync from '../hooks/useAsync';
import { getDashboard } from '../services/tournamentService';
import { money, when } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import ffBannerBadge from '../assets/ff-banner-badge.svg';
import ffBrMode from '../assets/ff-br-mode.jpg';
import ffCsMode from '../assets/ff-cs-mode.jpg';
import ff1vs1 from '../assets/ff-1vs1.jpg';
import ffChampions from '../assets/ff-champions.jpg';
import ffGameplay from '../assets/ff-gameplay.jpg';
import ffTrophy from '../assets/ff-trophy.svg';
import ffTelegramBadge from '../assets/ff-telegram-badge.svg';
import eglTelegramQr from '../assets/egl-telegram-qr.jpg';
import {
  Swords,
  Trophy,
  Wallet,
  Calendar,
  Users,
  MessageSquare,
  Flame,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Play,
  Sparkles,
  Zap,
  Send,
  QrCode,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useAsync(getDashboard, []);
  const [copiedUid, setCopiedUid] = useState(false);
  const [showTelegramQr, setShowTelegramQr] = useState(false);

  if (loading) {
    return (
      <div className="screen-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fire-500 border-t-transparent" />
          <p className="text-sm font-bold tracking-wider text-fire-400 uppercase">Entering Free Fire Arena...</p>
        </div>
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  const requestUpdates = Array.isArray(data.requestUpdates) ? data.requestUpdates : [];
  const playerUid = user?.gameUid || user?.uid || 'N/A';

  const copyUidToClipboard = () => {
    if (playerUid && playerUid !== 'N/A') {
      navigator.clipboard?.writeText(playerUid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // Helper to parse links inside tournament update text
  const renderUpdateMessage = (text) => {
    if (!text) return null;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);

    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        const isTelegram = part.includes('t.me') || part.includes('telegram.me');
        const isWhatsApp = part.includes('whatsapp.com');
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-bold transition ml-1 my-0.5 ${isTelegram
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                : isWhatsApp
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-fire-500/20 text-fire-300 border border-fire-500/40 hover:bg-fire-500/30'
              }`}
          >
            {isTelegram && <Send className="h-3 w-3 text-sky-400" />}
            {isWhatsApp && <span className="text-emerald-400">📱</span>}
            <span>{isTelegram ? 'Join Telegram Channel' : isWhatsApp ? 'Join WhatsApp' : 'Visit Link'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. FREE FIRE ESPORTS HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-fire-500/30 bg-gradient-to-r from-[#170E08] via-[#0D1222] to-[#080B14] p-5 sm:p-7 shadow-glow-fire">
        {/* Background Decorative Grid and Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-fire-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            {/* eSports Circuit Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-fire-500/30 bg-fire-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
              <span className="flex h-2 w-2 rounded-full bg-fire-500 animate-ping" />
              <Flame className="h-3.5 w-3.5 text-fire-400" />
              <span>Free Fire MAX • Official eSports Hub</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready for the next <span className="bg-gradient-to-r from-amber-400 via-fire-500 to-red-500 bg-clip-text text-transparent">BOOYAH!</span> ?
            </h1>

            {/* Player Info Strip */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-slate-400">Player:</span>
                <span className="font-extrabold text-white">{user?.username || 'Gamer'}</span>
              </div>

              {playerUid && playerUid !== 'N/A' && (
                <button
                  onClick={copyUidToClipboard}
                  title="Click to copy your Free Fire Game UID"
                  className="flex items-center gap-1.5 rounded-xl bg-fire-500/10 border border-fire-500/30 px-3 py-1.5 font-mono font-bold text-amber-300 transition hover:bg-fire-500/20 active:scale-95"
                >
                  <span className="text-slate-400 font-sans font-normal text-xs">FF UID:</span>
                  <span>{playerUid}</span>
                  {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-fire-400" />}
                </button>
              )}

              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>ARENA READY</span>
              </div>
            </div>
          </div>

          {/* Right Hero Badge Illustration */}
          <div className="hidden sm:flex shrink-0 items-center justify-center">
            <div className="relative group">
              <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-2xl border-2 border-fire-500/50 shadow-glow-fire transition duration-300 group-hover:scale-105">
                <img
                  src={ffChampions}
                  alt="Free Fire Champions"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 inset-x-0 text-center text-[10px] font-black uppercase tracking-wider text-amber-300">
                  TOP SURVIVOR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar for Players */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-bold">
          <Link
            to="/matches"
            className="flex items-center justify-center gap-2 rounded-xl bg-fire-500 px-3 py-2.5 text-white shadow-glow-fire transition hover:brightness-110 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Join Matches</span>
          </Link>
          <Link
            to="/upcoming-matches"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-200 transition hover:border-fire-500/40 hover:bg-white/10 active:scale-95"
          >
            <Calendar className="h-3.5 w-3.5 text-fire-400" />
            <span>Upcoming</span>
          </Link>
          <Link
            to="/wallet"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-200 transition hover:border-amber-400 hover:bg-white/10 active:scale-95"
          >
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
            <span>+ Add Cash</span>
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-200 transition hover:border-yellow-400 hover:bg-white/10 active:scale-95"
          >
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            <span>Leaderboard</span>
          </Link>
          <Link
            to="/matching-friends"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-200 transition hover:border-cyan-400 hover:bg-white/10 active:scale-95"
          >
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Find Teammate</span>
          </Link>
          <Link
            to="/community-chat"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-200 transition hover:border-primary hover:bg-white/10 active:scale-95"
          >
            <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
            <span>Squad Chat</span>
          </Link>
        </div>
      </section>

      {/* 2. ESPORTS STAT CARDS (WITH QUICK ACTIONS) */}
      <section className="grid gap-4 sm:grid-cols-3">
        {/* Wallet Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121A2D] to-[#0A0E18] p-5 shadow-glow-card transition hover:border-fire-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fire-500/15 border border-fire-500/30">
              <Wallet className="h-4 w-4 text-fire-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="text-3xl font-black text-amber-400 font-mono tracking-tight">{money(data.wallet.walletBalance)}</p>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1 rounded-lg bg-fire-500/20 border border-fire-500/40 px-2.5 py-1 text-xs font-bold text-fire-300 hover:bg-fire-500/30 transition active:scale-95"
            >
              <span>+ Add Cash</span>
            </Link>
          </div>
          <p className="mt-2 text-xs text-slate-400">Usable for match entry fees & 1v1 challenges</p>
        </div>

        {/* Winning Points Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171424] to-[#0A0E18] p-5 shadow-glow-card transition hover:border-yellow-400/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Winning Points</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/15 border border-yellow-400/30">
              <Trophy className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="text-3xl font-black text-white font-mono tracking-tight">{money(data.wallet.winningPoints)}</p>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1 rounded-lg bg-yellow-400/15 border border-yellow-400/40 px-2.5 py-1 text-xs font-bold text-yellow-300 hover:bg-yellow-400/25 transition active:scale-95"
            >
              <span>Withdraw</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-2 text-xs text-slate-400">Earned from Booyah! and kills • Withdrawable anytime</p>
        </div>

        {/* Qualification Status Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121A2D] to-[#0A0E18] p-5 shadow-glow-card transition hover:border-cyan-400/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Championship Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 border border-cyan-400/30">
              <Shield className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${data.qualificationStatus === 'Q'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                {data.qualificationStatus === 'Q' ? 'QUALIFIED (Q) 🏆' : 'CONTENDER (NQ)'}
              </span>
            </div>
            {data.teamRank && (
              <span className="text-xs font-bold text-slate-300">Rank #{data.teamRank}</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {data.qualificationStatus === 'Q'
              ? 'Qualified for Major Championship stages!'
              : 'Win tournament matches to qualify for Major Finals'}
          </p>
        </div>
      </section>

      {/* 3. DEDICATED FREE FIRE GAME MODES SHOWCASE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-fire-400" />
              <span>Choose Your Battleground</span>
            </h2>
            <p className="text-xs text-slate-400">Official Free Fire game modes with automated room distribution</p>
          </div>
          <Link
            to="/matches"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-fire-400 hover:text-fire-300 transition"
          >
            <span>View All Matches</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Battle Royale Card */}
          <Link
            to="/matches"
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1220] transition duration-300 hover:-translate-y-1 hover:border-fire-500/50 hover:shadow-glow-fire"
          >
            {/* Clean 16:9 Image Container - Zero Badges Over Artwork */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070A12]">
              <img
                src={ffBrMode}
                alt="Free Fire Battle Royale Mode"
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0C1220] to-transparent" />
            </div>

            {/* Content & Metadata */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-fire-500/15 border border-fire-500/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase text-fire-400">
                    🔥 8X REWARDS
                  </span>
                  <span className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    SOLO / DUO / SQUAD
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Battle Royale (BR)</h3>
                  <span className="text-[11px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Survival Room
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Solo, Duo, and Squad survival matches on Bermuda & Purgatory. Outlast 48 players for Booyah!
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-bold border-t border-white/5 pt-3">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Room Entry Available
                </span>
                <span className="flex items-center gap-1 text-fire-400 font-extrabold group-hover:translate-x-1 transition">
                  PLAY NOW →
                </span>
              </div>
            </div>
          </Link>

          {/* Clash Squad Card */}
          <Link
            to="/matches"
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1220] transition duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-glow-cyber"
          >
            {/* Clean 16:9 Image Container - Zero Badges Over Artwork */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070A12]">
              <img
                src={ffCsMode}
                alt="Free Fire Clash Squad 4v4 Mode"
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0C1220] to-transparent" />
            </div>

            {/* Content & Metadata */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase text-cyan-400">
                    ⚡ 4v4 SQUAD
                  </span>
                  <span className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    FAST 7-ROUNDS
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Clash Squad (CS 4v4)</h3>
                  <span className="text-[11px] font-extrabold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                    Team Battle
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Fast-paced 4v4 tactical combat. Buy weapons each round, wipe out the enemy squad, and take the prize.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-bold border-t border-white/5 pt-3">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  Full & Random Teams
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-extrabold group-hover:translate-x-1 transition">
                  PLAY NOW →
                </span>
              </div>
            </div>
          </Link>

          {/* Lone Wolf Card */}
          <Link
            to="/matches"
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1220] transition duration-300 hover:-translate-y-1 hover:border-yellow-500/50 hover:shadow-glow-booyah"
          >
            {/* Clean 16:9 Image Container - Zero Badges Over Artwork */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070A12]">
              <img
                src={ff1vs1}
                alt="Free Fire Lone Wolf 1v1 Mode"
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0C1220] to-transparent" />
            </div>

            {/* Content & Metadata */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-yellow-400/15 border border-yellow-400/30 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase text-yellow-300">
                    👑 1V1 / 2V2 DUEL
                  </span>
                  <span className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    IRON CAGE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Lone Wolf (1v1 / 2v2)</h3>
                  <span className="text-[11px] font-extrabold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                    Headshot Arena
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Iron Cage 1v1 duel arena. Prove your aim, fast Gloo Walls, and headshot skills without interference.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-bold border-t border-white/5 pt-3">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  Head-to-Head Duel
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-extrabold group-hover:translate-x-1 transition">
                  PLAY NOW →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. OFFICIAL TELEGRAM TOURNAMENT CHANNEL HIGHLIGHT BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-gradient-to-r from-[#081B2B] via-[#0B1524] to-[#070D18] p-5 sm:p-6 shadow-[0_0_25px_rgba(14,165,233,0.18)]">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/3 opacity-15 hidden md:block">
          <img src={ffGameplay} alt="Gameplay background" className="h-full w-full object-cover" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={ffTelegramBadge}
                alt="Telegram"
                className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-[0_0_14px_rgba(14,165,233,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-sky-400 border border-sky-500/30 uppercase">
                  Official Match Alerts
                </span>
                <span className="text-xs text-slate-400">• Free Fire Updates</span>
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-black text-white">
                Join the Official Nexus Free Fire Telegram Channel
              </h3>
              <p className="mt-0.5 text-xs text-slate-300 max-w-2xl">
                Get instant Room ID, Password drops, tournament schedules, and live bracket updates directly on <b className="text-sky-300 font-mono">@EliteGrindeSports</b>!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://t.me/EliteGrindeSports"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] transition hover:brightness-110 active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>Join Telegram Channel</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={() => setShowTelegramQr(!showTelegramQr)}
              title="Show QR Code to scan on mobile"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition active:scale-95"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>
        </div>

        {/* Expandable QR Code Drawer */}
        {showTelegramQr && (
          <div className="relative mt-4 pt-4 border-t border-sky-500/20 flex flex-col sm:flex-row items-center gap-4 bg-black/40 rounded-xl p-4">
            <img
              src={eglTelegramQr}
              alt="Scan to join @EliteGrindeSports on Telegram"
              className="h-32 w-32 rounded-xl border-2 border-sky-500/40 shadow-glow bg-white p-1"
            />
            <div className="text-center sm:text-left space-y-1">
              <p className="text-sm font-black text-white">Scan with phone camera</p>
              <p className="text-xs text-slate-300">
                Directly opens <b>t.me/EliteGrindeSports</b> on your phone Telegram app.
              </p>
              <a
                href="https://t.me/EliteGrindeSports"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-400 font-mono font-bold hover:underline inline-block mt-1"
              >
                t.me/EliteGrindeSports →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 5. WALLET ACTIVITY & TOURNAMENT UPDATES GRID */}
      <section className="grid gap-5 md:grid-cols-2">
        {/* Last Wallet Activity Panel */}
        <div className="panel-esports">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-fire-400" />
              <h2 className="font-black text-white text-base">Last Wallet Activity</h2>
            </div>
            <Link to="/wallet" className="text-xs font-bold text-slate-400 hover:text-white transition">
              View Wallet →
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {data.lastTransactions.map((tx) => {
              const isDebit = Number(tx.amount) < 0 || tx.note?.toLowerCase().includes('entry fee');
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#080D1A]/80 p-3 text-sm transition hover:border-white/15"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDebit ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                      {isDebit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-200 text-xs sm:text-sm">{tx.note}</p>
                      {tx.createdAt && (
                        <p className="text-[10px] text-slate-500">{when(tx.createdAt)}</p>
                      )}
                    </div>
                  </div>
                  <b className={`font-mono font-black text-xs sm:text-sm shrink-0 ${isDebit ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                    {isDebit ? '-' : '+'}{money(Math.abs(tx.amount))}
                  </b>
                </div>
              );
            })}

            {!data.lastTransactions.length && (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No wallet activity yet.</p>
                <Link to="/matches" className="mt-2 inline-block text-fire-400 font-bold hover:underline">
                  Join a match to get started →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Updates Panel */}
        <div className="panel-esports">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h2 className="font-black text-white text-base">Tournament Live Feed</h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-fire-500/15 px-2 py-0.5 text-[10px] font-black text-fire-400">
              <span className="h-1.5 w-1.5 rounded-full bg-fire-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {data.updates.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[#080D1A]/80 p-3 text-sm space-y-1 transition hover:border-white/15"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    {item.title}
                  </span>
                  {item.createdAt && (
                    <span className="text-[10px] text-slate-500">{when(item.createdAt)}</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  {renderUpdateMessage(item.message)}
                </div>
              </div>
            ))}

            {!data.updates.length && (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No tournament announcements at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. REQUEST UPDATES (DEPOSITS & WITHDRAWALS STATUS) */}
      <section className="panel-esports">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h2 className="font-black text-white text-base">Recent Deposit & Withdrawal Requests</h2>
          </div>
          <Link to="/wallet" className="text-xs font-bold text-slate-400 hover:text-white transition">
            Wallet Portal →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {requestUpdates.map((item) => {
            const isApproved = item.status === 'APPROVED' || item.status === 'COMPLETED';
            const isRejected = item.status === 'REJECTED';
            const isForwarded = item.status === 'FORWARDED';

            return (
              <div
                className="rounded-xl border border-white/10 bg-[#080D1A] p-4 text-sm transition hover:border-white/20"
                key={`${item.type}-${item.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">{item.type}</span>
                    <span className="font-mono font-bold text-amber-400">{money(item.amount)}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isRejected
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : isApproved
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isForwarded
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                    {isApproved && <CheckCircle2 className="h-3 w-3" />}
                    {isRejected && <XCircle className="h-3 w-3" />}
                    {!isApproved && !isRejected && <Clock className="h-3 w-3" />}
                    <span>{item.status}</span>
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-300">{item.message}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-2">
                  <span className="font-mono truncate max-w-[200px]">Ref: {item.reference || 'N/A'}</span>
                  <span>{when(item.createdAt)}</span>
                </div>
              </div>
            );
          })}

          {!requestUpdates.length && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              <p>No deposit or withdrawal requests found.</p>
              <Link to="/wallet" className="mt-2 inline-block text-fire-400 font-bold hover:underline">
                Deposit cash or withdraw your winnings in the Wallet →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 7. TOURNAMENT APPLICATION CTA (FOR QUALIFIED PLAYERS) */}
      {data.qualificationStatus === 'Q' && (
        <section className="relative overflow-hidden rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-r from-[#2B1B0A] via-[#1A1422] to-[#0A0D18] p-6 shadow-glow-booyah">
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/3 opacity-25 hidden md:block">
            <img src={ffChampions} alt="Champions Background" className="h-full w-full object-cover object-top" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img src={ffTrophy} alt="Trophy" className="h-16 w-16 shrink-0 drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
              <div>
                <span className="inline-block rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300 border border-yellow-400/40">
                  CHAMPIONSHIP STAGE
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
                  You are Qualified for the Major Tournament!
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                  Congratulations! Your performance qualifies you for the official Free Fire Championship Finals. Confirm your registration now.
                </p>
              </div>
            </div>
            <button className="btn-booyah px-8 py-3.5 text-sm sm:text-base font-black shrink-0">
              Apply for Major Finals 🏆
            </button>
          </div>
        </section>
      )}
    </div>
  );
}