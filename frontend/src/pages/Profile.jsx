import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import { getProfile, updateProfile } from '../services/tournamentService';
import { money } from '../utils/format';


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setUpiId(data.upiId || '');
      })
      .catch((err) => setMessage(err.message));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const data = await updateProfile({ upiId });
      setProfile(data);
      setMessage('UPI ID updated');
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!profile) return <Alert>{message || 'Loading profile...'}</Alert>;
  const screenshot = profile.profileScreenshotUrl || '';
  const canPreview = screenshot.startsWith('http') || screenshot.startsWith('data:image/');

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet" value={money(profile.walletBalance)} accent />
        <StatCard label="Winning Points" value={money(profile.winningPoints)} />
        <StatCard label="Role" value={profile.role} />
        <StatCard label="Email Verified" value={profile.emailVerified ? 'Yes' : 'No'} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="panel">
          <h1 className="text-xl font-black">Game Profile Screenshot</h1>
          {canPreview ? (
            <img className="mt-3 aspect-video w-full rounded-xl border border-line object-cover" src={screenshot} alt="Game profile" />
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-line bg-arena p-6 text-sm text-slate-400">No screenshot preview available</div>
          )}
        </div>
        <form className="panel space-y-3" onSubmit={save}>
          <h1 className="text-xl font-black">Player Profile</h1>
          {[
            ['Name', profile.username],
            ['App UID', profile.uid],
            ['Gaming UID', profile.gameUid],
            ['Email', profile.email],
            ['Password', profile.passwordStatus],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-bg/70 p-3">
              <p className="text-xs uppercase tracking-wide text-secondary">{label}</p>
              <p className="mt-1 break-words font-semibold">{value || 'Not available'}</p>
            </div>
          ))}
          <label className="block text-sm text-slate-300">
            Editable UPI ID
            <input className="input mt-1" value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
          </label>
          <button className="btn-primary w-full sm:w-auto">Save UPI ID</button>
          <Alert>{message}</Alert>
        </form>
      </section>
    </div>
  );
}
