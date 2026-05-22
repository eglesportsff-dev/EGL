import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { register, verifyOtp } from '../services/authService';


export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register');
  const [form, setForm] = useState({
    username: '',
    gameUid: '',
    profileScreenshotUrl: '',
    upiId: '',
    email: '',
    password: '',
    otp: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    try {
      const data = await register({
        username: form.username,
        gameUid: form.gameUid,
        profileScreenshotUrl: form.profileScreenshotUrl,
        upiId: form.upiId,
        email: form.email,
        password: form.password,
      });
      setMessage(data.message);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await verifyOtp({ email: form.email, otp: form.otp });
      setMessage(data.message);
      window.setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (err) {
      setError(err.message);
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
              <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              <input className="input" placeholder="Gaming UID - cannot be changed later" value={form.gameUid} onChange={(e) => setForm({ ...form, gameUid: e.target.value })} required />
              <label className="block rounded-xl border border-white/10 bg-bg/80 px-3 py-3 text-sm text-slate-300">
                Upload game profile screenshot
                <input className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} required />
              </label>
              {form.profileScreenshotUrl && <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-xs text-gold">Photo selected for verification</div>}
              <input className="input" placeholder="UPI ID" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} required />
              <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </>
          ) : (
            <input className="input" placeholder="6 digit OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
          )}
          <Alert>{message}</Alert>
          <Alert type="error">{error}</Alert>
          <button className="btn-primary w-full py-3">{step === 'register' ? 'Send OTP' : 'Verify OTP'}</button>
        </div>
        <p className="mt-5 text-center text-sm text-secondary">
          Ready? <Link className="text-ember" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
