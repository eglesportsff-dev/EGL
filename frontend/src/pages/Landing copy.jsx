import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/egl-logo.jpeg';


export default function Landing() {
  const { user } = useAuth();

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
  '1. UID cannot be changed after registration.',
  '2. Leaderboard resets every 20 days like a new season.',
  '3. BR winning team receives 8x entry fee rewards.',
  '4. BR second position receives 6x entry rewards.',
  '5. BR third position receives 3x entry rewards.',
  '6. CS ₹20 entry matches provide ₹30+ payout rewards.',
  '7. Prize pools depend on tournament collections after maintenance.',
  '8. Tournament cycles happen every 20 days.',
  '9. Entry fees and rewards may change after official launch.',
];

  return (
    <main className="min-h-screen overflow-x-hidden bg-bg text-white">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="EGL eSports"
              className="h-12 w-12 rounded-xl2 object-cover shadow-glow"
            />

            <div>
              <h1 className="text-2xl font-black">
                EGL <span className="text-primary">eSports</span>
              </h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-secondary md:flex">
            <a href="#tournament" className="transition hover:text-white">
              Tournament
            </a>

            <a href="#leaderboard" className="transition hover:text-white">
              Leaderboard
            </a>

            <Link to="/matches" className="transition hover:text-white">
              Matches
            </Link>

            <a href="#about" className="transition hover:text-white">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-xl2 border border-white/10 bg-white/5 px-5 py-2 font-semibold text-white transition hover:bg-white/10 sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl2 bg-primary px-5 py-2 font-bold text-white shadow-glow transition hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 text-center">

        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-bold text-primary">
          ● EliteGrindLeague · Now Live
        </div>

        <h1 className="relative z-10 mt-8 max-w-6xl text-5xl font-black leading-tight sm:text-7xl lg:text-8xl">
          EliteGrindLeague
          <br />

          <span className="bg-gradient-to-r from-white via-purple-300 to-primary bg-clip-text text-transparent">
            Elite Esports Players
          </span>
        </h1>

        <p className="relative z-10 mx-auto mt-8 max-w-3xl text-base leading-8 text-secondary sm:text-lg">
          Join tournaments, climb team leaderboards, manage wallet entries,
          and dominate BR, Clash Squad, and Lone Wolf rooms.
        </p>

        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-4">
          
          <Link
            to="/register"
            className="rounded-xl2 bg-primary px-8 py-4 text-lg font-bold text-white shadow-glow transition hover:opacity-90"
          >
            Start Playing
          </Link>

          <Link
            to="/matches"
            className="rounded-xl2 border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            View Tournaments
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-4 py-24"
      >
        <div className="rounded-xl2 border border-white/10 bg-card p-10 shadow-glow">

          <p className="text-sm font-bold uppercase tracking-[4px] text-primary">
            About EliteGrindLeague
          </p>

          <h2 className="mt-5 text-4xl font-black sm:text-5xl">
            Competitive Free Fire eSports Platform
          </h2>

          <p className="mt-6 max-w-4xl text-base leading-8 text-secondary sm:text-lg">
            EliteGrindLeague is a competitive Free Fire esports platform
            where players can participate in tournaments, climb live
            leaderboards, make friends, use secure chatting, receive live
            notifications, and compete in controller-managed custom rooms.
          </p>
        </div>
      </section>

      {/* TOURNAMENT MODES */}
      <section
        id="tournament"
        className="mx-auto max-w-7xl px-4 py-24"
      >
        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-[4px] text-primary">
            Tournament Modes
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Multiple Competitive Modes
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map(([title, desc]) => (
            <article
              key={title}
              className="rounded-xl2 border border-white/10 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <h3 className="text-2xl font-black text-primary">
                {title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-secondary">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section
        id="leaderboard"
        className="mx-auto max-w-7xl px-4 py-24"
      >
        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-[4px] text-primary">
            Leaderboard
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Live Tournament Rankings
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Top 20', 'Tournament Qualification'],
            ['₹65,000+', 'BR Prize Pool'],
            ['₹28,800+', 'CS Prize Pool'],
            ['Live', 'Winning Point Updates'],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-xl2 border border-primary/20 bg-card p-8 text-center shadow-glow"
            >
              <h3 className="text-4xl font-black text-primary">
                {title}
              </h3>

              <p className="mt-3 text-secondary">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL */}
      <section className="mx-auto max-w-7xl px-4 py-24">

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[4px] text-primary">
            Community
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Matchmaking & Friends
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, desc]) => (
            <article
              key={title}
              className="rounded-xl2 border border-white/10 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-glow"
            >
              <h3 className="text-2xl font-black text-primary">
                {title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-secondary">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* RULES */}
      <section className="mx-auto max-w-7xl px-4 py-24">

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[4px] text-primary">
            Rules & Conditions
          </p>

          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Important Platform Rules
          </h2>
        </div>

        <div className="mt-14 grid gap-5">
  {rules.map((rule, index) => (
    <div
      key={index}
      className="group flex items-start gap-4 rounded-xl2 border border-white/10 bg-card p-5 text-secondary shadow-glow transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full bg-primary font-black text-white shadow-glow">
        {index + 1}
      </div>

      <p className="pt-2 text-sm leading-7 sm:text-base">
        {rule.replace(/^\d+\.\s*/, '')}
      </p>
    </div>
  ))}
</div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="rounded-[40px] border border-primary/20 bg-card p-10 text-center shadow-glow">

          <h2 className="text-4xl font-black sm:text-6xl">
            Start Competing Today
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-secondary sm:text-lg">
            Join EliteGrindLeague and compete with top Free Fire players in
            competitive custom room battles.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Link
              to="/register"
              className="rounded-xl2 bg-primary px-8 py-4 text-lg font-bold text-white shadow-glow transition hover:opacity-90"
            >
              Join Elite Players
            </Link>

            <Link
              to="/matches"
              className="rounded-xl2 border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/20">

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">

          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="EGL"
                className="h-14 w-14 rounded-xl2 object-cover shadow-glow"
              />

              <div>
                <h3 className="text-2xl font-black">
                  EGL <span className="text-primary">eSports</span>
                </h3>

                <p className="text-sm text-secondary">
                  Competitive Free Fire Platform
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-secondary">
              EliteGrindLeague is built for esports players who want
              tournaments, matchmaking, rankings, chatting, and a
              professional gaming environment.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-black text-primary">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-secondary">
              <a href="#about">About</a>
              <a href="#tournament">Tournament</a>
              <a href="#leaderboard">Leaderboard</a>
              <Link to="/matches">Matches</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-primary">
              Features
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-secondary">
              <p>Real-time Notifications</p>
              <p>Secure Player Chat</p>
              <p>UID Search System</p>
              <p>Wallet Integration</p>
              <p>Matchmaking Support</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-primary">
              Support
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-secondary">
              <p>Controller Managed Rooms</p>
              <p>Live Match Assistance</p>
              <p>Help Support System</p>
              <p>Room ID Notifications</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-sm text-secondary md:flex-row">

            <p>
              © 2026 EliteGrindLeague eSports. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <a href="#about">About</a>
              <a href="#leaderboard">Leaderboard</a>
              <a href="#tournament">Tournament</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}