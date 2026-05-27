import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getNotifications } from '../services/tournamentService';
import logo from '../assets/egl-logo.jpeg';

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
    // Update user activity status in backend periodically
    if (user?.role !== 'USER') return;
    
    const updateActivity = () => {
      // This will be triggered by API calls, but we can add a periodic ping if needed
      sessionStorage.setItem('lastActivity', new Date().toISOString());
    };

    const interval = setInterval(updateActivity, 30000); // Every 30 seconds
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
      <NavLink to="/" className="flex items-center gap-3 px-2 py-1 font-black text-white" onClick={() => setSidebarOpen(false)}>
        <img className="h-11 w-11 rounded-xl object-cover shadow-glow" src={logo} alt="EGL eSports" />
        <span>EGL <span className="text-gold">eSports</span></span>
      </NavLink>
      <nav className="mt-8 grid gap-2 text-sm">
        {visibleNav.map(([label, to], index) => (
          <NavLink
            key={`${label}-${index}`}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `relative rounded-xl px-3 py-3 font-semibold transition ${
              isActive ? 'bg-primary text-white shadow-glow' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            {label}
            {label === 'Messages' && messageUnreadCount > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-bg">
                {Math.min(messageUnreadCount, 9)}+
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-arena lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-white/10 bg-bg/90 px-4 py-5 backdrop-blur lg:block">
        {navContent}
      </aside>

      <div className={`mobile-sidebar-shell lg:hidden ${sidebarOpen ? 'is-open' : ''}`} aria-hidden={!sidebarOpen}>
          <button
            className="mobile-sidebar-overlay"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="mobile-sidebar-drawer relative h-full overflow-y-auto border-r border-white/10 bg-bg px-4 py-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Menu</span>
              <button className="btn-ghost h-10 w-10 p-0" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="mt-4">{navContent}</div>
          </aside>
        </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button className="btn-ghost h-10 w-10 p-0 lg:hidden" type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 font-black text-white lg:hidden">
              <img className="h-8 w-8 rounded-lg object-cover" src={logo} alt="EGL eSports" />
              <span className="truncate">EGL <span className="text-gold">eSports</span></span>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3 text-xs text-slate-300">
              <span className="hidden sm:inline">{user?.username}</span>
              {user?.role === 'USER' && (
                <NavLink
                  to="/notifications"
                  aria-label="Notification centre"
                  title="Notification centre"
                  className={({ isActive }) => `relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-glow'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-gold px-1.5 py-0.5 text-center text-[10px] font-black leading-4 text-bg">
                      {Math.min(unreadCount, 12)}
                    </span>
                  )}
                </NavLink>
              )}
              <button className="btn-ghost px-3 py-1.5" onClick={signOut}>Logout</button>
            </div>
          </div>
        </header>
        <main className="hero-grid mx-auto min-h-[calc(100vh-64px)] w-full max-w-[96rem] px-4 py-5 sm:px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
