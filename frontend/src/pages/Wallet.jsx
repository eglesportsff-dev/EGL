import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { deposit, getDepositQr, getProfile, withdraw } from '../services/tournamentService';


export default function Wallet() {
  const { user } = useAuth();
  const [dep, setDep] = useState({ amount: '', utrNumber: '' });
  const [wd, setWd] = useState({ upiId: '', userUid: user?.uid || '', amount: '' });
  const [profile, setProfile] = useState(null);
  const [qr, setQr] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setWd((current) => ({ ...current, upiId: data.upiId || '', userUid: data.uid || '' }));
      })
      .catch((err) => setMessage(err.message));
    getDepositQr().then((data) => setQr(data.qrCodeUrl || '')).catch(() => {});
  }, []);

  const submitDeposit = async (event) => {
    event.preventDefault();
    try {
      const res = await deposit({ ...dep, amount: Number(dep.amount) });
      setMessage(res.message);
      setDep({ amount: '', utrNumber: '' });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitWithdraw = async (event) => {
    event.preventDefault();
    try {
      const res = await withdraw({ ...wd, amount: Number(wd.amount) });
      setMessage(res.message);
      setWd((current) => ({ ...current, amount: '' }));
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form className="panel space-y-3" onSubmit={submitDeposit}>
        <h1 className="text-xl font-black">Deposit</h1>
        {qr ? (
          <img className="mx-auto h-56 w-56 rounded-xl border border-white/10 object-cover" src={qr} alt="Deposit QR" />
        ) : (
          <div className="rounded-xl border border-dashed border-ember/50 bg-arena p-6 text-center text-sm text-slate-300">
            Payment QR will appear here after Master Controller uploads it.
          </div>
        )}
        <input className="input" type="number" min="12" max="2000" placeholder="Amount ₹12 - ₹2000" value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} required />
        <input className="input" placeholder="UTR Number after Payment Done" value={dep.utrNumber} onChange={(e) => setDep({ ...dep, utrNumber: e.target.value })} required />
        <button className="btn-primary w-full">Payment Done</button>
      </form>
      <form className="panel space-y-3" onSubmit={submitWithdraw}>
        <h1 className="text-xl font-black">Withdraw</h1>
        <input className="input" placeholder="UPI ID" value={wd.upiId} onChange={(e) => setWd({ ...wd, upiId: e.target.value })} required />
        <input className="input" placeholder="User UID" value={wd.userUid} readOnly />
        <input className="input" value={profile?.username || user?.username || ''} readOnly />
        <input className="input" type="number" min="50" placeholder="Withdrawal amount (min ₹50)" value={wd.amount} onChange={(e) => setWd({ ...wd, amount: e.target.value })} required />
        <button className="btn-primary w-full">Submit Withdrawal</button>
      </form>
      <div className="md:col-span-2"><Alert>{message}</Alert></div>
    </div>
  );
}
