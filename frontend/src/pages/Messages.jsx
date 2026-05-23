import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';
import { deleteConversation, getConversations, getMessages, sendMessage, markMessagesRead } from '../services/tournamentService';

export default function Messages() {
  const { user } = useAuth();
  const { data: conversations = [], loading, error, refresh } = useAsync(getConversations, []);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (selected) {
      loadMessages(selected.userId);
      // mark as read
      markMessagesRead(selected.userId).catch(() => {});
      // refresh conversations list to update unread counts
      refresh();
    }
  }, [selected]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages(userId) {
    try {
      const data = await getMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
    }
  }

  async function handleSend() {
    if (!selected || !text.trim()) return;
    const payload = { recipientId: selected.userId, content: text.trim() };
    setSending(true);
    try {
      await sendMessage(payload);
      setText('');
      await loadMessages(selected.userId);
      refresh();
    } catch (err) {
      // show nothing fancy for now
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteChat() {
    if (!selected) return;
    const confirmed = window.confirm('Delete all chat messages in this conversation?');
    if (!confirmed) return;

    try {
      await deleteConversation(selected.userId);
      setSelected(null);
      setMessages([]);
      setText('');
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-5">
      <section className="panel bg-gradient-to-r from-primary/20 via-card to-bg">
        <p className="text-sm font-bold text-gold">Player Messages</p>
        <h1 className="mt-2 text-3xl font-black">Messages</h1>
        <p className="mt-2 text-sm text-secondary">Conversations between players. Select a conversation to read and reply.</p>
      </section>

      {loading && <section className="panel text-center text-secondary">Loading conversations...</section>}
      {error && <section className="panel text-center text-red-400">{error}</section>}

      <div className="grid gap-4 md:grid-cols-3">
        <aside className="space-y-2">
          <div className="panel sticky top-20">
            <h3 className="font-black">Conversations</h3>
            {conversations.length === 0 && <p className="text-sm text-secondary mt-2">No conversations yet.</p>}
            <div className="mt-3 space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left rounded p-3 ${selected?.userId === c.userId ? 'bg-white/3' : 'bg-bg/10 hover:bg-white/5'}`}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">{c.username}</div>
                      <div className="text-xs text-secondary truncate">{c.lastMessage || ''}</div>
                    </div>
                    <div className="text-xs text-secondary text-right">
                      {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleString() : ''}
                      {c.hasUnread && <div className="mt-1 inline-block rounded-full bg-gold px-2 text-xs text-bg">New</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="md:col-span-2">
          {!selected ? (
            <div className="panel text-center">Select a conversation to view messages.</div>
          ) : (
            <div className="panel space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-black">{selected.username}</h3>
                  <p className="text-sm text-secondary">{selected.gameUid || ''}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    className="btn-ghost min-w-[140px]"
                    onClick={handleDeleteChat}
                    disabled={messages.length === 0}
                  >
                    Delete All Chat
                  </button>
                  <button
                    className="btn-ghost min-w-[120px]"
                    onClick={() => {
                      setSelected(null);
                      setMessages([]);
                      setText('');
                    }}
                  >
                    Close Chat
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto rounded bg-bg/70 p-3" ref={messagesRef}>
                <div className="flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 p-4 text-sm text-secondary">No messages yet. Send the first message to start the conversation.</div>
                  ) : messages.map((m) => {
                    const isCurrentUser = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[50%] rounded-2xl py-2 px-3.5 text-sm leading-5 ${isCurrentUser ? 'bg-primary/80 text-right text-white shadow-[0_10px_30px_rgba(139,92,246,0.32)]' : 'bg-white/5 text-left border border-white/10'} ${isCurrentUser ? 'animate-[pop_0.18s_ease-out]' : ''}`}>
                          <div className="break-words">{m.content}</div>
                          <div className="mt-1 text-[9px] text-slate-400">
                            {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2">
                <textarea className="input w-full" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply (max 10 words)..." />
                <div className="flex gap-2 mt-2">
                  <button className="btn-primary" onClick={handleSend} disabled={sending || text.trim().length === 0}>{sending ? 'Sending...' : 'Send'}</button>
                  <button className="btn-ghost" onClick={() => {
                    setSelected(null);
                    setMessages([]);
                    setText('');
                  }}>
                    Close Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
