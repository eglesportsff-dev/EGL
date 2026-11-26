import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, resetPassword } from '../services/authService';
import logo from '../assets/nexus-logo.jpg';

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

  // Modes: 'LOGIN' | 'FORGOT' | 'RESET'
  const [view, setView] = useState('LOGIN');
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role === role) {
    return <Navigate to={copy.home} replace />;
  }

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await signIn(form);
      const allowed = data.role === role;
      if (!allowed) {
        setError(`This account is ${data.role}. Use the correct login page.`);
        return;
      }
      navigate(copy.home);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (forgotEmail || form.email || '').trim();
    if (!targetEmail) {
      setError('Please enter your registered Gmail address.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await forgotPassword({ email: targetEmail });
      setForgotEmail(targetEmail);
      setMessage(res?.message || 'Password reset OTP has been sent to your registered Gmail.');
      setView('RESET');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Could not send reset OTP. Check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code received on your Gmail.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await resetPassword({
        email: forgotEmail.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setMessage(res?.message || 'Password reset successfully! Please log in with your new password.');
      setForm((prev) => ({ ...prev, email: forgotEmail.trim(), password: '' }));
      setView('LOGIN');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero-glow hero-grid grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-card/75 shadow-glow backdrop-blur md:grid-cols-[1fr_.9fr]">
        <div className="p-7 sm:p-10">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-black">
            <img className="h-12 w-12 rounded-2xl object-cover shadow-glow" src={logo} alt="Nexus eSports" />
            Nexus eSports
          </Link>
          <div className="mt-16">
            <p className="text-sm font-bold text-gold">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-secondary">{copy.body}</p>
          </div>
        </div>

        {view === 'LOGIN' && (
          <form className="border-t border-white/10 bg-bg/70 p-7 sm:p-10 md:border-l md:border-t-0" onSubmit={submitLogin}>
            <h2 className="text-2xl font-black">{copy.title}</h2>
            <p className="mt-2 text-sm text-secondary">Email and password only. OTP is never required during normal login.</p>
            {message && <div className="mt-4"><Alert type="success">{message}</Alert></div>}
            <div className="mt-7 space-y-3">
              <input
                className="input"
                type="email"
                placeholder={`${copy.title} email`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView('FORGOT');
                    setError('');
                    setMessage('');
                    setForgotEmail(form.email || '');
                  }}
                  className="text-xs font-semibold text-secondary hover:text-gold transition"
                >
                  Forgot password?
                </button>
              </div>
              <Alert type="error">{error}</Alert>
              <button className="btn-fire w-full py-3 shadow-glow-fire" disabled={loading}>
                {loading ? 'Checking...' : copy.title}
              </button>
            </div>
            {role === 'USER' && (
              <p className="mt-5 text-center text-sm text-secondary">
                New player? <Link className="text-fire-400 font-bold hover:underline" to="/register">Register Free Fire Account</Link>
              </p>
            )}
          </form>
        )}

        {view === 'FORGOT' && (
          <form className="border-t border-white/10 bg-bg/70 p-7 sm:p-10 md:border-l md:border-t-0" onSubmit={handleRequestOtp}>
            <div className="inline-block rounded-full bg-fire-500/10 px-3 py-1 text-xs font-bold text-gold uppercase tracking-wider">
              Account Recovery
            </div>
            <h2 className="mt-3 text-2xl font-black">Reset Password</h2>
            <p className="mt-2 text-sm text-secondary">
              Enter your registered Gmail address. We will send a 6-digit OTP code to reset your password.
            </p>
            {message && <div className="mt-4"><Alert type="success">{message}</Alert></div>}
            <div className="mt-7 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">Registered Gmail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Alert type="error">{error}</Alert>
              <button className="btn-fire w-full py-3 shadow-glow-fire" disabled={loading}>
                {loading ? 'Sending OTP to Gmail...' : 'Send Reset OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('LOGIN');
                  setError('');
                  setMessage('');
                }}
                className="btn-secondary w-full py-2.5 text-xs font-bold"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {view === 'RESET' && (
          <form className="border-t border-white/10 bg-bg/70 p-7 sm:p-10 md:border-l md:border-t-0" onSubmit={handleResetPassword}>
            <div className="inline-block rounded-full bg-fire-500/10 px-3 py-1 text-xs font-bold text-gold uppercase tracking-wider">
              Verify & Set Password
            </div>
            <h2 className="mt-3 text-2xl font-black">Enter OTP & New Password</h2>
            <p className="mt-2 text-sm text-secondary">
              OTP has been sent to <span className="text-white font-semibold">{forgotEmail}</span>. Check your inbox or spam folder.
            </p>
            {message && <div className="mt-4"><Alert type="success">{message}</Alert></div>}
            <div className="mt-7 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">6-Digit OTP Code</label>
                <input
                  className="input tracking-widest text-center text-lg font-bold"
                  type="text"
                  maxLength="6"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">New Password (min 8 characters)</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRequestOtp}
                  className="text-gold hover:underline font-semibold"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('FORGOT');
                    setError('');
                    setMessage('');
                  }}
                  className="text-secondary hover:underline"
                >
                  Change email
                </button>
              </div>
              <Alert type="error">{error}</Alert>
              <button className="btn-fire w-full py-3 shadow-glow-fire" disabled={loading}>
                {loading ? 'Updating Password...' : 'Reset & Save Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('LOGIN');
                  setError('');
                  setMessage('');
                }}
                className="btn-secondary w-full py-2.5 text-xs font-bold"
              >
                Cancel & Back to Login
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
