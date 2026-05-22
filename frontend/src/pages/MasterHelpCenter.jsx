import { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { getMasterHelpTickets, respondHelpTicket, sendUpdateToPlayers } from '../services/tournamentService';
import { when } from '../utils/format';

export default function MasterHelpCenter() {
  const [data, setData] = useState({ items: [], page: 0, totalPages: 0, totalElements: 0 });
  const [page, setPage] = useState(0);
  const [updateForm, setUpdateForm] = useState({ title: 'Master Update', message: '' });
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [responses, setResponses] = useState({});
  const [statuses, setStatuses] = useState({});
  const [message, setMessage] = useState('');

  const load = (nextPage = page) => {
    getMasterHelpTickets(nextPage)
      .then((res) => setData({
        items: Array.isArray(res?.items) ? res.items : [],
        page: Number.isFinite(res?.page) ? res.page : nextPage,
        totalPages: Number.isFinite(res?.totalPages) ? res.totalPages : 0,
        totalElements: Number.isFinite(res?.totalElements) ? res.totalElements : 0,
      }))
      .catch((err) => setMessage(err.message || 'Unable to load help requests'));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const respond = async (ticketId) => {
    try {
      const res = await respondHelpTicket({
        ticketId,
        response: responses[ticketId] || '',
        status: statuses[ticketId] || 'RESPONDED',
      });
      setMessage(`Response sent for ticket #${res.id}`);
      setResponses({ ...responses, [ticketId]: '' });
      load(page);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateWordCount = updateForm.message.trim() ? updateForm.message.trim().split(/\s+/).length : 0;
  const updateTooLong = updateWordCount >= 500;

  const sendUpdate = async (event) => {
    event.preventDefault();
    if (updateTooLong) {
      setMessage('Update message must be less than 500 words.');
      return;
    }
    setSendingUpdate(true);
    try {
      const res = await sendUpdateToPlayers({
        title: updateForm.title.trim(),
        message: updateForm.message.trim(),
      });
      setMessage(`Update sent to all players: ${res.title}`);
      setUpdateForm({ title: 'Master Update', message: '' });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSendingUpdate(false);
    }
  };

  const canPrev = page > 0;
  const canNext = data.totalPages > 0 && page + 1 < data.totalPages;

  return (
    <div className="space-y-4">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Master Help Centre</p>
        <h1 className="mt-2 text-3xl font-black">Verify user problems and respond</h1>
        <p className="mt-2 text-sm text-secondary">Review 8 tickets per page and send clear responses to players.</p>
      </section>

      <Alert>{message}</Alert>

      <form className="panel space-y-3" onSubmit={sendUpdate}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gold">Player Updates</p>
            <h2 className="mt-1 text-xl font-black">Send note notification</h2>
            <p className="mt-2 text-sm text-secondary">Newest 5 updates are visible to players.</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${updateTooLong ? 'bg-red-500/15 text-red-200' : 'bg-primary/15 text-purple-200'}`}>
            {updateWordCount}/499 words
          </span>
        </div>
        <input
          className="input"
          maxLength="120"
          placeholder="Update title"
          value={updateForm.title}
          onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
          required
        />
        <textarea
          className="input min-h-36 resize-y"
          maxLength="4000"
          placeholder="Write update for all players"
          value={updateForm.message}
          onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
          required
        />
        <button
          className="btn-primary w-full sm:w-auto"
          disabled={sendingUpdate || updateTooLong || !updateForm.title.trim() || !updateForm.message.trim()}
        >
          {sendingUpdate ? 'Sending...' : 'Send Updates To All Players'}
        </button>
      </form>

      <section className="panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Player Help Requests</h2>
            <p className="text-sm text-secondary">{data.totalElements} total tickets</p>
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
                <div>
                  <h3 className="font-black">#{ticket.id} {ticket.subject}</h3>
                  <p className="text-sm text-secondary">{ticket.username} - {ticket.uid} - {ticket.email}</p>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-bold text-purple-200">{ticket.status}</span>
              </div>
              <p className="mt-3 rounded-lg bg-bg/70 p-3 text-sm text-slate-200">{ticket.message}</p>
              {ticket.masterResponse && <p className="mt-2 text-sm text-emerald-200">Last response: {ticket.masterResponse}</p>}
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_auto]">
                <input
                  className="input"
                  placeholder="Write response to user"
                  value={responses[ticket.id] || ''}
                  onChange={(e) => setResponses({ ...responses, [ticket.id]: e.target.value })}
                />
                <select
                  className="input"
                  value={statuses[ticket.id] || 'RESPONDED'}
                  onChange={(e) => setStatuses({ ...statuses, [ticket.id]: e.target.value })}
                >
                  <option value="IN_REVIEW">In Review</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <button className="btn-primary px-4" onClick={() => respond(ticket.id)}>Send</button>
              </div>
              <p className="mt-3 text-xs text-slate-500">Created {when(ticket.createdAt)} - Updated {when(ticket.updatedAt)}</p>
            </article>
          ))}
          {!data.items.length && <p className="text-sm text-secondary">No help requests yet.</p>}
        </div>
      </section>
    </div>
  );
}
