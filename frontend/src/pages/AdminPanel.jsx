import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { getStats } from '../services/tournamentService';
import { money } from '../utils/format';


export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => { getStats().then(setStats).catch((err) => setMessage(err.message)); }, []);

  const createMaster = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/admin/master-controllers', staff);
      setMessage(response.data.message || 'Master Controller created');
      setStaff({ username: '', email: '', password: '' });
      getStats().then(setStats);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Admin Console</p>
        <h1 className="mt-2 text-3xl font-black">Players, controllers, master controllers, and revenue</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Total Controllers" value={stats?.totalControllers ?? 0} />
        <StatCard label="Master Controllers" value={stats?.totalMasterControllers ?? 0} />
        <StatCard label="Active Matches" value={stats?.activeMatches ?? 0} />
        <StatCard label="Total Deposits" value={money(stats?.totalDeposits)} />
        <StatCard label="Total Withdrawals" value={money(stats?.totalWithdrawals)} />
        <StatCard label="Platform Revenue" value={money(stats?.platformRevenue)} accent />
        <StatCard label="Reward Distribution" value={money(stats?.rewardDistribution)} />
      </section>

      <form className="panel grid gap-3 md:grid-cols-3" onSubmit={createMaster}>
        <h2 className="md:col-span-3 text-xl font-black">Create Master Controller</h2>
        <input className="input" placeholder="Username" value={staff.username} onChange={(e) => setStaff({ ...staff, username: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })} required />
        <button className="btn-primary md:col-span-3">Create Master Controller</button>
      </form>

      <Alert>{message}</Alert>

    </div>
  );
}
