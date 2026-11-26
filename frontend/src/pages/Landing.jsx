import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/nexus-logo.jpg';
import ffBrMode from '../assets/ff-br-mode.jpg';
import ffCsMode from '../assets/ff-cs-mode.jpg';
import ff1vs1 from '../assets/ff-1vs1.jpg';
import ffChampions from '../assets/ff-champions.jpg';
import ffGameplay from '../assets/ff-gameplay.jpg';
import ffTelegramBadge from '../assets/ff-telegram-badge.svg';
import telegramQr from '../assets/telegram-qr.png';
import {
  Menu,
  X,
  Flame,
  Swords,
  Trophy,
  Shield,
  Zap,
  Users,
  Target,
  ChevronRight,
  ExternalLink,
  Send,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Wallet,
  Play
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showQrDrawer, setShowQrDrawer] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const modes = [
    {
      title: 'Battle Royale (BR)',
      badge: '🔥 8X REWARDS',
      variant: 'SOLO / DUO / SQUAD',
      slots: '48 SURVIVORS',
      image: ffBrMode,
      glowBorder: 'hover:border-fire-500/50 hover:shadow-glow-fire',
      badgeColor: 'bg-fire-500/15 border-fire-500/30 text-fire-400',
      tag: 'Survival Room',
      desc: 'Drop on Bermuda & Purgatory. Secure airdrop loot, master your Gloo Walls, and survive against 48 players for the 8x Booyah prize.',
      linkText: 'JOIN BR ROOMS →',
    },
    {
      title: 'Clash Squad (CS 4v4)',
      badge: '⚡ 4v4 SQUAD',
      variant: 'FAST 7-ROUNDS',
      slots: 'TEAM & RANDOM QUEUES',
      image: ffCsMode,
      glowBorder: 'hover:border-cyan-500/50 hover:shadow-glow-cyber',
      badgeColor: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      tag: 'Tactical Combat',
      desc: 'Intense 4v4 tactical warfare. Buy weapons each round, coordinate with your squad, wipe out the enemy, and take the prize.',
      linkText: 'JOIN CLASH SQUAD →',
    },
    {
      title: 'Lone Wolf (1v1 / 2v2)',
      badge: '👑 1V1 / 2V2 DUEL',
      variant: 'IRON CAGE',
      slots: 'HEADSHOT ARENA',
      image: ff1vs1,
      glowBorder: 'hover:border-yellow-500/50 hover:shadow-glow-booyah',
      badgeColor: 'bg-yellow-400/15 border-yellow-400/30 text-yellow-300',
      tag: 'Head-to-Head Duel',
      desc: 'Prove your pure 1v1 gun power, instant Gloo Wall reflexes, and one-tap headshots without third-party interference.',
      linkText: 'CHALLENGE 1V1 →',
    },
  ];

  const stats = [
    { value: '₹65,000+', label: 'Prize Pool Distributed', icon: Trophy, color: 'text-amber-400' },
    { value: '8x Multiplier', label: '1st Booyah! Reward Scale', icon: Flame, color: 'text-fire-400' },
    { value: '48 Players', label: 'Custom Room Capacity', icon: Users, color: 'text-cyan-400' },
    { value: '20 Days', label: 'Championship Season Cycles', icon: Shield, color: 'text-emerald-400' },
  ];

  const rules = [
    { title: 'Free Fire Game UID', desc: 'UID cannot be changed after registration. Must match your in-game profile.' },
    { title: '8x Booyah Multiplier', desc: '1st place in Battle Royale takes 8x entry fee, 2nd gets 6x, and 3rd gets 3x.' },
    { title: 'Room ID & Password Drops', desc: 'Room credentials drop 15 minutes prior to match time via Dashboard and Telegram.' },
    { title: 'Fair Play & Anti-Cheat', desc: 'Emulators and third-party scripts are strictly forbidden. Accounts undergo review.' },
    { title: 'Instant Wallet Payouts', desc: 'Winning points are credited immediately after match results are confirmed.' },
    { title: '20-Day Season Resets', desc: 'Leaderboard rankings reset every 20 days with qualification for Major Finals.' },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#070B1A] text-white antialiased">
      {/* 1. HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B1A]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="Nexus eSports"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover border border-fire-500/40 shadow-glow-fire transition duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fire-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-fire-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">Nexus</span>
                <span className="bg-gradient-to-r from-amber-400 via-fire-500 to-red-500 bg-clip-text text-transparent text-lg sm:text-xl font-black">
                  eSports
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-fire-400 -mt-0.5">
                Free Fire Arena
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-xs sm:text-sm font-bold text-slate-300 md:flex">
            <a href="#modes" className="transition hover:text-fire-400">Game Modes</a>
            <a href="#telegram" className="transition hover:text-cyan-400 flex items-center gap-1">
              <Send className="h-3.5 w-3.5 text-cyan-400" />
              <span>Telegram Channel</span>
            </a>
            <a href="#stats" className="transition hover:text-amber-400">Prizes & Stats</a>
            <a href="#rules" className="transition hover:text-fire-400">Rules</a>
            <Link to="/matches" className="transition hover:text-white text-fire-400 font-extrabold flex items-center gap-1">
              <span>View Matches</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              Player Login
            </Link>
            <Link
              to="/register"
              className="btn-fire px-5 py-2 text-xs sm:text-sm font-black shadow-glow-fire active:scale-95"
            >
              Enter Arena
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenu && (
          <div className="border-t border-white/10 bg-[#0A0E1A] px-4 py-5 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-bold">
              <a href="#modes" className="py-2 text-slate-200 hover:text-fire-400" onClick={() => setMobileMenu(false)}>
                ⚔️ Game Modes
              </a>
              <a href="#telegram" className="py-2 text-cyan-300 hover:text-cyan-200" onClick={() => setMobileMenu(false)}>
                ✈️ Official Telegram Channel
              </a>
              <a href="#stats" className="py-2 text-slate-200 hover:text-amber-400" onClick={() => setMobileMenu(false)}>
                🏆 Prize Pools & Stats
              </a>
              <a href="#rules" className="py-2 text-slate-200 hover:text-fire-400" onClick={() => setMobileMenu(false)}>
                📜 Rules & Conditions
              </a>
              <Link to="/matches" className="py-2 text-fire-400 font-extrabold" onClick={() => setMobileMenu(false)}>
                🔥 View Scheduled Rooms →
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <Link
                  to="/login"
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-xs font-bold"
                  onClick={() => setMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-fire py-2.5 text-center text-xs font-black"
                  onClick={() => setMobileMenu(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. FREE FIRE ESPORTS HERO SECTION */}
      <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[90%] max-w-4xl rounded-full bg-gradient-to-b from-fire-500/20 via-amber-500/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-fire-600/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-12">

            {/* Left Hero Content */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-6">
              {/* Circuit Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-fire-500/30 bg-fire-500/15 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 shadow-glow-fire">
                <span className="flex h-2 w-2 rounded-full bg-fire-500 animate-ping" />
                <Flame className="h-4 w-4 text-fire-400" />
                <span>Free Fire MAX • Official eSports Hub</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
                BECOME THE NEXT{' '}
                <span className="bg-gradient-to-r from-amber-400 via-fire-500 to-red-500 bg-clip-text text-transparent">
                  BOOYAH! CHAMPION
                </span>
              </h1>

              {/* Subtext */}
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg lg:mx-0">
                Compete in daily Battle Royale, 4v4 Clash Squad, and 1v1 Lone Wolf custom rooms. Climb season rankings, secure room slots, and win instant cash rewards.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="btn-fire w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-black shadow-glow-fire active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Playing Now</span>
                </Link>
                <Link
                  to="/matches"
                  className="btn-ghost-fire w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold active:scale-95"
                >
                  <span>View Scheduled Rooms</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Quick 4-Step Player Guide */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
                  <span className="text-[10px] font-black text-fire-400 block uppercase">1. Register</span>
                  <span className="text-xs font-bold text-slate-200">Enter FF UID</span>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
                  <span className="text-[10px] font-black text-amber-400 block uppercase">2. Select Mode</span>
                  <span className="text-xs font-bold text-slate-200">BR, CS, or 1v1</span>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
                  <span className="text-[10px] font-black text-cyan-400 block uppercase">3. Room Drop</span>
                  <span className="text-xs font-bold text-slate-200">Instant ID & Pass</span>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/5 p-2.5">
                  <span className="text-[10px] font-black text-emerald-400 block uppercase">4. Win Cash</span>
                  <span className="text-xs font-bold text-slate-200">Instant Payouts</span>
                </div>
              </div>
            </div>

            {/* Right Hero Artwork Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Outer Glow Card */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-fire-500/40 bg-gradient-to-b from-[#170E08] via-[#0E1528] to-[#080D1A] p-3 shadow-glow-fire">

                  {/* Hero Showcase Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
                    <img
                      src={ffChampions}
                      alt="Free Fire Champions"
                      className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-black/30 to-transparent" />

                    {/* Live Match Badge */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[11px] font-black uppercase text-amber-300 border border-fire-500/50">
                      <span className="h-2 w-2 rounded-full bg-fire-500 animate-ping" />
                      <span>Season 2026 Live</span>
                    </div>

                    <div className="absolute top-3 right-3 rounded-full bg-fire-500 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-glow-fire">
                      8x Booyah!
                    </div>

                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs font-extrabold text-white">
                      <span className="rounded bg-black/70 backdrop-blur-sm px-2.5 py-1 border border-white/10 text-amber-300">
                        Top Survivor Podium
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Automated Payouts
                      </span>
                    </div>
                  </div>

                  {/* Stat Highlights beneath artwork */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                    <div className="rounded-xl bg-black/60 border border-white/5 p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Prize Pool</p>
                      <p className="text-sm sm:text-base font-black text-amber-400 font-mono">₹65,000+</p>
                    </div>
                    <div className="rounded-xl bg-black/60 border border-white/5 p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Custom Rooms</p>
                      <p className="text-sm sm:text-base font-black text-white font-mono">48 Slots</p>
                    </div>
                    <div className="rounded-xl bg-black/60 border border-white/5 p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Booyah Reward</p>
                      <p className="text-sm sm:text-base font-black text-fire-400 font-mono">8x Multi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. DEDICATED GAME MODES SHOWCASE WITH CLEAN 16:9 ARTWORK */}
      <section id="modes" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-fire-500/15 border border-fire-500/30 px-3 py-1 text-xs font-black uppercase text-fire-400">
            <Swords className="h-3.5 w-3.5" />
            <span>Official Game Modes</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Choose Your <span className="bg-gradient-to-r from-amber-400 via-fire-500 to-red-500 bg-clip-text text-transparent">Battleground</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Play with your friends, invite your squad, or enter solo. High-resolution gameplay with instant custom room distribution.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {modes.map((mode) => (
            <Link
              key={mode.title}
              to="/matches"
              className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1220] transition-all duration-300 hover:-translate-y-1.5 ${mode.glowBorder}`}
            >
              {/* Clean 16:9 Image Container - Zero Badges Over Artwork */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070A12]">
                <img
                  src={mode.image}
                  alt={mode.title}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0C1220] to-transparent" />
              </div>

              {/* Card Content & Metadata */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {mode.variant}
                    </span>
                  </div>

                  {/* Title & Tag */}
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
                      {mode.title}
                    </h3>
                    <span className="text-[11px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      {mode.tag}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-5 flex items-center justify-between text-xs font-bold border-t border-white/10 pt-3">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {mode.slots}
                  </span>
                  <span className="flex items-center gap-1 text-fire-400 font-extrabold group-hover:translate-x-1 transition text-xs sm:text-sm">
                    {mode.linkText}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. OFFICIAL TELEGRAM CHANNEL HIGHLIGHT (WITH QR SCANNER) */}
      <section id="telegram" className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-r from-[#081B2B] via-[#0B1524] to-[#070D18] p-6 sm:p-8 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/3 opacity-15 hidden md:block">
            <img src={ffGameplay} alt="Gameplay background" className="h-full w-full object-cover" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={ffTelegramBadge}
                alt="Telegram"
                className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-sky-400 border border-sky-500/30 uppercase">
                    Official Match Alerts
                  </span>
                  <span className="text-xs text-slate-400">• Free Fire Updates</span>
                </div>
                <h3 className="mt-1.5 text-lg sm:text-2xl font-black text-white">
                  Join the Official Nexus Free Fire Telegram Channel
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Get instant Room ID drops, password alerts, bracket schedules, and live tournament announcements on <b className="text-sky-300 font-mono">Nexus Telegram Channel</b>!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://t.me/+qgPNUKGt9m5mOTZl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] transition hover:brightness-110 active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>Join Telegram Channel</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                onClick={() => setShowQrDrawer(!showQrDrawer)}
                title="Scan QR code with your phone"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300 hover:bg-sky-500/20 transition active:scale-95"
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR</span>
              </button>
            </div>
          </div>

          {/* Expandable QR Drawer */}
          {showQrDrawer && (
            <div className="relative mt-6 pt-5 border-t border-sky-500/20 flex flex-col sm:flex-row items-center gap-5 bg-black/50 rounded-2xl p-4 sm:p-5">
              <img
                src={telegramQr}
                alt="Scan to join Nexus on Telegram"
                className="h-36 w-36 rounded-xl border-2 border-sky-500/40 shadow-glow bg-white p-1"
              />
              <div className="text-center sm:text-left space-y-1">
                <p className="text-base font-black text-white">Scan with phone camera</p>
                <p className="text-xs sm:text-sm text-slate-300">
                  Instantly opens the <b>Nexus Free Fire</b> channel invite on your phone Telegram app.
                </p>
                <a
                  href="https://t.me/+qgPNUKGt9m5mOTZl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-sky-400 font-mono font-bold hover:underline inline-block mt-1"
                >
                  Join Nexus Telegram →
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. STATS & LEADERBOARD PRIZE HIGHLIGHTS */}
      <section id="stats" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase text-amber-300">
            <Trophy className="h-3.5 w-3.5" />
            <span>Season 2026 Rankings</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Transparent <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Prize Distribution</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Winning points update live after every match. Qualify for major events and climb the national leaderboards.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-[#0C1220] p-5 text-center transition hover:border-fire-500/30"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {stat.value}
                </h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. RULES & FAIR PLAY SECTION */}
      <section id="rules" className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#0C1220] p-6 sm:p-10 lg:p-12 shadow-glow-card">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-fire-400">
              Fair Play Guaranteed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Rules & Regulations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every room is controller-monitored to ensure competitive integrity.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#080D1A] p-4 transition hover:border-white/10"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fire-500/15 border border-fire-500/30 text-fire-400 font-mono font-black text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white">{rule.title}</h4>
                  <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-fire-500/30 bg-gradient-to-r from-[#170E08] via-[#0E1528] to-[#070B1A] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-glow-fire">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-fire-500/15 border border-fire-500/30 px-3 py-1 text-xs font-black uppercase text-amber-300 mb-4">
            <Flame className="h-3.5 w-3.5 text-fire-400" />
            <span>Registration Open</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ready to Drop into Bermuda?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed">
            Create your account with your Free Fire UID in under 60 seconds and join today&apos;s active custom rooms!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="btn-fire w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-black shadow-glow-fire active:scale-95"
            >
              Register Player Account
            </Link>
            <Link
              to="/login"
              className="btn-ghost-fire w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold active:scale-95"
            >
              Sign In to Arena
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-white/10 bg-[#050813]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 py-12 sm:px-6 lg:px-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Nexus" className="h-10 w-10 rounded-xl object-cover border border-fire-500/30" />
              <div>
                <h3 className="text-base font-black text-white">
                  Nexus <span className="text-fire-500">eSports</span>
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Free Fire eSports Arena
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s dedicated competitive Free Fire platform. Automated custom rooms, instant wallet distribution, and professional tournament management.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-fire-400">Navigation</h4>
            <div className="mt-3 flex flex-col gap-2 text-xs font-bold text-slate-400">
              <a href="#modes" className="hover:text-white transition">Game Modes</a>
              <a href="#telegram" className="hover:text-white transition">Telegram Channel</a>
              <a href="#stats" className="hover:text-white transition">Prize Structure</a>
              <a href="#rules" className="hover:text-white transition">Rules & Integrity</a>
              <Link to="/matches" className="hover:text-fire-400 transition">Live Match Feed</Link>
            </div>
          </div>

          {/* Col 3: Competitive Modes */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-fire-400">Game Modes</h4>
            <div className="mt-3 flex flex-col gap-2 text-xs font-bold text-slate-400">
              <p>Battle Royale (BR) Solo & Squad</p>
              <p>Clash Squad (CS 4v4) Tactical</p>
              <p>Lone Wolf 1v1 Iron Cage</p>
              <p>Lone Wolf 2v2 Duo Duel</p>
              <p>Custom Room Distribution</p>
            </div>
          </div>

          {/* Col 4: Official Community */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-fire-400">Community</h4>
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              <p className="font-bold text-slate-300">Join our official channel:</p>
              <a
                href="https://t.me/+qgPNUKGt9m5mOTZl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25 transition"
              >
                <Send className="h-3 w-3" />
                <span>Nexus Telegram Channel</span>
              </a>
              <p className="text-[11px] text-slate-500 pt-1">
                Room ID drops & live bracket notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 py-6 text-center text-[11px] text-slate-500">
          <p>© 2026 Nexus eSports. Dedicated to Free Fire eSports.</p>
        </div>
      </footer>
    </main>
  );
}
