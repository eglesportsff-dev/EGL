import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { completeWithdraw, getPendingWithdraws, masterRejectWithdraw } from '../services/tournamentService';
import { money, when } from '../utils/format';


export default function MasterWithdraws() {
  const [data, setData] = useState({ items: [], page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [refs, setRefs] = useState({});
  const [reasons, setReasons] = useState({});
  const [message, setMessage] = useState('');

  const load = (nextPage = page) => {
    setMessage('');
    getPendingWithdraws(nextPage)
      .then((res) => setData({
        items: Array.isArray(res?.items) ? res.items : [],
        page: Number.isFinite(res?.page) ? res.page : nextPage,
        totalPages: Number.isFinite(res?.totalPages) ? res.totalPages : 0,
        totalElements: Number.isFinite(res?.totalElements) ? res.totalElements : 0,
      }))
      .catch((err) => {
        setData((current) => ({ ...current, items: [] }));
        setMessage(err.message || 'Unable to load pending withdraws');
      });
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const complete = async (id) => {
    try {
      const res = await completeWithdraw({ requestId: id, transferReference: refs[id] || '' });
      setMessage(res.message);
      load(page);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const reject = async (id) => {
    try {
      const res = await masterRejectWithdraw({ requestId: id, rejectionReason: reasons[id] || '' });
      setMessage(res.message);
      load(page);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const rows = data.items;
  const canPrev = page > 0;
  const canNext = data.totalPages > 0 && page + 1 < data.totalPages;

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Master - Pending Withdraws</p>
        <h1 className="mt-2 text-3xl font-black">Confirm player payouts</h1>
        <p className="mt-2 text-sm text-secondary">Showing 8 requests per page.</p>
      </section>

      <Alert type={message?.toLowerCase().includes('unable') ? 'error' : 'info'}>{message}</Alert>

      <section className="panel overflow-x-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Pending Withdraw Requests</h2>
            <p className="text-sm text-secondary">{data.totalElements} total pending</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <button className="btn-ghost px-3 py-1.5" disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
            <span>Page {data.totalPages ? data.page + 1 : 1} / {Math.max(data.totalPages, 1)}</span>
            <button className="btn-ghost px-3 py-1.5" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>

        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-secondary">
            <tr>
              <th className="py-2">ID</th>
              <th>User</th>
              <th>UID</th>
              <th>Email</th>
              <th>UPI</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Transfer Ref</th>
              <th>Reject Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr className="border-t border-white/10" key={r.id}>
                <td className="py-3">{r.id}</td>
                <td>{r.username}</td>
                <td>{r.uid}</td>
                <td>{r.email}</td>
                <td>{r.upiId}</td>
                <td>{money(r.amount)}</td>
                <td><span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-bold text-purple-200">{r.status}</span></td>
                <td>{when(r.createdAt)}</td>
                <td>
                  <input
                    className="input"
                    value={refs[r.id] || ''}
                    onChange={(e) => setRefs({ ...refs, [r.id]: e.target.value })}
                    placeholder="Transfer reference"
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={reasons[r.id] || ''}
                    onChange={(e) => setReasons({ ...reasons, [r.id]: e.target.value })}
                    placeholder="Reason if rejected"
                  />
                </td>
                <td className="space-x-2 whitespace-nowrap">
                  <button className="btn-primary px-3 py-1.5" onClick={() => complete(r.id)}>Approve Paid</button>
                  <button className="btn-ghost px-3 py-1.5" onClick={() => reject(r.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length && <p className="p-5 text-center text-secondary">No pending withdraw requests.</p>}
      </section>
    </div>
  );
}
