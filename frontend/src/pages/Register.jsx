import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';
import { register, verifyOtp } from '../services/authService';


export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('register');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    gameUid: '',
    profileScreenshotUrl: '',
    upiId: '',
    email: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
    otp: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setForm((current) => ({ ...current, referralCode: ref }));
    }
  }, [searchParams]);

  const handlePhoto = (file) => {
    if (!file) return;
    if (file.size > 900000) {
      setError('Please upload an image below 900 KB for fast verification.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profileScreenshotUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const start = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register({
        username: form.username,
        gameUid: form.gameUid,
        profileScreenshotUrl: form.profileScreenshotUrl,
        upiId: form.upiId,
        email: form.email,
        password: form.password,
        referralCode: form.referralCode || null,
      });
      setMessage(data.message);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp({ email: form.email, otp: form.otp });
      setMessage(data.message);
      window.setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hero-glow hero-grid grid min-h-screen place-items-center px-4 py-8">
      <form onSubmit={step === 'register' ? start : verify} className="w-full max-w-xl rounded-[28px] border border-white/10 bg-card/85 p-7 shadow-glow backdrop-blur sm:p-9">
        <p className="text-sm font-bold text-ember">Registration OTP only</p>
        <h1 className="mt-2 text-4xl font-black">Create Player Account</h1>
        <div className="mt-6 space-y-3">
          {step === 'register' ? (
            <>
              <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={loading} />
              <input className="input" placeholder="Gaming UID - cannot be changed later" value={form.gameUid} onChange={(e) => setForm({ ...form, gameUid: e.target.value })} required disabled={loading} />
              <label className="block rounded-xl border border-white/10 bg-bg/80 px-3 py-3 text-sm text-slate-300">
                Upload game profile screenshot
                <input className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} required disabled={loading} />
              </label>
              {form.profileScreenshotUrl && <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-xs text-gold">Photo selected for verification</div>}
              <input className="input" placeholder="UPI ID" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} required disabled={loading} />
              <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={loading} />
              <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={loading} />
              <input className="input" placeholder="Referral Code (Optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} disabled={loading} />
            </>
          ) : (
            <input className="input" placeholder="6 digit OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required disabled={loading} />
          )}
          <Alert>{message}</Alert>
          <Alert type="error">{error}</Alert>
          <button className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              step === 'register' ? 'Send OTP' : 'Verify OTP'
            )}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-secondary">
          Ready? <Link className="text-ember" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
