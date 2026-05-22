import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/egl-logo.jpeg';


export default function Landing() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const modes = [
    ['BR Solo', 'Battle individually in competitive BR custom rooms.'],
    ['BR Duo', 'Play duo matches with your teammate.'],
    ['BR Squad', 'Compete in intense full squad tournaments.'],
    ['CS Full Team', 'Play Clash Squad with your registered team.'],
    ['CS Random Team', 'Get random teammates and compete instantly.'],
    ['CS Without Team', 'Join Clash Squad rooms without a team.'],
    ['Lone Wolf 1v1', 'Pure skill-based solo room battles.'],
    ['Lone Wolf 2v2', 'Fast-paced duo Lone Wolf gameplay.'],
  ];

  const features = [
    ['UID Search', 'Search players instantly using UID or player name.'],
    ['Friend System', 'Make friends and build your esports squad.'],
    ['Secure Chat', 'Chat safely with teammates and active players.'],
    ['Live Notifications', 'Receive room updates and tournament alerts instantly.'],
  ];

  const rules = [
    'UID cannot be changed after registration.',
    'Leaderboard resets every 20 days like a new season.',
    'BR winning team receives 8x entry fee rewards.',
    'BR second position receives 6x entry rewards.',
    'BR third position receives 3x entry rewards.',
    'CS ₹20 entry matches provide ₹30+ payout rewards.',
    'Prize pools depend on tournament collections after maintenance.',
    'Tournament cycles happen every 20 days.',
    'Entry fees and rewards may change after official launch.',
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black text-white antialiased">

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="EGL"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              EGL <span className="text-purple-500">eSports</span>
            </h1>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 text-sm sm:text-base font-semibold text-gray-400 md:flex">
            <a href="#tournament" className="transition hover:text-white">Tournament</a>
            <a href="#leaderboard" className="transition hover:text-white">Leaderboard</a>
            <Link to="/matches" className="transition hover:text-white">Matches</Link>
            <a href="#about" className="transition hover:text-white">About</a>
          </nav>

          {/* DESKTOP CTA BUTTONS */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold transition hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-bold transition hover:opacity-90"
            >
              Register
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MOBILE DROPDOWN NAVIGATION */}
        {mobileMenu && (
          <div className="border-t border-white/10 bg-black md:hidden">
            <div className="flex flex-col gap-4 px-4 py-6 text-base font-semibold">
              <a href="#tournament" className="py-1" onClick={() => setMobileMenu(false)}>Tournament</a>
              <a href="#leaderboard" className="py-1" onClick={() => setMobileMenu(false)}>Leaderboard</a>
              <Link to="/matches" className="py-1" onClick={() => setMobileMenu(false)}>Matches</Link>
              <a href="#about" className="py-1" onClick={() => setMobileMenu(false)}>About</a>
              <hr className="border-white/10 my-1" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-bold" onClick={() => setMobileMenu(false)}>
                  Login
                </Link>
                <Link to="/register" className="rounded-xl bg-purple-600 py-2.5 text-center text-sm font-bold" onClick={() => setMobileMenu(false)}>
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400 tracking-wide">
          ● EliteGrindLeague · Now Live
        </div>

        <h1 className="mt-6 max-w-4xl text-3xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl tracking-tight">
          EliteGrindLeague{' '}
          <span className="block sm:inline bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Elite Esports Players
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base md:text-lg">
          Join tournaments, climb team leaderboards, manage wallet entries, and dominate BR, Clash Squad, and Lone Wolf rooms.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">
          <Link to="/register" className="rounded-xl bg-purple-600 px-8 py-3.5 text-base font-bold text-center transition hover:opacity-90">
            Start Playing
          </Link>
          <Link to="/matches" className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-bold text-center transition hover:bg-white/10">
            View Tournaments
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400">
            About EliteGrindLeague
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
            Competitive Free Fire eSports Platform
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400 sm:text-lg">
            EliteGrindLeague is a competitive Free Fire esports platform where players can participate in tournaments, climb live leaderboards, make friends, use secure chatting, receive live notifications, and compete in controller-managed custom rooms.
          </p>
        </div>
      </section>

      {/* TOURNAMENT MODES SECTION */}
      <section id="tournament" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400">
            Tournament Modes
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            Multiple Competitive Modes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modes.map(([title, desc]) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-purple-500/40 flex flex-col justify-center"
            >
              <h3 className="text-lg font-black text-purple-400 sm:text-xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section id="leaderboard" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400">
            Leaderboard
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            Live Tournament Rankings
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Top 20', 'Tournament Qualification'],
            ['₹65,000+', 'BR Prize Pool'],
            ['₹28,800+', 'CS Prize Pool'],
            ['Live', 'Winning Point Updates'],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <h3 className="text-3xl font-black text-purple-400 tracking-tight sm:text-4xl">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY FEATURES SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400">
            Community
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            Matchmaking & Friends
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, desc]) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <h3 className="text-lg font-black text-purple-400 sm:text-xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* RULES SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[3px] text-purple-400">
            Rules & Conditions
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            Important Platform Rules
          </h2>
        </div>

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-full bg-purple-600 text-sm font-black">
                {index + 1}
              </div>
              <p className="pt-1.5 text-sm sm:text-base leading-relaxed text-gray-300">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 sm:pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center max-w-5xl mx-auto sm:p-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Start Competing Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-lg text-gray-400 leading-relaxed">
            Join EliteGrindLeague and compete with top Free Fire players in competitive custom room battles.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4 max-w-xs sm:max-w-md mx-auto">
            <Link
              to="/register"
              className="rounded-xl bg-purple-600 px-8 py-3.5 text-base font-bold text-center transition hover:opacity-90 shadow-lg shadow-purple-600/20"
            >
              Join Elite Players
            </Link>
            <Link
              to="/matches"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-bold text-center transition hover:bg-white/10"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
          
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="EGL"
                className="h-11 w-11 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  EGL <span className="text-purple-500">eSports</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Competitive Free Fire Platform
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              EliteGrindLeague is built for esports players who want tournaments, matchmaking, rankings, chatting, and a professional gaming environment.
            </p>
          </div>

          <div>
            <h3 className="text-base font-black text-purple-400 tracking-tight">
              Quick Links
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-gray-400">
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="#tournament" className="hover:text-white transition">Tournament</a>
              <a href="#leaderboard" className="hover:text-white transition">Leaderboard</a>
              <Link to="/matches" className="hover:text-white transition">Matches</Link>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-purple-400 tracking-tight">
              Features
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-gray-400">
              <p>Real-time Notifications</p>
              <p>Secure Player Chat</p>
              <p>UID Search System</p>
              <p>Wallet Integration</p>
              <p>Matchmaking Support</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-purple-400 tracking-tight">
              Support
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-gray-400">
              <p>Controller Managed Rooms</p>
              <p>Live Match Assistance</p>
              <p>Help Support System</p>
              <p>Room ID Notifications</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-xs sm:text-sm text-gray-500 md:flex-row sm:px-6 lg:px-8">
            <p>© 2026 EliteGrindLeague eSports. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="#leaderboard" className="hover:text-white transition">Leaderboard</a>
              <a href="#tournament" className="hover:text-white transition">Tournament</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}