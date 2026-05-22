import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { createHelpTicket, getMyHelpTickets } from '../services/tournamentService';
import { when } from '../utils/format';


export default function HelpCenter() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [data, setData] = useState({ items: [], page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState('');

  const load = (nextPage = page) => {
    getMyHelpTickets(nextPage)
      .then((res) => setData({
        items: Array.isArray(res?.items) ? res.items : [],
        page: Number.isFinite(res?.page) ? res.page : nextPage,
        totalPages: Number.isFinite(res?.totalPages) ? res.totalPages : 0,
        totalElements: Number.isFinite(res?.totalElements) ? res.totalElements : 0,
      }))
      .catch((err) => setMessage(err.message || 'Unable to load help tickets'));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await createHelpTicket(form);
      setForm({ subject: '', message: '' });
      setMessage('Help request submitted to Master Controller');
      load(0);
      setPage(0);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const canPrev = page > 0;
  const canNext = data.totalPages > 0 && page + 1 < data.totalPages;

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Player Help Centre</p>
        <h1 className="mt-2 text-3xl font-black">Tell Master Controller your problem</h1>
        <p className="mt-2 text-sm text-secondary">Submit payment, wallet, match, or account issues and track the response here.</p>
      </section>

      <Alert>{message}</Alert>

      <form className="panel space-y-3" onSubmit={submit}>
        <h2 className="text-xl font-black">New Help Request</h2>
        <input
          className="input"
          maxLength="120"
          placeholder="Problem subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <textarea
          className="input min-h-32 resize-y"
          maxLength="2000"
          placeholder="Explain your issue clearly"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <button className="btn-primary w-full sm:w-auto">Submit Problem</button>
      </form>

      <section className="panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Your Help Requests</h2>
            <p className="text-sm text-secondary">{data.totalElements} total requests</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <button className="btn-ghost px-3 py-1.5" disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
            <span>Page {data.totalPages ? data.page + 1 : 1} / {Math.max(data.totalPages, 1)}</span>
            <button className="btn-ghost px-3 py-1.5" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
        <div className="grid gap-3">
          {data.items.map((ticket) => (
            <article className="rounded-xl border border-white/10 bg-arena p-4" key={ticket.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black">{ticket.subject}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                  ticket.status === 'RESOLVED' || ticket.status === 'RESPONDED' ? 'bg-emerald-500/15 text-emerald-200' :
                  ticket.status === 'IN_REVIEW' ? 'bg-primary/15 text-purple-200' :
                  'bg-orange-500/15 text-orange-200'
                }`}>{ticket.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{ticket.message}</p>
              {ticket.masterResponse && (
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                  <b className="text-white">Master response</b>
                  <p className="mt-1 text-purple-100">{ticket.masterResponse}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">Updated {when(ticket.updatedAt)}</p>
            </article>
          ))}
          {!data.items.length && <p className="text-sm text-secondary">No help requests yet.</p>}
        </div>
      </section>
    </div>
  );
}
