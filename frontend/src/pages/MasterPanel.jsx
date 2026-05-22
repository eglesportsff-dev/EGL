import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getPendingDeposits, getPendingWithdraws, getStats, resetSeasonData, updateManualPoints, updatePaymentQr } from '../services/tournamentService';
import { money } from '../utils/format';


export default function MasterPanel() {
  const [staff, setStaff] = useState({ username: '', email: '', password: '' });
  const [qrPreview, setQrPreview] = useState('');
  const [stats, setStats] = useState({
    totalControllers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    rewardDistribution: 0,
  });
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetting, setResetting] = useState(false);
  const [manualPoints, setManualPoints] = useState({ playerUid: '', points: '' });
  const [pointsSaving, setPointsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadStats = async () => {
    const [dashboard, pendingDeposits, pendingWithdraws] = await Promise.all([
      getStats(),
      getPendingDeposits(0),
      getPendingWithdraws(0),
    ]);
    setStats({
      totalControllers: dashboard.totalControllers || 0,
      totalDeposits: dashboard.totalDeposits || 0,
      totalWithdrawals: dashboard.totalWithdrawals || 0,
      pendingDeposits: pendingDeposits.totalElements || 0,
      pendingWithdraws: pendingWithdraws.totalElements || 0,
      rewardDistribution: dashboard.rewardDistribution || 0,
    });
  };

  useEffect(() => {
    loadStats().catch((err) => setMessage(err.message || 'Unable to load master stats'));
  }, []);

  const createController = async (event) => {
    event.preventDefault();
    try {
      await api.post('/master/controllers', staff);
      setMessage('Controller created');
      setStaff({ username: '', email: '', password: '' });
      loadStats().catch(() => {});
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleQr = (file) => {
    if (!file) return;
    if (file.size > 900000) {
      setMessage('Please upload a QR image below 900 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQrPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const saveQr = async () => {
    try {
      const res = await updatePaymentQr({ qrCodeUrl: qrPreview });
      setQrPreview(res.qrCodeUrl);
      setMessage('Payment QR updated for user deposits');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const resetSeason = async () => {
    if (resetConfirm !== 'RESET') return;
    setResetting(true);
    try {
      const res = await resetSeasonData();
      setResetConfirm('');
      setMessage(`${res.message} Users reset: ${res.usersReset}. Teams reset: ${res.teamsReset}.`);
      loadStats().catch(() => {});
    } catch (err) {
      setMessage(err.message);
    } finally {
      setResetting(false);
    }
  };

  const submitManualPoints = async (event) => {
    event.preventDefault();
    if (!manualPoints.playerUid.trim() || manualPoints.points === '') {
      setMessage('Enter player Gaming UID and points.');
      return;
    }
    setPointsSaving(true);
    try {
      const res = await updateManualPoints({
        playerUid: manualPoints.playerUid.trim(),
        points: Number(manualPoints.points),
      });
      setMessage(res.message);
      setManualPoints({ playerUid: '', points: '' });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPointsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Master Controller Console</p>
        <h1 className="mt-2 text-3xl font-black">Controllers, deposits, withdraws, and QR setup</h1>
      </section>
      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active Controllers" value={stats.totalControllers} accent />
        <StatCard label="Total Deposits" value={money(stats.totalDeposits)} />
        <StatCard label="Total Withdrawals" value={money(stats.totalWithdrawals)} />
        <StatCard label="Pending Deposits" value={stats.pendingDeposits} />
        <StatCard label="Pending Withdraws" value={stats.pendingWithdraws} />
        <StatCard label="Reward Distribution" value={money(stats.rewardDistribution)} />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Link className="panel block hover:border-primary" to="/master/deposits">
          <p className="text-sm font-bold text-gold">Pending Deposits Request</p>
          <h2 className="mt-2 text-2xl font-black">Verify player UTR requests</h2>
        </Link>
        <Link className="panel block hover:border-primary" to="/master/withdraws">
          <p className="text-sm font-bold text-gold">Pending Withdraw Request</p>
          <h2 className="mt-2 text-2xl font-black">Confirm forwarded payouts</h2>
        </Link>
      </section>
      <form className="panel grid gap-3 md:grid-cols-3" onSubmit={createController}>
        <h2 className="md:col-span-3 text-xl font-black">Create Controller</h2>
        <input className="input" placeholder="Username" value={staff.username} onChange={(e) => setStaff({ ...staff, username: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })} required />
        <button className="btn-primary md:col-span-3">Create</button>
      </form>
      <div className="panel space-y-3">
        <h2 className="text-xl font-black">Payment QR</h2>
        <input className="input" type="file" accept="image/*" onChange={(e) => handleQr(e.target.files?.[0])} />
        {qrPreview && <img className="h-48 w-48 rounded-xl border border-white/10 object-cover" src={qrPreview} alt="Payment QR" />}
        <button className="btn-primary" type="button" disabled={!qrPreview} onClick={saveQr}>Upload QR</button>
      </div>
      <form className="panel grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={submitManualPoints}>
        <div className="md:col-span-3">
          <p className="text-sm font-bold text-gold">Manual Tournament Points</p>
          <h2 className="mt-1 text-xl font-black">Update qualified player points</h2>
          <p className="mt-2 text-sm text-secondary">Enter player Gaming UID and points. Leaderboard updates instantly in descending order.</p>
        </div>
        <input
          className="input"
          placeholder="Player Gaming UID"
          value={manualPoints.playerUid}
          onChange={(e) => setManualPoints({ ...manualPoints, playerUid: e.target.value })}
        />
        <input
          className="input"
          type="number"
          min="0"
          step="1"
          placeholder="Points"
          value={manualPoints.points}
          onChange={(e) => setManualPoints({ ...manualPoints, points: e.target.value })}
        />
        <button className="btn-primary" type="submit" disabled={pointsSaving}>
          {pointsSaving ? 'Updating...' : 'Update Points'}
        </button>
      </form>
      <div className="panel space-y-3 border-red-500/30">
        <div>
          <p className="text-sm font-bold text-red-200">Master Reset</p>
          <h2 className="mt-1 text-xl font-black">Reset winning points and leaderboard</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            This clears only player winning points and team leaderboard points. Matches, joined match records,
            controller review history, wallet balances, users, deposits, and withdraw requests stay safe.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input"
            placeholder="Type RESET to enable"
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
          />
          <button
            className="btn-ghost border-red-500/40 text-red-100 hover:border-red-400 hover:bg-red-500/10"
            type="button"
            disabled={resetConfirm !== 'RESET' || resetting}
            onClick={resetSeason}
          >
            {resetting ? 'Resetting...' : 'MASTER RESET'}
          </button>
        </div>
      </div>
      <Alert>{message}</Alert>
    </div>
  );
}
