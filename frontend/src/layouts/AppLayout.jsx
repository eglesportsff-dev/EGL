import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getNotifications } from '../services/tournamentService';
import logo from '../assets/egl-logo.jpeg';
import {
  LayoutDashboard,
  Swords,
  Calendar,
  Users,
  MessageSquare,
  Radio,
  Mail,
  Wallet,
  Trophy,
  User as UserIcon,
  HelpCircle,
  Gift,
  Shield,
  CheckSquare,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Matches', '/matches'],
  ['Upcoming Matches', '/upcoming-matches'],
  ['Matching Friends', '/matching-friends'],
  ['Community Chat', '/community-chat'],
  ['Active Players', '/active-players'],
  ['Messages', '/messages'],
  ['Wallet', '/wallet'],
  ['Leaderboard', '/leaderboard'],
  ['Profile', '/profile'],
  ['Help Centre', '/help'],
  ['Refer & Earn', '/refer-earn'],
];

const iconMap = {
  Dashboard: LayoutDashboard,
  Matches: Swords,
  'Upcoming Matches': Calendar,
  'Matching Friends': Users,
  'Community Chat': MessageSquare,
  'Active Players': Radio,
  Messages: Mail,
  Wallet: Wallet,
  Leaderboard: Trophy,
  Profile: UserIcon,
  'Help Centre': HelpCircle,
  'Refer & Earn': Gift,
  Players: Users,
  Controllers: Shield,
  'Master Controllers': Trophy,
  Admin: Shield,
  Master: Shield,
  Control: Swords,
  'Pending Deposits': Wallet,
  'Pending Withdraws': Wallet,
  'Pending Review': CheckSquare,
  "Today's Reviewed": CheckCircle2,
  'Total Reviews': FileText,
};

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17H9m9-1.5c-1.2-1.1-1.8-2.5-1.8-4.2V9a4.2 4.2 0 0 0-8.4 0v2.3c0 1.7-.6 3.1-1.8 4.2-.5.5-.2 1.5.6 1.5h10.8c.8 0 1.1-1 .6-1.5ZM10.4 20a1.8 1.8 0 0 0 3.2 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleNav = user?.role === 'ADMIN'
    ? [['Players', '/admin/players'], ['Controllers', '/admin/controllers'], ['Master Controllers', '/admin/masters'], ['Community Chat', '/community-chat'], ['Admin', '/admin']]
    : user?.role === 'MASTER_CONTROLLER'
      ? [['Controllers', '/master/controllers'], ['Matches', '/master/matches'], ['Pending Deposits', '/master/deposits'], ['Pending Withdraws', '/master/withdraws'], ['Community Chat', '/community-chat'], ['Help Centre', '/master/help'], ['Master', '/master']]
      : user?.role === 'CONTROLLER'
        ? [['Matches', '/matches'], ['Control', '/controller'], ['Pending Review', '/controller/reviews/pending'], ["Today's Reviewed", '/controller/reviews/today'], ['Total Reviews', '/controller/reviews/total'], ['Community Chat', '/community-chat']]
    : nav;

  useEffect(() => {
    const loadUnread = () => {
      if (user?.role !== 'USER') {
        setUnreadCount(0);
        return;
      }
      getNotifications()
        .then((data) => setUnreadCount(Number(data?.unreadCount || 0)))
        .catch(() => setUnreadCount(0));
    };

    const loadMessageUnread = () => {
      if (!user) {
        setMessageUnreadCount(0);
        return;
      }
      getConversations()
        .then((data) => {
          if (!Array.isArray(data)) {
            setMessageUnreadCount(0);
            return;
          }
          setMessageUnreadCount(data.filter((conv) => conv.hasUnread).length);
        })
        .catch(() => setMessageUnreadCount(0));
    };

    loadUnread();
    loadMessageUnread();
    window.addEventListener('notifications:read', loadUnread);
    return () => window.removeEventListener('notifications:read', loadUnread);
  }, [user?.role, user?.email, user]);

  useEffect(() => {
    if (user?.role !== 'USER') return;
    
    const updateActivity = () => {
      sessionStorage.setItem('lastActivity', new Date().toISOString());
    };

    const interval = setInterval(updateActivity, 30000);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [user?.role]);

  const signOut = () => {
    setSidebarOpen(false);
    logout();
    navigate('/login');
  };

  const navContent = (
    <>
      <NavLink to="/" className="group flex items-center gap-3 px-2 py-1 font-black text-white" onClick={() => setSidebarOpen(false)}>
        <div className="relative">
          <img className="h-11 w-11 rounded-xl object-cover ring-2 ring-fire-500/50 shadow-glow-fire transition group-hover:scale-105" src={logo} alt="EGL eSports" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-fire-500 text-[9px] text-white">🔥</span>
        </div>
        <div>
          <div className="flex items-center gap-1 leading-none">
            <span className="text-base tracking-tight font-black">EGL</span>
            <span className="text-base font-black text-fire-500">eSports</span>
          </div>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-amber-400/90">Free Fire Arena</span>
        </div>
      </NavLink>

      <div className="mt-6 mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Tournament Menu
      </div>

      <nav className="grid gap-1.5 text-sm">
        {visibleNav.map(([label, to], index) => {
          const Icon = iconMap[label] || LayoutDashboard;
          return (
            <NavLink
              key={`${label}-${index}`}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-fire-500/25 via-amber-500/15 to-transparent text-white border-l-[3px] border-fire-500 shadow-glow-fire pl-3'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-fire-400' : 'text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                  {label === 'Messages' && messageUnreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-fire-500 px-2 py-0.5 text-[10px] font-black text-white shadow-glow-fire">
                      {Math.min(messageUnreadCount, 9)}+
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-fire-400 shadow-[0_0_8px_#ff5e14]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-arena lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-white/10 bg-[#080B14]/95 px-4 py-5 backdrop-blur-md lg:block">
        {navContent}
      </aside>

      <div className={`mobile-sidebar-shell lg:hidden ${sidebarOpen ? 'is-open' : ''}`} aria-hidden={!sidebarOpen}>
        <button
          className="mobile-sidebar-overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="mobile-sidebar-drawer relative h-full overflow-y-auto border-r border-white/10 bg-[#080B14] px-4 py-5 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Free Fire Menu</span>
            <button className="btn-ghost h-10 w-10 p-0" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className="mt-4">{navContent}</div>
        </aside>
      </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080B14]/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button className="btn-ghost h-10 w-10 p-0 lg:hidden" type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 font-black text-white lg:hidden">
              <img className="h-8 w-8 rounded-lg object-cover ring-1 ring-fire-500/40" src={logo} alt="EGL eSports" />
              <span className="truncate">EGL <span className="text-fire-500">eSports</span></span>
            </div>

            {/* Desktop Center Live Badge */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-fire-500/25 bg-fire-500/10 px-3.5 py-1 text-xs font-bold text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide">FREE FIRE eSPORTS CIRCUIT</span>
              <span className="text-fire-400 font-black">• LIVE</span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3 text-xs text-slate-300">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-fire-500 to-amber-400 text-[10px] font-black text-black">
                  {user?.username?.charAt(0)?.toUpperCase() || 'P'}
                </span>
                <span className="font-bold text-white">{user?.username}</span>
                <span className="rounded bg-fire-500/20 px-1.5 py-0.5 text-[10px] font-bold text-fire-400 border border-fire-500/30">
                  {user?.role || 'PLAYER'}
                </span>
              </div>

              {user?.role === 'USER' && (
                <NavLink
                  to="/notifications"
                  aria-label="Notification centre"
                  title="Notification centre"
                  className={({ isActive }) => `relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    isActive
                      ? 'border-fire-500 bg-fire-500/20 text-fire-400 shadow-glow-fire'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-fire-500/50 hover:bg-fire-500/10'
                  }`}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-fire-500 px-1.5 py-0.5 text-center text-[10px] font-black leading-4 text-white shadow-glow-fire">
                      {Math.min(unreadCount, 12)}
                    </span>
                  )}
                </NavLink>
              )}

              <button 
                className="btn-ghost px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition" 
                onClick={signOut}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="hero-grid mx-auto min-h-[calc(100vh-64px)] w-full max-w-[96rem] px-4 py-5 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
