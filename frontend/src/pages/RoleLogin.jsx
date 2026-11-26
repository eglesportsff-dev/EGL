import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/egl-logo.jpeg';


const roleCopy = {
  USER: {
    title: 'Player Login',
    eyebrow: 'Player arena access',
    body: 'Join matches, manage wallet, track qualification, and climb team rankings.',
    home: '/dashboard',
  },
  CONTROLLER: {
    title: 'Controller Login',
    eyebrow: 'Match operations desk',
    body: 'Create rooms, verify deposits, review withdrawals, and update match outcomes.',
    home: '/controller',
  },
  MASTER_CONTROLLER: {
    title: 'Master Controller Login',
    eyebrow: 'Payout and controller command',
    body: 'Manage controllers, upload payment QR, monitor payouts, and finalize withdrawals.',
    home: '/master',
  },
  ADMIN: {
    title: 'Admin Login',
    eyebrow: 'Platform owner console',
    body: 'Create master controllers, monitor revenue, users, withdrawals, and platform activity.',
    home: '/admin',
  },
};

export default function RoleLogin({ role = 'USER' }) {
  const copy = roleCopy[role];
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role === role) {
    return <Navigate to={copy.home} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await signIn(form);
      const allowed = data.role === role;
      if (!allowed) {
        setError(`This account is ${data.role}. Use the correct login page.`);
        return;
      }
      navigate(copy.home);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero-glow hero-grid grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-card/75 shadow-glow backdrop-blur md:grid-cols-[1fr_.9fr]">
        <div className="p-7 sm:p-10">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-black">
            <img className="h-12 w-12 rounded-2xl object-cover shadow-glow" src={logo} alt="EGL eSports" />
            EGL eSports
          </Link>
          <div className="mt-16">
            <p className="text-sm font-bold text-gold">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-secondary">{copy.body}</p>
          </div>
        </div>
        <form className="border-t border-white/10 bg-bg/70 p-7 sm:p-10 md:border-l md:border-t-0" onSubmit={submit}>
          <h2 className="text-2xl font-black">{copy.title}</h2>
          <p className="mt-2 text-sm text-secondary">Email and password only. OTP is never required during login.</p>
          <div className="mt-7 space-y-3">
            <input className="input" type="email" placeholder={`${copy.title} email`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Alert type="error">{error}</Alert>
            <button className="btn-fire w-full py-3 shadow-glow-fire" disabled={loading}>{loading ? 'Checking...' : copy.title}</button>
          </div>
          {role === 'USER' && <p className="mt-5 text-center text-sm text-secondary">New player? <Link className="text-fire-400 font-bold hover:underline" to="/register">Register Free Fire Account</Link></p>}
        </form>
      </section>
    </main>
  );
}
